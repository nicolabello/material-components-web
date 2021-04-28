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

import autoInit, {MDCAttachable} from './../auto-init/index';
import * as banner from './../banner/index';
import * as base from './../base/index';
import * as checkbox from './../checkbox/index';
import * as chips from './../chips/deprecated/index';
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
import * as segmentedButton from './../segmented-button/index';
import * as select from './../select/index';
import * as slider from './../slider/index';
import * as snackbar from './../snackbar/index';
import * as switchControl from './../switch/index';
import * as tabBar from './../tab-bar/index';
import * as tabIndicator from './../tab-indicator/index';
import * as tabScroller from './../tab-scroller/index';
import * as tab from './../tab/index';
import * as textField from './../textfield/index';
import * as tooltip from './../tooltip/index';
import * as topAppBar from './../top-app-bar/index';

// Register all components
autoInit.register('MDCBanner', banner.MDCBanner);
autoInit.register('MDCCheckbox', checkbox.MDCCheckbox);
autoInit.register('MDCChip', chips.MDCChip);
autoInit.register('MDCChipSet', chips.MDCChipSet);
autoInit.register('MDCCircularProgress', circularProgress.MDCCircularProgress);
autoInit.register('MDCDataTable', dataTable.MDCDataTable);
autoInit.register('MDCDialog', dialog.MDCDialog);
autoInit.register('MDCDrawer', drawer.MDCDrawer);
autoInit.register('MDCFloatingLabel', floatingLabel.MDCFloatingLabel);
autoInit.register('MDCFormField', formField.MDCFormField);
autoInit.register('MDCIconButtonToggle', iconButton.MDCIconButtonToggle);
autoInit.register('MDCLineRipple', lineRipple.MDCLineRipple);
autoInit.register('MDCLinearProgress', linearProgress.MDCLinearProgress);
autoInit.register('MDCList', list.MDCList);
autoInit.register('MDCMenu', menu.MDCMenu);
autoInit.register('MDCMenuSurface', menuSurface.MDCMenuSurface);
autoInit.register('MDCNotchedOutline', notchedOutline.MDCNotchedOutline);
autoInit.register('MDCRadio', radio.MDCRadio);
autoInit.register('MDCRipple', ripple.MDCRipple);
autoInit.register('MDCSegmentedButton', segmentedButton.MDCSegmentedButton);
autoInit.register('MDCSelect', select.MDCSelect);
autoInit.register('MDCSlider', slider.MDCSlider);
autoInit.register('MDCSnackbar', snackbar.MDCSnackbar);
autoInit.register(
    'MDCSwitch', switchControl.MDCSwitch as unknown as MDCAttachable);
autoInit.register('MDCTabBar', tabBar.MDCTabBar);
autoInit.register('MDCTextField', textField.MDCTextField);
autoInit.register('MDCTooltip', tooltip.MDCTooltip);
autoInit.register('MDCTopAppBar', topAppBar.MDCTopAppBar);

// Export all components.
export {
  autoInit,
  banner,
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
  segmentedButton,
  select,
  slider,
  snackbar,
  switchControl,
  tab,
  tabBar,
  tabIndicator,
  tabScroller,
  textField,
  tooltip,
  topAppBar,
};
