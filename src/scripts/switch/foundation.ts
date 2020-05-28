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

import {MDCFoundation} from './../base/foundation';
import {MDCSwitchAdapter} from './adapter';
import {cssClasses, strings} from './constants';

export class MDCSwitchFoundation extends MDCFoundation<MDCSwitchAdapter> {
  /** The string constants used by the switch. */
  static get strings() {
    return strings;
  }

  /** The CSS classes used by the switch. */
  static get cssClasses() {
    return cssClasses;
  }

  /** The default Adapter for the switch. */
  static get defaultAdapter(): MDCSwitchAdapter {
    return {
      addClass: () => undefined,
      removeClass: () => undefined,
      setNativeControlChecked: () => undefined,
      setNativeControlDisabled: () => undefined,
      setNativeControlAttr: () => undefined,
    };
  }

  constructor(adapter?: Partial<MDCSwitchAdapter>) {
    super({...MDCSwitchFoundation.defaultAdapter, ...adapter});
  }

  /** Sets the checked state of the switch. */
  setChecked(checked: boolean) {
    this.adapter.setNativeControlChecked(checked);
    this.updateAriaChecked_(checked);
    this.updateCheckedStyling_(checked);
  }

  /** Sets the disabled state of the switch. */
  setDisabled(disabled: boolean) {
    this.adapter.setNativeControlDisabled(disabled);
    if (disabled) {
      this.adapter.addClass(cssClasses.DISABLED);
    } else {
      this.adapter.removeClass(cssClasses.DISABLED);
    }
  }

  /** Handles the change event for the switch native control. */
  handleChange(evt: Event) {
    const nativeControl = evt.target as HTMLInputElement;
    this.updateAriaChecked_(nativeControl.checked);
    this.updateCheckedStyling_(nativeControl.checked);
  }

  /** Updates the styling of the switch based on its checked state. */
  private updateCheckedStyling_(checked: boolean) {
    if (checked) {
      this.adapter.addClass(cssClasses.CHECKED);
    } else {
      this.adapter.removeClass(cssClasses.CHECKED);
    }
  }

  private updateAriaChecked_(checked: boolean) {
    this.adapter.setNativeControlAttr(
        strings.ARIA_CHECKED_ATTR, `${!!checked}`);
  }
}

// tslint:disable-next-line:no-default-export Needed for backward compatibility with MDC Web v0.44.0 and earlier.
export default MDCSwitchFoundation;
