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

// TODO(b/152410470): Remove trailing underscores from private properties
// tslint:disable:strip-private-property-underscore

import {MDCComponent} from './../base/component';
import {CustomEventListener, SpecificEventListener} from './../base/types';
import {closest} from './../dom/ponyfill';
import {MDCList, MDCListFactory} from './../list/component';
import {numbers as listConstants} from './../list/constants';
import {MDCListFoundation} from './../list/foundation';
import {MDCListActionEvent, MDCListIndex} from './../list/types';
import {MDCMenuSurface, MDCMenuSurfaceFactory} from './../menu-surface/component';
import {Corner} from './../menu-surface/constants';
import {MDCMenuSurfaceFoundation} from './../menu-surface/foundation';
import {MDCMenuDistance} from './../menu-surface/types';
import {MDCMenuAdapter} from './adapter';
import {cssClasses, DefaultFocusState, strings} from './constants';
import {MDCMenuFoundation} from './foundation';
import {MDCMenuItemComponentEventDetail} from './types';

export type MDCMenuFactory = (el: Element, foundation?: MDCMenuFoundation) => MDCMenu;

export class MDCMenu extends MDCComponent<MDCMenuFoundation> {
  static attachTo(root: Element) {
    return new MDCMenu(root);
  }

  private menuSurfaceFactory_!: MDCMenuSurfaceFactory; // assigned in initialize()
  private listFactory_!: MDCListFactory; // assigned in initialize()

  private menuSurface_!: MDCMenuSurface; // assigned in initialSyncWithDOM()
  private list_!: MDCList | null; // assigned in initialSyncWithDOM()

  private handleKeydown_!: SpecificEventListener<'keydown'>; // assigned in initialSyncWithDOM()
  private handleItemAction_!: CustomEventListener<MDCListActionEvent>; // assigned in initialSyncWithDOM()
  private handleMenuSurfaceOpened_!: EventListener; // assigned in initialSyncWithDOM()

  initialize(
      menuSurfaceFactory: MDCMenuSurfaceFactory = (el) => new MDCMenuSurface(el),
      listFactory: MDCListFactory = (el) => new MDCList(el)) {
    this.menuSurfaceFactory_ = menuSurfaceFactory;
    this.listFactory_ = listFactory;
  }

