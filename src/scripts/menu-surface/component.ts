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
import {SpecificEventListener} from './../base/types';
import {MDCMenuSurfaceAdapter} from './adapter';
import {Corner, cssClasses, strings} from './constants';
import {MDCMenuSurfaceFoundation} from './foundation';
import {MDCMenuDistance} from './types';
import * as util from './util';

type RegisterFunction = () => void;

export type MDCMenuSurfaceFactory = (el: Element, foundation?: MDCMenuSurfaceFoundation) => MDCMenuSurface;

export class MDCMenuSurface extends MDCComponent<MDCMenuSurfaceFoundation> {
  static attachTo(root: Element): MDCMenuSurface {
    return new MDCMenuSurface(root);
  }

  anchorElement!: Element | null; // assigned in initialSyncWithDOM()

  protected root_!: HTMLElement; // assigned in MDCComponent constructor

  private previousFocus_?: HTMLElement | SVGElement | null;

  private handleKeydown_!: SpecificEventListener<'keydown'>; // assigned in initialSyncWithDOM()
  private handleBodyClick_!: SpecificEventListener<'click'>; // assigned in initialSyncWithDOM()

  private registerBodyClickListener_!: RegisterFunction; // assigned in initialSyncWithDOM()
  private deregisterBodyClickListener_!: RegisterFunction; // assigned in initialSyncWithDOM()

  initialSyncWithDOM() {
    const parentEl = this.root_.parentElement;
    this.anchorElement = parentEl && parentEl.classList.contains(cssClasses.ANCHOR) ? parentEl : null;

    if (this.root_.classList.contains(cssClasses.FIXED)) {
      this.setFixedPosition(true);
    }

    this.handleKeydown_ = (evt) => this.foundation_.handleKeydown(evt);
    this.handleBodyClick_ = (evt) => this.foundation_.handleBodyClick(evt);

    // capture so that no race between handleBodyClick and quickOpen when
    // menusurface opened on button click which registers this listener
    this.registerBodyClickListener_ = () => document.body.addEventListener(
        'click', this.handleBodyClick_, {capture: true});
    this.deregisterBodyClickListener_ = () => document.body.removeEventListener('click', this.handleBodyClick_);

    this.listen('keydown', this.handleKeydown_);
    this.listen(strings.OPENED_EVENT, this.registerBodyClickListener_);
    this.listen(strings.CLOSED_EVENT, this.deregisterBodyClickListener_);
  }

  destroy() {
    this.unlisten('keydown', this.handleKeydown_);
    this.unlisten(strings.OPENED_EVENT, this.registerBodyClickListener_);
    this.unlisten(strings.CLOSED_EVENT, this.deregisterBodyClickListener_);
    super.destroy();
  }

  isOpen(): boolean {
    return this.foundation_.isOpen();
  }

  open() {
    this.foundation_.open();
  }

  close(skipRestoreFocus = false) {
    this.foundation_.close(skipRestoreFocus);
  }

  set quickOpen(quickOpen: boolean) {
    this.foundation_.setQuickOpen(quickOpen);
  }

  /** Sets the foundation to use page offsets for an positioning when the menu is hoisted to the body. */
  setIsHoisted(isHoisted: boolean) {
    this.foundation_.setIsHoisted(isHoisted);
  }

  /** Sets the element that the menu-surface is anchored to. */
  setMenuSurfaceAnchorElement(element: Element) {
    this.anchorElement = element;
  }

  /** Sets the menu-surface to position: fixed. */
  setFixedPosition(isFixed: boolean) {
    if (isFixed) {
      this.root_.classList.add(cssClasses.FIXED);
    } else {
      this.root_.classList.remove(cssClasses.FIXED);
    }

    this.foundation_.setFixedPosition(isFixed);
  }

  /** Sets the absolute x/y position to position based on. Requires the menu to be hoisted. */
  setAbsolutePosition(x: number, y: number) {
    this.foundation_.setAbsolutePosition(x, y);
    this.setIsHoisted(true);
  }

  /**
   * @param corner Default anchor corner alignment of top-left surface corner.
   */
  setAnchorCorner(corner: Corner) {
    this.foundation_.setAnchorCorner(corner);
  }

  setAnchorMargin(margin: Partial<MDCMenuDistance>) {
    this.foundation_.setAnchorMargin(margin);
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCMenuSurfaceAdapter = {
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      hasClass: (className) => this.root_.classList.contains(className),
      hasAnchor: () => !!this.anchorElement,
      notifyClose: () => this.emit(MDCMenuSurfaceFoundation.strings.CLOSED_EVENT, {}),
      notifyOpen: () => this.emit(MDCMenuSurfaceFoundation.strings.OPENED_EVENT, {}),
      isElementInContainer: (el) => this.root_.contains(el),
      isRtl: () => getComputedStyle(this.root_).getPropertyValue('direction') === 'rtl',
      setTransformOrigin: (origin) => {
        const propertyName = `${util.getTransformPropertyName(window)}-origin`;
        this.root_.style.setProperty(propertyName, origin);
      },

      isFocused: () => document.activeElement === this.root_,
      saveFocus: () => {
        this.previousFocus_ = document.activeElement as HTMLElement | SVGElement | null;
      },
      restoreFocus: () => {
        if (this.root_.contains(document.activeElement)) {
          if (this.previousFocus_ && this.previousFocus_.focus) {
            this.previousFocus_.focus();
          }
        }
      },

      getInnerDimensions: () => {
        return {width: this.root_.offsetWidth, height: this.root_.offsetHeight};
      },
      getAnchorDimensions: () => this.anchorElement ? this.anchorElement.getBoundingClientRect() : null,
      getWindowDimensions: () => {
        return {width: window.innerWidth, height: window.innerHeight};
      },
      getBodyDimensions: () => {
        return {width: document.body.clientWidth, height: document.body.clientHeight};
      },
      getWindowScroll: () => {
        return {x: window.pageXOffset, y: window.pageYOffset};
      },
      setPosition: (position) => {
        this.root_.style.left = 'left' in position ? `${position.left}px` : '';
        this.root_.style.right = 'right' in position ? `${position.right}px` : '';
        this.root_.style.top = 'top' in position ? `${position.top}px` : '';
        this.root_.style.bottom = 'bottom' in position ? `${position.bottom}px` : '';
      },
      setMaxHeight: (height) => {
        this.root_.style.maxHeight = height;
      },
    };
    // tslint:enable:object-literal-sort-keys
    return new MDCMenuSurfaceFoundation(adapter);
  }
}
