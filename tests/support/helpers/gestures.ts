import {browser} from '@wdio/globals';

export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

export interface SwipeOptions {
  /** Fraction of the target rectangle covered by the pointer movement. */
  distanceRatio?: number;
  /** Duration of the pointer movement, in milliseconds. */
  durationMs?: number;
  /** Pause after pressing the pointer, in milliseconds. */
  pauseMs?: number;
}

interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface Point {
  x: number;
  y: number;
}

export interface GestureTarget {
  readonly elementId: string | Promise<string>;
  waitForDisplayed(): Promise<unknown>;
}

const DEFAULT_DISTANCE_RATIO = 0.72;
const DEFAULT_DURATION_MS = 450;
const DEFAULT_PAUSE_MS = 80;

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

function pointAt(
  rectangle: Rectangle,
  direction: SwipeDirection,
  distanceRatio: number,
): {start: Point; end: Point} {
  const inset = (1 - distanceRatio) / 2;
  const horizontalStart = rectangle.x + rectangle.width * inset;
  const horizontalEnd =
    rectangle.x + rectangle.width * (1 - inset);
  const verticalStart = rectangle.y + rectangle.height * inset;
  const verticalEnd = rectangle.y + rectangle.height * (1 - inset);
  const centerX = rectangle.x + rectangle.width / 2;
  const centerY = rectangle.y + rectangle.height / 2;

  switch (direction) {
    case 'left':
      return {
        start: {x: horizontalEnd, y: centerY},
        end: {x: horizontalStart, y: centerY},
      };
    case 'right':
      return {
        start: {x: horizontalStart, y: centerY},
        end: {x: horizontalEnd, y: centerY},
      };
    case 'up':
      return {
        start: {x: centerX, y: verticalEnd},
        end: {x: centerX, y: verticalStart},
      };
    case 'down':
      return {
        start: {x: centerX, y: verticalStart},
        end: {x: centerX, y: verticalEnd},
      };
  }
}

function roundedPoint(point: Point): Point {
  return {
    x: Math.round(point.x),
    y: Math.round(point.y),
  };
}

/**
 * Performs a touch swipe using the W3C Actions endpoint.
 *
 * Coordinates are calculated from the current element rectangle, so the
 * gesture adapts to device size, orientation and insets.
 */
export async function swipeWithin(
  element: GestureTarget,
  direction: SwipeDirection,
  options: SwipeOptions = {},
): Promise<void> {
  await element.waitForDisplayed();

  const rectangle = await browser.getElementRect(await element.elementId);
  if (rectangle.width <= 1 || rectangle.height <= 1) {
    throw new Error(
      `Cannot swipe ${direction}: target rectangle is too small (${rectangle.width}x${rectangle.height})`,
    );
  }

  const distanceRatio = clamp(
    options.distanceRatio ?? DEFAULT_DISTANCE_RATIO,
    0.4,
    0.9,
  );
  const {start, end} = pointAt(rectangle, direction, distanceRatio);
  const startPoint = roundedPoint(start);
  const endPoint = roundedPoint(end);
  const durationMs = Math.max(1, options.durationMs ?? DEFAULT_DURATION_MS);
  const pauseMs = Math.max(0, options.pauseMs ?? DEFAULT_PAUSE_MS);

  if (startPoint.x === endPoint.x && startPoint.y === endPoint.y) {
    throw new Error(`Cannot swipe ${direction}: target movement is zero`);
  }

  try {
    await browser.performActions([
      {
        id: 'finger',
        type: 'pointer',
        parameters: {pointerType: 'touch'},
        actions: [
          {
            type: 'pointerMove',
            duration: 0,
            origin: 'viewport',
            x: startPoint.x,
            y: startPoint.y,
          },
          {type: 'pointerDown', button: 0},
          {type: 'pause', duration: pauseMs},
          {
            type: 'pointerMove',
            duration: durationMs,
            origin: 'viewport',
            x: endPoint.x,
            y: endPoint.y,
          },
          {type: 'pointerUp', button: 0},
        ],
      },
    ]);
  } finally {
    await browser.releaseActions();
  }
}
