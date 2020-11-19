/**
 * @license
 * Copyright 2020 Google Inc.
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
import {SpecificEventListener} from './../base/types';
import {KEY, normalizeKey} from './../dom/keyboard';
import {MDCTooltipAdapter} from './adapter';
import {AnchorBoundaryType, CssClasses, numbers, XPosition, YPosition} from './constants';
import {ShowTooltipOptions} from './types';

const {
  SHOWN,
  SHOWING,
  SHOWING_TRANSITION,
  HIDE,
  HIDE_TRANSITION,
  MULTILINE_TOOLTIP
} = CssClasses;

export class MDCTooltipFoundation extends MDCFoundation<MDCTooltipAdapter> {
  static get defaultAdapter(): MDCTooltipAdapter {
    return {
      getAttribute: () => null,
      setAttribute: () => undefined,
      addClass: () => undefined,
      hasClass: () => false,
      removeClass: () => undefined,
      setStyleProperty: () => undefined,
      getViewportWidth: () => 0,
      getViewportHeight: () => 0,
      getTooltipSize: () => ({width: 0, height: 0}),
      getAnchorBoundingRect: () =>
          ({top: 0, right: 0, bottom: 0, left: 0, width: 0, height: 0}),
      getAnchorAttribute: () => null,
      isRTL: () => false,
      registerDocumentEventHandler: () => undefined,
      deregisterDocumentEventHandler: () => undefined,
      notifyHidden: () => undefined,
    };
  }

  private isShown = false;
  private anchorGap = numbers.BOUNDED_ANCHOR_GAP;
  private xTooltipPos = XPosition.DETECTED;
  private yTooltipPos = YPosition.DETECTED;
  // Minimum threshold distance needed between the tooltip and the viewport.
  private readonly minViewportTooltipThreshold =
      numbers.MIN_VIEWPORT_TOOLTIP_THRESHOLD;
  private readonly hideDelayMs = numbers.HIDE_DELAY_MS;
  private readonly showDelayMs = numbers.SHOW_DELAY_MS;

  private frameId: number|null = null;
  private hideTimeout: number|null = null;
  private showTimeout: number|null = null;
  private readonly documentClickHandler: SpecificEventListener<'click'>;
  private readonly documentKeydownHandler: SpecificEventListener<'keydown'>;

  constructor(adapter?: Partial<MDCTooltipAdapter>) {
    super({...MDCTooltipFoundation.defaultAdapter, ...adapter});

    this.documentClickHandler = () => {
      this.handleClick();
    };

    this.documentKeydownHandler = (evt) => {
      this.handleKeydown(evt);
    };
  }

  handleAnchorMouseEnter() {
    if (this.isShown) {
      // Covers the instance where a user hovers over the anchor to reveal the
      // tooltip, and then quickly navigates away and then back to the anchor.
      // The tooltip should stay visible without animating out and then back in
      // again.
      this.show();
    } else {
      this.showTimeout = setTimeout(() => {
        this.show();
      }, this.showDelayMs);
    }
  }

  handleAnchorFocus() {
    // TODO(b/157075286): Need to add some way to distinguish keyboard
    // navigation focus events from other focus events, and only show the
    // tooltip on the former of these events.
    this.showTimeout = setTimeout(() => {
      this.show();
    }, this.showDelayMs);
  }

  handleAnchorMouseLeave() {
    this.clearShowTimeout();
    this.hideTimeout = setTimeout(() => {
      this.hide();
    }, this.hideDelayMs);
  }

  handleAnchorBlur() {
    // Hide tooltip immediately on focus change.
    this.hide();
  }

  handleClick() {
    // Hide the tooltip immediately on click.
    this.hide();
  }

  handleKeydown(evt: KeyboardEvent) {
    // Hide the tooltip immediately on ESC key.
    const key = normalizeKey(evt);
    if (key === KEY.ESCAPE) {
      this.hide();
    }
  }

  show() {
    this.clearHideTimeout();
    this.clearShowTimeout();

    if (this.isShown) {
      return;
    }

    this.isShown = true;
    const showTooltipOptions = this.parseShowTooltipOptions();
    if (!showTooltipOptions.hideFromScreenreader) {
      this.adapter.setAttribute('aria-hidden', 'false');
    }
    this.adapter.removeClass(HIDE);
    this.adapter.addClass(SHOWING);
    if (this.isTooltipMultiline()) {
      this.adapter.addClass(MULTILINE_TOOLTIP);
    }
    const {top, left} = this.calculateTooltipDistance();
    this.adapter.setStyleProperty('top', `${top}px`);
    this.adapter.setStyleProperty('left', `${left}px`);

    this.adapter.registerDocumentEventHandler(
        'click', this.documentClickHandler);
    this.adapter.registerDocumentEventHandler(
        'keydown', this.documentKeydownHandler);

    this.frameId = requestAnimationFrame(() => {
      this.clearAllAnimationClasses();
      this.adapter.addClass(SHOWN);
      this.adapter.addClass(SHOWING_TRANSITION);
    });
  }

  hide() {
    this.clearHideTimeout();
    this.clearShowTimeout();

    if (!this.isShown) {
      return;
    }

    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
    }

    this.isShown = false;
    this.adapter.setAttribute('aria-hidden', 'true');
    this.clearAllAnimationClasses();
    this.adapter.addClass(HIDE);
    this.adapter.addClass(HIDE_TRANSITION);
    this.adapter.removeClass(SHOWN);

    this.adapter.deregisterDocumentEventHandler(
        'click', this.documentClickHandler);
    this.adapter.deregisterDocumentEventHandler(
        'keydown', this.documentKeydownHandler);
  }

  handleTransitionEnd() {
    const isHidingTooltip = this.adapter.hasClass(HIDE);

    this.adapter.removeClass(SHOWING);
    this.adapter.removeClass(SHOWING_TRANSITION);
    this.adapter.removeClass(HIDE);
    this.adapter.removeClass(HIDE_TRANSITION);

    // If handleTransitionEnd is called after hiding the tooltip, the tooltip
    // will have the HIDE class (before calling the adapter removeClass method).
    // If tooltip is now hidden, send a notification that the animation has
    // completed and the tooltip is no longer visible.
    if (isHidingTooltip) {
      this.adapter.notifyHidden();
    }
  }

  private clearAllAnimationClasses() {
    this.adapter.removeClass(SHOWING_TRANSITION);
    this.adapter.removeClass(HIDE_TRANSITION);
  }

  setTooltipPosition(position: {xPos?: XPosition, yPos?: YPosition}) {
    const {xPos, yPos} = position;
    if (xPos) {
      this.xTooltipPos = xPos;
    }

    if (yPos) {
      this.yTooltipPos = yPos;
    }
  }

  setAnchorBoundaryType(type: AnchorBoundaryType) {
    if (type === AnchorBoundaryType.UNBOUNDED) {
      this.anchorGap = numbers.UNBOUNDED_ANCHOR_GAP;
    } else {
      this.anchorGap = numbers.BOUNDED_ANCHOR_GAP;
    }
  }

  private parseShowTooltipOptions(): ShowTooltipOptions {
    const hideFromScreenreader =
        Boolean(this.adapter.getAnchorAttribute('data-tooltip-id'));
    return {hideFromScreenreader};
  }

  private isTooltipMultiline() {
    const tooltipSize = this.adapter.getTooltipSize();
    return tooltipSize.height > numbers.MIN_HEIGHT &&
        tooltipSize.width >= numbers.MAX_WIDTH;
  }

  /**
   * Calculates the position of the tooltip. A tooltip will be placed beneath
   * the anchor element and aligned either with the 'start'/'end' edge of the
   * anchor element or the 'center'.
   *
   * Tooltip alignment is selected such that the tooltip maintains a threshold
   * distance away from the viewport (defaulting to 'center' alignment). If the
   * placement of the anchor prevents this threshold distance from being
   * maintained, the tooltip is positioned so that it does not collide with the
   * viewport.
   *
   * Users can specify an alignment, however, if this alignment results in the
   * tooltip colliding with the viewport, this specification is overwritten.
   */
  private calculateTooltipDistance() {
    const anchorRect = this.adapter.getAnchorBoundingRect();
    if (!anchorRect) {
      return {top: 0, left: 0};
    }

    const tooltipSize = this.adapter.getTooltipSize();
    const top = this.calculateYTooltipDistance(anchorRect, tooltipSize.height);
    const left = this.calculateXTooltipDistance(anchorRect, tooltipSize.width);
    return {top, left};
  }

  /**
   * Calculates the `left` distance for the tooltip.
   */
  private calculateXTooltipDistance(
      anchorRect: ClientRect, tooltipWidth: number) {
    let startPos = anchorRect.left;
    let endPos = anchorRect.right - tooltipWidth;
    const centerPos = anchorRect.left + (anchorRect.width - tooltipWidth) / 2;

    if (this.adapter.isRTL()) {
      startPos = anchorRect.right - tooltipWidth;
      endPos = anchorRect.left;
    }

    const positionOptions =
        this.determineValidPositionOptions(centerPos, startPos, endPos);

    if (this.xTooltipPos === XPosition.START && positionOptions.has(startPos)) {
      return startPos;
    }
    if (this.xTooltipPos === XPosition.END && positionOptions.has(endPos)) {
      return endPos;
    }
    if (this.xTooltipPos === XPosition.CENTER &&
        positionOptions.has(centerPos)) {
      return centerPos;
    }

    if (positionOptions.has(centerPos)) {
      return centerPos;
    }
    if (positionOptions.has(startPos)) {
      return startPos;
    }
    if (positionOptions.has(endPos)) {
      return endPos;
    }

    // Indicates that all potential positions would result in the tooltip
    // colliding with the viewport. This would only occur when the anchor
    // element itself collides with the viewport, or the viewport is very
    // narrow. In this case, we allow the tooltip to be mis-aligned from the
    // anchor element.
    if (anchorRect.left < 0) {
      return this.minViewportTooltipThreshold;
    } else {
      const viewportWidth = this.adapter.getViewportWidth();
      return viewportWidth - (tooltipWidth + this.minViewportTooltipThreshold);
    }
  }

  /**
   * Given the values for center/start/end alignment of the tooltip, calculates
   * which of these options would result in the tooltip maintaining the required
   * threshold distance vs which would result in the tooltip staying within the
   * viewport.
   *
   * A Set of values is returned holding the distances that would honor the
   * above requirements. Following the logic for determining the tooltip
   * position, if all three alignments violate the threshold, then the returned
   * Set contains values that keep the tooltip within the viewport.
   */
  private determineValidPositionOptions(
      centerPos: number, startPos: number, endPos: number) {
    const posWithinThreshold = new Set();
    const posWithinViewport = new Set();

    if (this.positionHonorsViewportThreshold(centerPos)) {
      posWithinThreshold.add(centerPos);
    } else if (this.positionDoesntCollideWithViewport(centerPos)) {
      posWithinViewport.add(centerPos);
    }

    if (this.positionHonorsViewportThreshold(startPos)) {
      posWithinThreshold.add(startPos);
    } else if (this.positionDoesntCollideWithViewport(startPos)) {
      posWithinViewport.add(startPos);
    }

    if (this.positionHonorsViewportThreshold(endPos)) {
      posWithinThreshold.add(endPos);
    } else if (this.positionDoesntCollideWithViewport(endPos)) {
      posWithinViewport.add(endPos);
    }

    return posWithinThreshold.size ? posWithinThreshold : posWithinViewport;
  }

  private positionHonorsViewportThreshold(leftPos: number) {
    const viewportWidth = this.adapter.getViewportWidth();
    const tooltipWidth = this.adapter.getTooltipSize().width;

    return leftPos + tooltipWidth <=
        viewportWidth - this.minViewportTooltipThreshold &&
        leftPos >= this.minViewportTooltipThreshold;
  }

  private positionDoesntCollideWithViewport(leftPos: number) {
    const viewportWidth = this.adapter.getViewportWidth();
    const tooltipWidth = this.adapter.getTooltipSize().width;

    return leftPos + tooltipWidth <= viewportWidth && leftPos >= 0;
  }

  /**
   * Calculates the `top` distance for the tooltip.
   */
  private calculateYTooltipDistance(
      anchorRect: ClientRect, tooltipHeight: number) {
    const belowYPos = anchorRect.bottom + this.anchorGap;
    const aboveYPos = anchorRect.top - (this.anchorGap + tooltipHeight);
    const yPositionOptions =
        this.determineValidYPositionOptions(aboveYPos, belowYPos);

    if (this.yTooltipPos === YPosition.ABOVE &&
        yPositionOptions.has(aboveYPos)) {
      return aboveYPos;
    } else if (
        this.yTooltipPos === YPosition.BELOW &&
        yPositionOptions.has(belowYPos)) {
      return belowYPos;
    }

    if (yPositionOptions.has(belowYPos)) {
      return belowYPos;
    }

    if (yPositionOptions.has(aboveYPos)) {
      return aboveYPos;
    }

    // Indicates that all potential positions would result in the tooltip
    // colliding with the viewport. This would only occur when the viewport is
    // very short.
    return belowYPos;
  }

  /**
   * Given the values for above/below alignment of the tooltip, calculates
   * which of these options would result in the tooltip maintaining the required
   * threshold distance vs which would result in the tooltip staying within the
   * viewport.
   *
   * A Set of values is returned holding the distances that would honor the
   * above requirements. Following the logic for determining the tooltip
   * position, if all possible alignments violate the threshold, then the
   * returned Set contains values that keep the tooltip within the viewport.
   */
  private determineValidYPositionOptions(
      aboveAnchorPos: number, belowAnchorPos: number) {
    const posWithinThreshold = new Set();
    const posWithinViewport = new Set();

    if (this.yPositionHonorsViewportThreshold(aboveAnchorPos)) {
      posWithinThreshold.add(aboveAnchorPos);
    } else if (this.yPositionDoesntCollideWithViewport(aboveAnchorPos)) {
      posWithinViewport.add(aboveAnchorPos);
    }

    if (this.yPositionHonorsViewportThreshold(belowAnchorPos)) {
      posWithinThreshold.add(belowAnchorPos);
    } else if (this.yPositionDoesntCollideWithViewport(belowAnchorPos)) {
      posWithinViewport.add(belowAnchorPos);
    }

    return posWithinThreshold.size ? posWithinThreshold : posWithinViewport;
  }

  private yPositionHonorsViewportThreshold(yPos: number) {
    const viewportHeight = this.adapter.getViewportHeight();
    const tooltipHeight = this.adapter.getTooltipSize().height;

    return yPos + tooltipHeight + this.minViewportTooltipThreshold <=
        viewportHeight &&
        yPos >= this.minViewportTooltipThreshold;
  }

  private yPositionDoesntCollideWithViewport(yPos: number) {
    const viewportHeight = this.adapter.getViewportHeight();
    const tooltipHeight = this.adapter.getTooltipSize().height;

    return yPos + tooltipHeight <= viewportHeight && yPos >= 0;
  }

  private clearShowTimeout() {
    if (this.showTimeout) {
      clearTimeout(this.showTimeout);
      this.showTimeout = null;
    }
  }

  private clearHideTimeout() {
    if (this.hideTimeout) {
      clearTimeout(this.hideTimeout);
      this.hideTimeout = null;
    }
  }

  destroy() {
    if (this.frameId) {
      cancelAnimationFrame(this.frameId);
      this.frameId = null;
    }

    this.clearHideTimeout();
    this.clearShowTimeout();

    this.adapter.removeClass(SHOWN);
    this.adapter.removeClass(SHOWING_TRANSITION);
    this.adapter.removeClass(SHOWING);
    this.adapter.removeClass(HIDE);
    this.adapter.removeClass(HIDE_TRANSITION);

    this.adapter.deregisterDocumentEventHandler(
        'click', this.documentClickHandler);
    this.adapter.deregisterDocumentEventHandler(
        'keydown', this.documentKeydownHandler);
  }
}

// tslint:disable-next-line:no-default-export Needed for backward compatibility with MDC Web v0.44.0 and earlier.
export default MDCTooltipFoundation;
