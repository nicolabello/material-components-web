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

import {ActionType, FocusBehavior} from '../action/constants';
import {Attributes, CssClasses, Events} from './constants';

/**
 * Defines the shape of the adapter expected by the foundation.
 * Implement this adapter for your framework of choice to delegate updates to
 * the component in your framework of choice. See architecture documentation
 * for more details.
 * https://github.com/material-components/material-components-web/blob/master/docs/code/architecture.md
 */
export interface MDCChipAdapter {
  /** Adds the given class to the root element. */
  addClass(className: CssClasses): void;

  /** Emits the given event with the given detail. */
  emitEvent<D extends object>(eventName: Events, eventDetail: D): void;

  /** Returns the child actions provided by the chip. */
  getActions(): ActionType[];

  /** Returns the value for the given attribute, if it exists. */
  getAttribute(attrName: Attributes): string|null;

  /** Returns the ID of the root element. */
  getElementID(): string;

  /** Returns the offset width of the root element. */
  getOffsetWidth(): number;

  /** Returns true if the root element has the given class. */
  hasClass(className: CssClasses): boolean;

  /** Proxies to the MDCChipAction#isSelectable method. */
  isActionSelectable(action: ActionType): boolean;

  /** Proxies to the MDCChipAction#isSelected method. */
  isActionSelected(action: ActionType): boolean;

  /** Proxies to the MDCChipAction#isFocusable method. */
  isActionFocusable(action: ActionType): boolean;

  /** Proxies to the MDCChipAction#isDisabled method. */
  isActionDisabled(action: ActionType): boolean;

  /** Returns true if the text direction is right-to-left. */
  isRTL(): boolean;

  /** Removes the given class from the root element. */
  removeClass(className: CssClasses): void;

  /** Proxies to the MDCChipAction#setDisabled method. */
  setActionDisabled(action: ActionType, isDisabled: boolean): void;

  /** Proxies to the MDCChipAction#setFocus method. */
  setActionFocus(action: ActionType, behavior: FocusBehavior): void;

  /** Proxies to the MDCChipAction#setSelected method. */
  setActionSelected(action: ActionType, isSelected: boolean): void;

  /** Sets the style property to the given value. */
  setStyleProperty(property: string, value: string): void;
}
