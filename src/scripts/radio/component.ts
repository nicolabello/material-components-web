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

import {MDCComponent} from './../base/component';
import {applyPassive} from './../dom/events';
import {MDCRippleAdapter} from './../ripple/adapter';
import {MDCRipple} from './../ripple/component';
import {MDCRippleFoundation} from './../ripple/foundation';
import {MDCRippleCapableSurface} from './../ripple/types';
import {MDCRadioAdapter} from './adapter';
import {MDCRadioFoundation} from './foundation';

export class MDCRadio extends MDCComponent<MDCRadioFoundation> implements MDCRippleCapableSurface {
  static attachTo(root: Element) {
    return new MDCRadio(root);
  }

  get checked(): boolean {
    return this.nativeControl_.checked;
  }

  set checked(checked: boolean) {
    this.nativeControl_.checked = checked;
  }

  get disabled() {
    return this.nativeControl_.disabled;
  }

  set disabled(disabled: boolean) {
    this.foundation_.setDisabled(disabled);
  }

  get value() {
    return this.nativeControl_.value;
  }

  set value(value: string) {
    this.nativeControl_.value = value;
  }

  get ripple(): MDCRipple {
    return this.ripple_;
  }

  // Public visibility for this property is required by MDCRippleCapableSurface.
  root_!: Element; // assigned in MDCComponent constructor

  private readonly ripple_: MDCRipple = this.createRipple_();

  destroy() {
    this.ripple_.destroy();
    super.destroy();
  }

  getDefaultFoundation() {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    const adapter: MDCRadioAdapter = {
      addClass: (className) => this.root_.classList.add(className),
      removeClass: (className) => this.root_.classList.remove(className),
      setNativeControlDisabled: (disabled) => this.nativeControl_.disabled = disabled,
    };
    return new MDCRadioFoundation(adapter);
  }

  private createRipple_(): MDCRipple {
    // DO NOT INLINE this variable. For backward compatibility, foundations take a Partial<MDCFooAdapter>.
    // To ensure we don't accidentally omit any methods, we need a separate, strongly typed adapter variable.
    // tslint:disable:object-literal-sort-keys Methods should be in the same order as the adapter interface.
    const adapter: MDCRippleAdapter = {
      ...MDCRipple.createAdapter(this),
      registerInteractionHandler: (evtType, handler) => this.nativeControl_.addEventListener(
        evtType, handler, applyPassive()),
      deregisterInteractionHandler: (evtType, handler) => this.nativeControl_.removeEventListener(
        evtType, handler, applyPassive()),
      // Radio buttons technically go "active" whenever there is *any* keyboard interaction.
      // This is not the UI we desire.
      isSurfaceActive: () => false,
      isUnbounded: () => true,
    };
    // tslint:enable:object-literal-sort-keys
    return new MDCRipple(this.root_, new MDCRippleFoundation(adapter));
  }

  private get nativeControl_(): HTMLInputElement {
    const {NATIVE_CONTROL_SELECTOR} = MDCRadioFoundation.strings;
    const el = this.root_.querySelector<HTMLInputElement>(NATIVE_CONTROL_SELECTOR);
    if (!el) {
      throw new Error(`Radio component requires a ${NATIVE_CONTROL_SELECTOR} element`);
    }
    return el;
  }
}