  initialSyncWithDOM() {
    this.menuSurface_ = this.menuSurfaceFactory_(this.root);

    const list = this.root.querySelector(strings.LIST_SELECTOR);
    if (list) {
      this.list_ = this.listFactory_(list);
      this.list_.wrapFocus = true;
    } else {
      this.list_ = null;
    }

    this.handleKeydown_ = (evt) => this.foundation.handleKeydown(evt);
    this.handleItemAction_ = (evt) =>
        this.foundation.handleItemAction(this.items[evt.detail.index]);
    this.handleMenuSurfaceOpened_ = () =>
        this.foundation.handleMenuSurfaceOpened();

    this.menuSurface_.listen(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.handleMenuSurfaceOpened_);
    this.listen('keydown', this.handleKeydown_);
    this.listen(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
  }

  destroy() {
    if (this.list_) {
      this.list_.destroy();
    }

    this.menuSurface_.destroy();
    this.menuSurface_.unlisten(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, this.handleMenuSurfaceOpened_);
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten(MDCListFoundation.strings.ACTION_EVENT, this.handleItemAction_);
    super.destroy();
  }

  get open(): boolean {
    return this.menuSurface_.isOpen();
  }

  set open(value: boolean) {
    if (value) {
      this.menuSurface_.open();
    } else {
      this.menuSurface_.close();
    }
  }

  get wrapFocus(): boolean {
    return this.list_ ? this.list_.wrapFocus : false;
  }

  set wrapFocus(value: boolean) {
    if (this.list_) {
      this.list_.wrapFocus = value;
    }
  }

  /**
   * Sets whether the menu has typeahead functionality.
   * @param value Whether typeahead is enabled.
   */
  set hasTypeahead(value: boolean) {
    if (this.list_) {
      this.list_.hasTypeahead = value;
    }
  }

  /**
   * @return Whether typeahead logic is currently matching some user prefix.
   */
  get typeaheadInProgress() {
    return this.list_ ? this.list_.typeaheadInProgress : false;
  }

  /**
   * Given the next desired character from the user, adds it to the typeahead
   * buffer. Then, attempts to find the next option matching the buffer. Wraps
   * around if at the end of options.
   *
   * @param nextChar The next character to add to the prefix buffer.
   * @param startingIndex The index from which to start matching. Only relevant
   *     when starting a new match sequence. To start a new match sequence,
   *     clear the buffer using `clearTypeaheadBuffer`, or wait for the buffer
   *     to clear after a set interval defined in list foundation. Defaults to
   *     the currently focused index.
   * @return The index of the matched item, or -1 if no match.
   */
  typeaheadMatchItem(nextChar: string, startingIndex?: number): number {
    if (this.list_) {
      return this.list_.typeaheadMatchItem(nextChar, startingIndex);
    }
    return -1;
  }

  /**
   * Layout the underlying list element in the case of any dynamic updates
   * to its structure.
   */
  layout() {
    if (this.list_) {
      this.list_.layout();
    }
  }

  /**
   * Return the items within the menu. Note that this only contains the set of elements within
   * the items container that are proper list items, and not supplemental / presentational DOM
   * elements.
   */
  get items(): Element[] {
    return this.list_ ? this.list_.listElements : [];
  }

  /**
   * Turns on/off the underlying list's single selection mode. Used mainly
   * by select menu.
   *
   * @param singleSelection Whether to enable single selection mode.
   */
  set singleSelection(singleSelection: boolean) {
    if (this.list_) {
      this.list_.singleSelection = singleSelection;
    }
  }

  /**
   * Retrieves the selected index. Only applicable to select menus.
   * @return The selected index, which is a number for single selection and
   *     radio lists, and an array of numbers for checkbox lists.
   */
  get selectedIndex(): MDCListIndex {
    return this.list_ ? this.list_.selectedIndex : listConstants.UNSET_INDEX;
  }

  /**
   * Sets the selected index of the list. Only applicable to select menus.
   * @param index The selected index, which is a number for single selection and
   *     radio lists, and an array of numbers for checkbox lists.
   */
  set selectedIndex(index: MDCListIndex) {
    if (this.list_) {
      this.list_.selectedIndex = index;
    }
  }

  set quickOpen(quickOpen: boolean) {
    this.menuSurface_.quickOpen = quickOpen;
  }

  /**
   * Sets default focus state where the menu should focus every time when menu
   * is opened. Focuses the list root (`DefaultFocusState.LIST_ROOT`) element by
   * default.
   * @param focusState Default focus state.
   */
  setDefaultFocusState(focusState: DefaultFocusState) {
    this.foundation.setDefaultFocusState(focusState);
  }

  /**
   * @param corner Default anchor corner alignment of top-left menu corner.
   */
  setAnchorCorner(corner: Corner) {
    this.menuSurface_.setAnchorCorner(corner);
  }

  setAnchorMargin(margin: Partial<MDCMenuDistance>) {
    this.menuSurface_.setAnchorMargin(margin);
  }

  /**
   * Sets the list item as the selected row at the specified index.
   * @param index Index of list item within menu.
   */
  setSelectedIndex(index: number) {
    this.foundation.setSelectedIndex(index);
  }

  /**
   * Sets the enabled state to isEnabled for the menu item at the given index.
   * @param index Index of the menu item
   * @param isEnabled The desired enabled state of the menu item.
   */
  setEnabled(index: number, isEnabled: boolean): void {
    this.foundation.setEnabled(index, isEnabled);
  }

  /**
   * @return The item within the menu at the index specified.
   */
  getOptionByIndex(index: number): Element | null {
    const items = this.items;

    if (index < items.length) {
      return this.items[index];
    } else {
      return null;
    }
  }

  /**
   * @param index A menu item's index.
   * @return The primary text within the menu at the index specified.
   */
  getPrimaryTextAtIndex(index: number): string {
    const item = this.getOptionByIndex(index);
    if (item && this.list_) {
      return this.list_.getPrimaryText(item) || '';
    }
    return '';
  }

  setFixedPosition(isFixed: boolean) {
    this.menuSurface_.setFixedPosition(isFixed);
  }

  setIsHoisted(isHoisted: boolean) {
    this.menuSurface_.setIsHoisted(isHoisted);
  }

  setAbsolutePosition(x: number, y: number) {
    this.menuSurface_.setAbsolutePosition(x, y);
  }

  /**
   * Sets the element that the menu-surface is anchored to.
   */
  setAnchorElement(element: Element) {
    this.menuSurface_.anchorElement = element;
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCMenuAdapter = {
      addClassToElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.add(className);
      },
      removeClassFromElementAtIndex: (index, className) => {
        const list = this.items;
        list[index].classList.remove(className);
      },
      addAttributeToElementAtIndex: (index, attr, value) => {
        const list = this.items;
        list[index].setAttribute(attr, value);
      },
      removeAttributeFromElementAtIndex: (index, attr) => {
        const list = this.items;
        list[index].removeAttribute(attr);
      },
      elementContainsClass: (element, className) =>
          element.classList.contains(className),
      closeSurface: (skipRestoreFocus: boolean) =>
          this.menuSurface_.close(skipRestoreFocus),
      getElementIndex: (element) => this.items.indexOf(element),
      notifySelected: (evtData) =>
          this.emit<MDCMenuItemComponentEventDetail>(strings.SELECTED_EVENT, {
            index: evtData.index,
            item: this.items[evtData.index],
          }),
      getMenuItemCount: () => this.items.length,
      focusItemAtIndex: (index) => (this.items[index] as HTMLElement).focus(),
      focusListRoot: () =>
          (this.root.querySelector(strings.LIST_SELECTOR) as HTMLElement)
              .focus(),
      isSelectableItemAtIndex: (index) =>
          !!closest(this.items[index], `.${cssClasses.MENU_SELECTION_GROUP}`),
      getSelectedSiblingOfItemAtIndex: (index) => {
        const selectionGroupEl = closest(this.items[index], `.${cssClasses.MENU_SELECTION_GROUP}`) as HTMLElement;
        const selectedItemEl = selectionGroupEl.querySelector(`.${cssClasses.MENU_SELECTED_LIST_ITEM}`);
        return selectedItemEl ? this.items.indexOf(selectedItemEl) : -1;
      },
    };
    // tslint:enable:object-literal-sort-keys
    return new MDCMenuFoundation(adapter);
  }
}
