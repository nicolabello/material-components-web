/**
 * @license
 * Copyright 2016 Google Inc.
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

import {MDCComponent} from './../../base/component';
import {SpecificEventListener} from './../../base/types';
import {MDCRippleAdapter} from './../../ripple/adapter';
import {MDCRipple, MDCRippleFactory} from './../../ripple/component';
import {MDCRippleFoundation} from './../../ripple/foundation';
import {MDCRippleCapableSurface} from './../../ripple/types';
import {MDCChipAdapter} from './adapter';
import {strings} from './constants';
import {MDCChipFoundation} from './foundation';
import {MDCChipInteractionEventDetail, MDCChipNavigationEventDetail, MDCChipRemovalEventDetail,
    MDCChipSelectionEventDetail} from './types';

type InteractionType = 'click' | 'keydown';

const INTERACTION_EVENTS: InteractionType[] = ['click', 'keydown'];

export type MDCChipFactory = (el: Element, foundation?: MDCChipFoundation) => MDCChip;

export class MDCChip extends MDCComponent<MDCChipFoundation> implements MDCRippleCapableSurface {
  /**
   * @return Whether the chip is selected.
   */
  get selected(): boolean {
    return this.foundation_.isSelected();
  }

  /**
   * Sets selected state on the chip.
   */
  set selected(selected: boolean) {
    this.foundation_.setSelected(selected);
  }

  /**
   * @return Whether a trailing icon click should trigger exit/removal of the chip.
   */
  get shouldRemoveOnTrailingIconClick(): boolean {
    return this.foundation_.getShouldRemoveOnTrailingIconClick();
  }

  /**
   * Sets whether a trailing icon click should trigger exit/removal of the chip.
   */
  set shouldRemoveOnTrailingIconClick(shouldRemove: boolean) {
    this.foundation_.setShouldRemoveOnTrailingIconClick(shouldRemove);
  }

  get ripple(): MDCRipple {
    return this.ripple_;
  }

  get id(): string {
    return this.root_.id;
  }

  static attachTo(root: Element) {
    return new MDCChip(root);
  }

  // Public visibility for this property is required by MDCRippleCapableSurface.
  root_!: HTMLElement; // assigned in MDCComponent constructor

  private leadingIcon_!: Element | null; // assigned in initialize()
  private trailingIcon_!: Element | null; // assigned in initialize()
  private checkmark_!: Element | null; // assigned in initialize()
  private ripple_!: MDCRipple; // assigned in initialize()
  private primaryAction_!: Element | null; // assigned in initialize()
  private trailingAction_!: Element | null; // assigned in initialize()

  private handleInteraction_!: SpecificEventListener<InteractionType>; // assigned in initialSyncWithDOM()
  private handleTransitionEnd_!: SpecificEventListener<'transitionend'>; // assigned in initialSyncWithDOM()
  private handleTrailingIconInteraction_!: SpecificEventListener<InteractionType>; // assigned in initialSyncWithDOM()
  private handleKeydown_!: SpecificEventListener<'keydown'>; // assigned in initialSyncWithDOM()
  private handleFocusIn_!:
      SpecificEventListener<'focusin'>;  // assigned in initialSyncWIthDOM()
  private handleFocusOut_!:
      SpecificEventListener<'focusout'>;  // assigned in initialSyncWIthDOM()

  initialize(rippleFactory: MDCRippleFactory = (el, foundation) => new MDCRipple(el, foundation)) {
    this.leadingIcon_ = this.root_.querySelector(strings.LEADING_ICON_SELECTOR);
    this.trailingIcon_ = this.root_.querySelector(strings.TRAILING_ICON_SELECTOR);
    this.checkmark_ = this.root_.querySelector(strings.CHECKMARK_SELECTOR);
    this.primaryAction_ = this.root_.querySelector(strings.PRIMARY_ACTION_SELECTOR);
    this.trailingAction_ = this.root_.querySelector(strings.TRAILING_ACTION_SELECTOR);

    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const rippleAdapter: MDCRippleAdapter = {
      ...MDCRipple.createAdapter(this),
      computeBoundingRect: () => this.foundation_.getDimensions(),
    };
    this.ripple_ = rippleFactory(this.root_, new MDCRippleFoundation(rippleAdapter));
  }

  initialSyncWithDOM() {
    this.handleInteraction_ = (evt: MouseEvent | KeyboardEvent) => this.foundation_.handleInteraction(evt);
    this.handleTransitionEnd_ = (evt: TransitionEvent) => this.foundation_.handleTransitionEnd(evt);
    this.handleTrailingIconInteraction_ = (evt: MouseEvent | KeyboardEvent) =>
        this.foundation_.handleTrailingIconInteraction(evt);
    this.handleKeydown_ = (evt: KeyboardEvent) => this.foundation_.handleKeydown(evt);
    this.handleFocusIn_ = (evt: FocusEvent) => {
      this.foundation_.handleFocusIn(evt);
    };
    this.handleFocusOut_ = (evt: FocusEvent) => {
      this.foundation_.handleFocusOut(evt);
    };

    INTERACTION_EVENTS.forEach((evtType) => {
      this.listen(evtType, this.handleInteraction_);
    });
    this.listen('transitionend', this.handleTransitionEnd_);
    this.listen('keydown', this.handleKeydown_);
    this.listen('focusin', this.handleFocusIn_);
    this.listen('focusout', this.handleFocusOut_);

    if (this.trailingIcon_) {
      INTERACTION_EVENTS.forEach((evtType) => {
        this.trailingIcon_!.addEventListener(evtType, this.handleTrailingIconInteraction_ as EventListener);
      });
    }
  }

  destroy() {
    this.ripple_.destroy();

    INTERACTION_EVENTS.forEach((evtType) => {
      this.unlisten(evtType, this.handleInteraction_);
    });
    this.unlisten('transitionend', this.handleTransitionEnd_);
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten('focusin', this.handleFocusIn_);
    this.unlisten('focusout', this.handleFocusOut_);

    if (this.trailingIcon_) {
      INTERACTION_EVENTS.forEach((evtType) => {
        this.trailingIcon_!.removeEventListener(evtType, this.handleTrailingIconInteraction_ as EventListener);
      });
    }

    super.destroy();
  }

  /**
   * Begins the exit animation which leads to removal of the chip.
   */
  beginExit() {
    this.foundation_.beginExit();
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const adapter: MDCChipAdapter = {
      addClass: (className) => this.root_.classList.add(className),
      addClassToLeadingIcon: (className) => {
        if (this.leadingIcon_) {
          this.leadingIcon_.classList.add(className);
        }
      },
      eventTargetHasClass: (target, className) =>
          target ? (target as Element).classList.contains(className) : false,
      focusPrimaryAction: () => {
        if (this.primaryAction_) {
          (this.primaryAction_ as HTMLElement).focus();
        }
      },
      focusTrailingAction: () => {
        if (this.trailingAction_) {
          (this.trailingAction_ as HTMLElement).focus();
        }
      },
      getAttribute: (attr) => this.root_.getAttribute(attr),
      getCheckmarkBoundingClientRect: () =>
          this.checkmark_ ? this.checkmark_.getBoundingClientRect() : null,
      getComputedStyleValue: (propertyName) =>
          window.getComputedStyle(this.root_).getPropertyValue(propertyName),
      getRootBoundingClientRect: () => this.root_.getBoundingClientRect(),
      hasClass: (className) => this.root_.classList.contains(className),
      hasLeadingIcon: () => !!this.leadingIcon_,
      hasTrailingAction: () => !!this.trailingAction_,
      isRTL: () =>
          window.getComputedStyle(this.root_).getPropertyValue('direction') ===
          'rtl',
      notifyInteraction: () => this.emit<MDCChipInteractionEventDetail>(
          strings.INTERACTION_EVENT, {chipId: this.id},
          true /* shouldBubble */),
      notifyNavigation: (key, source) =>
          this.emit<MDCChipNavigationEventDetail>(
              strings.NAVIGATION_EVENT, {chipId: this.id, key, source},
              true /* shouldBubble */),
      notifyRemoval: (removedAnnouncement) => {
        this.emit<MDCChipRemovalEventDetail>(
            strings.REMOVAL_EVENT, {chipId: this.id, removedAnnouncement},
            true /* shouldBubble */);
      },
      notifySelection: (selected, shouldIgnore) =>
          this.emit<MDCChipSelectionEventDetail>(
              strings.SELECTION_EVENT,
              {chipId: this.id, selected, shouldIgnore},
              true /* shouldBubble */),
      notifyTrailingIconInteraction: () =>
          this.emit<MDCChipInteractionEventDetail>(
              strings.TRAILING_ICON_INTERACTION_EVENT, {chipId: this.id},
              true /* shouldBubble */),
      removeClass: (className) => this.root_.classList.remove(className),
      removeClassFromLeadingIcon: (className) => {
        if (this.leadingIcon_) {
          this.leadingIcon_.classList.remove(className);
        }
      },
      setPrimaryActionAttr: (attr, value) => {
        if (this.primaryAction_) {
          this.primaryAction_.setAttribute(attr, value);
        }
      },
      setStyleProperty: (propertyName, value) =>
          this.root_.style.setProperty(propertyName, value),
      setTrailingActionAttr: (attr, value) => {
        if (this.trailingAction_) {
          this.trailingAction_.setAttribute(attr, value);
        }
      },
    };
    return new MDCChipFoundation(adapter);
  }

  setSelectedFromChipSet(selected: boolean, shouldNotifyClients: boolean) {
    this.foundation_.setSelectedFromChipSet(selected, shouldNotifyClients);
  }

  focusPrimaryAction() {
    this.foundation_.focusPrimaryAction();
  }

  focusTrailingAction() {
    this.foundation_.focusTrailingAction();
  }

  removeFocus() {
    this.foundation_.removeFocus();
  }

  remove() {
    const parent = this.root_.parentNode;
    if (parent !== null) {
      parent.removeChild(this.root_);
    }
  }
}
