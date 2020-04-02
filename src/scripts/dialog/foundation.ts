/**
 * @license
 * Copyright 2017 Google Inc.
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

import {MDCFoundation} from './../base/foundation';
import {MDCDialogAdapter} from './adapter';
import {cssClasses, numbers, strings} from './constants';

export class MDCDialogFoundation extends MDCFoundation<MDCDialogAdapter> {
  static get cssClasses() {
    return cssClasses;
  }

  static get strings() {
    return strings;
  }

  static get numbers() {
    return numbers;
  }

  static get defaultAdapter(): MDCDialogAdapter {
    return {
      addBodyClass: () => undefined,
      addClass: () => undefined,
      areButtonsStacked: () => false,
      clickDefaultButton: () => undefined,
      eventTargetMatches: () => false,
      getActionFromEvent: () => '',
      getInitialFocusEl: () => null,
      hasClass: () => false,
      isContentScrollable: () => false,
      notifyClosed: () => undefined,
      notifyClosing: () => undefined,
      notifyOpened: () => undefined,
      notifyOpening: () => undefined,
      releaseFocus: () => undefined,
      removeBodyClass: () => undefined,
      removeClass: () => undefined,
      reverseButtons: () => undefined,
      trapFocus: () => undefined,
    };
  }

  private isOpen_ = false;
  private animationFrame_ = 0;
  private animationTimer_ = 0;
  private layoutFrame_ = 0;
  private escapeKeyAction_ = strings.CLOSE_ACTION;
  private scrimClickAction_ = strings.CLOSE_ACTION;
  private autoStackButtons_ = true;
  private areButtonsStacked_ = false;

  constructor(adapter?: Partial<MDCDialogAdapter>) {
    super({...MDCDialogFoundation.defaultAdapter, ...adapter});
  }

  init() {
    if (this.adapter_.hasClass(cssClasses.STACKED)) {
      this.setAutoStackButtons(false);
    }
  }

  destroy() {
    if (this.isOpen_) {
      this.close(strings.DESTROY_ACTION);
    }

    if (this.animationTimer_) {
      clearTimeout(this.animationTimer_);
      this.handleAnimationTimerEnd_();
    }

    if (this.layoutFrame_) {
      cancelAnimationFrame(this.layoutFrame_);
      this.layoutFrame_ = 0;
    }
  }

  open() {
    this.isOpen_ = true;
    this.adapter_.notifyOpening();
    this.adapter_.addClass(cssClasses.OPENING);

    // Wait a frame once display is no longer "none", to establish basis for animation
    this.runNextAnimationFrame_(() => {
      this.adapter_.addClass(cssClasses.OPEN);
      this.adapter_.addBodyClass(cssClasses.SCROLL_LOCK);

      this.layout();

      this.animationTimer_ = setTimeout(() => {
        this.handleAnimationTimerEnd_();
        this.adapter_.trapFocus(this.adapter_.getInitialFocusEl());
        this.adapter_.notifyOpened();
      }, numbers.DIALOG_ANIMATION_OPEN_TIME_MS);
    });
  }

  close(action = '') {
    if (!this.isOpen_) {
      // Avoid redundant close calls (and events), e.g. from keydown on elements that inherently emit click
      return;
    }

    this.isOpen_ = false;
    this.adapter_.notifyClosing(action);
    this.adapter_.addClass(cssClasses.CLOSING);
    this.adapter_.removeClass(cssClasses.OPEN);
    this.adapter_.removeBodyClass(cssClasses.SCROLL_LOCK);

    cancelAnimationFrame(this.animationFrame_);
    this.animationFrame_ = 0;

    clearTimeout(this.animationTimer_);
    this.animationTimer_ = setTimeout(() => {
      this.adapter_.releaseFocus();
      this.handleAnimationTimerEnd_();
      this.adapter_.notifyClosed(action);
    }, numbers.DIALOG_ANIMATION_CLOSE_TIME_MS);
  }

  isOpen() {
    return this.isOpen_;
  }

  getEscapeKeyAction(): string {
    return this.escapeKeyAction_;
  }

  setEscapeKeyAction(action: string) {
    this.escapeKeyAction_ = action;
  }

  getScrimClickAction(): string {
    return this.scrimClickAction_;
  }

  setScrimClickAction(action: string) {
    this.scrimClickAction_ = action;
  }

  getAutoStackButtons(): boolean {
    return this.autoStackButtons_;
  }

  setAutoStackButtons(autoStack: boolean) {
    this.autoStackButtons_ = autoStack;
  }

  layout() {
    if (this.layoutFrame_) {
      cancelAnimationFrame(this.layoutFrame_);
    }
    this.layoutFrame_ = requestAnimationFrame(() => {
      this.layoutInternal_();
      this.layoutFrame_ = 0;
    });
  }

  /** Handles click on the dialog root element. */
  handleClick(evt: MouseEvent) {
    const isScrim = this.adapter_.eventTargetMatches(evt.target, strings.SCRIM_SELECTOR);
    // Check for scrim click first since it doesn't require querying ancestors.
    if (isScrim && this.scrimClickAction_ !== '') {
      this.close(this.scrimClickAction_);
    } else {
      const action = this.adapter_.getActionFromEvent(evt);
      if (action) {
        this.close(action);
      }
    }
  }

  /** Handles keydown on the dialog root element. */
  handleKeydown(evt: KeyboardEvent) {
    const isEnter = evt.key === 'Enter' || evt.keyCode === 13;
    if (!isEnter) {
      return;
    }
    const action = this.adapter_.getActionFromEvent(evt);
    if (action) {
      // Action button callback is handled in `handleClick`,
      // since space/enter keydowns on buttons trigger click events.
      return;
    }

    const isDefault = !this.adapter_.eventTargetMatches(
        evt.target, strings.SUPPRESS_DEFAULT_PRESS_SELECTOR);
    if (isEnter && isDefault) {
      this.adapter_.clickDefaultButton();
    }
  }

  /** Handles keydown on the document. */
  handleDocumentKeydown(evt: KeyboardEvent) {
    const isEscape = evt.key === 'Escape' || evt.keyCode === 27;
    if (isEscape && this.escapeKeyAction_ !== '') {
      this.close(this.escapeKeyAction_);
    }
  }

  private layoutInternal_() {
    if (this.autoStackButtons_) {
      this.detectStackedButtons_();
    }
    this.detectScrollableContent_();
  }

  private handleAnimationTimerEnd_() {
    this.animationTimer_ = 0;
    this.adapter_.removeClass(cssClasses.OPENING);
    this.adapter_.removeClass(cssClasses.CLOSING);
  }

  /**
   * Runs the given logic on the next animation frame, using setTimeout to factor in Firefox reflow behavior.
   */
  private runNextAnimationFrame_(callback: () => void) {
    cancelAnimationFrame(this.animationFrame_);
    this.animationFrame_ = requestAnimationFrame(() => {
      this.animationFrame_ = 0;
      clearTimeout(this.animationTimer_);
      this.animationTimer_ = setTimeout(callback, 0);
    });
  }

  private detectStackedButtons_() {
    // Remove the class first to let us measure the buttons' natural positions.
    this.adapter_.removeClass(cssClasses.STACKED);

    const areButtonsStacked = this.adapter_.areButtonsStacked();

    if (areButtonsStacked) {
      this.adapter_.addClass(cssClasses.STACKED);
    }

    if (areButtonsStacked !== this.areButtonsStacked_) {
      this.adapter_.reverseButtons();
      this.areButtonsStacked_ = areButtonsStacked;
    }
  }

  private detectScrollableContent_() {
    // Remove the class first to let us measure the natural height of the content.
    this.adapter_.removeClass(cssClasses.SCROLLABLE);
    if (this.adapter_.isContentScrollable()) {
      this.adapter_.addClass(cssClasses.SCROLLABLE);
    }
  }
}

// tslint:disable-next-line:no-default-export Needed for backward compatibility with MDC Web v0.44.0 and earlier.
export default MDCDialogFoundation;
