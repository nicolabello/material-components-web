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
import {MDCRipple} from './../ripple/component';
import {MDCIconButtonToggleAdapter} from './adapter';
import {MDCIconButtonToggleFoundation} from './foundation';
import {MDCIconButtonToggleEventDetail} from './types';

const {strings} = MDCIconButtonToggleFoundation;

export class MDCIconButtonToggle extends MDCComponent<MDCIconButtonToggleFoundation> {
  static attachTo(root: HTMLElement) {
    return new MDCIconButtonToggle(root);
  }

  protected root_!: HTMLElement; // assigned in MDCComponent constructor

  private readonly rippleComponent: MDCRipple = this.createRipple();
  private handleClick!:
      SpecificEventListener<'click'>;  // assigned in initialSyncWithDOM()

  initialSyncWithDOM() {
    this.handleClick = () => {
      this.foundation_.handleClick();
    };
    this.listen('click', this.handleClick);
  }

  destroy() {
    this.unlisten('click', this.handleClick);
    this.ripple.destroy();
    super.destroy();
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const adapter: MDCIconButtonToggleAdapter = {
      addClass: (className) => this.root_.classList.add(className),
      hasClass: (className) => this.root_.classList.contains(className),
      notifyChange: (evtData) => {
        this.emit<MDCIconButtonToggleEventDetail>(
            strings.CHANGE_EVENT, evtData);
      },
      removeClass: (className) => this.root_.classList.remove(className),
      getAttr: (attrName) => this.root_.getAttribute(attrName),
      setAttr: (attrName, attrValue) =>
          this.root_.setAttribute(attrName, attrValue),
    };
    return new MDCIconButtonToggleFoundation(adapter);
  }

  get ripple(): MDCRipple {
    return this.rippleComponent;
  }

  get on(): boolean {
    return this.foundation_.isOn();
  }

  set on(isOn: boolean) {
    this.foundation_.toggle(isOn);
  }

  private createRipple(): MDCRipple {
    const ripple = new MDCRipple(this.root_);
    ripple.unbounded = true;
    return ripple;
  }
}
