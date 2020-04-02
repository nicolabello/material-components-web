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

import autoInit from './../auto-init/index';
import * as base from './../base/index';
import * as checkbox from './../checkbox/index';
import * as chips from './../chips/index';
import * as circularProgress from './../circular-progress/index';
import * as dataTable from './../data-table/index';
import * as dialog from './../dialog/index';
import * as dom from './../dom/index';
import * as drawer from './../drawer/index';
import * as floatingLabel from './../floating-label/index';
import * as formField from './../form-field/index';
import * as iconButton from './../icon-button/index';
import * as lineRipple from './../line-ripple/index';
import * as linearProgress from './../linear-progress/index';
import * as list from './../list/index';
import * as menuSurface from './../menu-surface/index';
import * as menu from './../menu/index';
import * as notchedOutline from './../notched-outline/index';
import * as radio from './../radio/index';
import * as ripple from './../ripple/index';
import * as select from './../select/index';
import * as slider from './../slider/index';
import * as snackbar from './../snackbar/index';
import * as switchControl from './../switch/index';
import * as tabBar from './../tab-bar/index';
import * as tabIndicator from './../tab-indicator/index';
import * as tabScroller from './../tab-scroller/index';
import * as tab from './../tab/index';
import * as textField from './../textfield/index';
import * as topAppBar from './../top-app-bar/index';

// Register all components
// @ts-ignore
autoInit.register('MDCCheckbox', checkbox.MDCCheckbox);
// @ts-ignore
autoInit.register('MDCChip', chips.MDCChip);
// @ts-ignore
autoInit.register('MDCChipSet', chips.MDCChipSet);
// @ts-ignore
autoInit.register('MDCCircularProgress', circularProgress.MDCCircularProgress);
// @ts-ignore
autoInit.register('MDCDataTable', dataTable.MDCDataTable);
// @ts-ignore
autoInit.register('MDCDialog', dialog.MDCDialog);
// @ts-ignore
autoInit.register('MDCDrawer', drawer.MDCDrawer);
// @ts-ignore
autoInit.register('MDCFloatingLabel', floatingLabel.MDCFloatingLabel);
// @ts-ignore
autoInit.register('MDCFormField', formField.MDCFormField);
// @ts-ignore
autoInit.register('MDCIconButtonToggle', iconButton.MDCIconButtonToggle);
// @ts-ignore
autoInit.register('MDCLineRipple', lineRipple.MDCLineRipple);
// @ts-ignore
autoInit.register('MDCLinearProgress', linearProgress.MDCLinearProgress);
// @ts-ignore
autoInit.register('MDCList', list.MDCList);
// @ts-ignore
autoInit.register('MDCMenu', menu.MDCMenu);
// @ts-ignore
autoInit.register('MDCMenuSurface', menuSurface.MDCMenuSurface);
// @ts-ignore
autoInit.register('MDCNotchedOutline', notchedOutline.MDCNotchedOutline);
// @ts-ignore
autoInit.register('MDCRadio', radio.MDCRadio);
// @ts-ignore
autoInit.register('MDCRipple', ripple.MDCRipple);
// @ts-ignore
autoInit.register('MDCSelect', select.MDCSelect);
// @ts-ignore
autoInit.register('MDCSlider', slider.MDCSlider);
// @ts-ignore
autoInit.register('MDCSnackbar', snackbar.MDCSnackbar);
// @ts-ignore
autoInit.register('MDCSwitch', switchControl.MDCSwitch);
// @ts-ignore
autoInit.register('MDCTabBar', tabBar.MDCTabBar);
// @ts-ignore
autoInit.register('MDCTextField', textField.MDCTextField);
// @ts-ignore
autoInit.register('MDCTopAppBar', topAppBar.MDCTopAppBar);

// Export all components.
export {
  autoInit,
  base,
  checkbox,
  chips,
  circularProgress,
  dataTable,
  dialog,
  dom,
  drawer,
  floatingLabel,
  formField,
  iconButton,
  lineRipple,
  linearProgress,
  list,
  menu,
  menuSurface,
  notchedOutline,
  radio,
  ripple,
  select,
  slider,
  snackbar,
  switchControl,
  tab,
  tabBar,
  tabIndicator,
  tabScroller,
  textField,
  topAppBar,
};
