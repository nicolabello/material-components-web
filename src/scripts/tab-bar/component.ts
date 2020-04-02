/**
 * @license
 * Copyright 2018 Google Inc.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

import {MDCComponent} from './../base/component';
import {CustomEventListener, SpecificEventListener} from './../base/types';
import {MDCTabScroller, MDCTabScrollerFactory} from './../tab-scroller/component';
import {MDCTab, MDCTabFactory} from './../tab/component';
import {MDCTabFoundation} from './../tab/foundation';
import {MDCTabInteractionEvent} from './../tab/types';
import {MDCTabBarAdapter} from './adapter';
import {MDCTabBarFoundation} from './foundation';
import {MDCTabBarActivatedEventDetail} from './types';

const {strings} = MDCTabBarFoundation;

let tabIdCounter = 0;

export class MDCTabBar extends MDCComponent<MDCTabBarFoundation> {
  static attachTo(root: Element): MDCTabBar {
    return new MDCTabBar(root);
  }

  private tabList_!: MDCTab[]; // assigned in initialize()
  private tabScroller_!: MDCTabScroller | null; // assigned in initialize()
  private handleTabInteraction_!: CustomEventListener<MDCTabInteractionEvent>; // assigned in initialSyncWithDOM()
  private handleKeyDown_!: SpecificEventListener<'keydown'>; // assigned in initialSyncWithDOM()

  set focusOnActivate(focusOnActivate: boolean) {
    this.tabList_.forEach((tab) => tab.focusOnActivate = focusOnActivate);
  }

  set useAutomaticActivation(useAutomaticActivation: boolean) {
    this.foundation_.setUseAutomaticActivation(useAutomaticActivation);
  }

  initialize(
      tabFactory: MDCTabFactory = (el) => new MDCTab(el),
      tabScrollerFactory: MDCTabScrollerFactory = (el) => new MDCTabScroller(el),
  ) {
    this.tabList_ = this.instantiateTabs_(tabFactory);
    this.tabScroller_ = this.instantiateTabScroller_(tabScrollerFactory);
  }

  initialSyncWithDOM() {
    this.handleTabInteraction_ = (evt) => this.foundation_.handleTabInteraction(evt);
    this.handleKeyDown_ = (evt) => this.foundation_.handleKeyDown(evt);

    this.listen(MDCTabFoundation.strings.INTERACTED_EVENT, this.handleTabInteraction_);
    this.listen('keydown', this.handleKeyDown_);

    for (let i = 0; i < this.tabList_.length; i++) {
      if (this.tabList_[i].active) {
        this.scrollIntoView(i);
        break;
      }
    }
  }

  destroy() {
    super.destroy();
    this.unlisten(MDCTabFoundation.strings.INTERACTED_EVENT, this.handleTabInteraction_);
    this.unlisten('keydown', this.handleKeyDown_);
    this.tabList_.forEach((tab) => tab.destroy());

    if (this.tabScroller_) {
      this.tabScroller_.destroy();
    }
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCTabBarAdapter = {
      scrollTo: (scrollX) => this.tabScroller_!.scrollTo(scrollX),
      incrementScroll: (scrollXIncrement) => this.tabScroller_!.incrementScroll(scrollXIncrement),
      getScrollPosition: () => this.tabScroller_!.getScrollPosition(),
      getScrollContentWidth: () => this.tabScroller_!.getScrollContentWidth(),
      getOffsetWidth: () => (this.root_ as HTMLElement).offsetWidth,
      isRTL: () => window.getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
      setActiveTab: (index) => this.foundation_.activateTab(index),
      activateTabAtIndex: (index, clientRect) => this.tabList_[index].activate(clientRect),
      deactivateTabAtIndex: (index) => this.tabList_[index].deactivate(),
      focusTabAtIndex: (index) => this.tabList_[index].focus(),
      getTabIndicatorClientRectAtIndex: (index) => this.tabList_[index].computeIndicatorClientRect(),
      getTabDimensionsAtIndex: (index) => this.tabList_[index].computeDimensions(),
      getPreviousActiveTabIndex: () => {
        for (let i = 0; i < this.tabList_.length; i++) {
          if (this.tabList_[i].active) {
            return i;
          }
        }
        return -1;
      },
      getFocusedTabIndex: () => {
        const tabElements = this.getTabElements_();
        const activeElement = document.activeElement!;
        return tabElements.indexOf(activeElement);
      },
      getIndexOfTabById: (id) => {
        for (let i = 0; i < this.tabList_.length; i++) {
          if (this.tabList_[i].id === id) {
            return i;
          }
        }
        return -1;
      },
      getTabListLength: () => this.tabList_.length,
      notifyTabActivated: (index) =>
          this.emit<MDCTabBarActivatedEventDetail>(strings.TAB_ACTIVATED_EVENT, {index}, true),
    };
    // tslint:enable:object-literal-sort-keys
    return new MDCTabBarFoundation(adapter);
  }

  /**
   * Activates the tab at the given index
   * @param index The index of the tab
   */
  activateTab(index: number) {
    this.foundation_.activateTab(index);
  }

  /**
   * Scrolls the tab at the given index into view
   * @param index THe index of the tab
   */
  scrollIntoView(index: number) {
    this.foundation_.scrollIntoView(index);
  }

  /**
   * Returns all the tab elements in a nice clean array
   */
  private getTabElements_(): Element[] {
    return [].slice.call(this.root_.querySelectorAll(strings.TAB_SELECTOR));
  }

  /**
   * Instantiates tab components on all child tab elements
   */
  private instantiateTabs_(tabFactory: MDCTabFactory) {
    return this.getTabElements_().map((el) => {
      el.id = el.id || `mdc-tab-${++tabIdCounter}`;
      return tabFactory(el);
    });
  }

  /**
   * Instantiates tab scroller component on the child tab scroller element
   */
  private instantiateTabScroller_(tabScrollerFactory: MDCTabScrollerFactory): MDCTabScroller | null {
    const tabScrollerElement = this.root_.querySelector(strings.TAB_SCROLLER_SELECTOR);
    if (tabScrollerElement) {
      return tabScrollerFactory(tabScrollerElement);
    }
    return null;
  }
}
