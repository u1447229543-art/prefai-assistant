import { Dimensions, PixelRatio, Platform } from 'react-native';

/**
 * Responsive scaling utilities.
 *
 * The UI is designed against a 375px-wide baseline (iPhone X/11/12/13 mini, the
 * "375px" target). Sizes scale gently for narrower (small Android) and wider
 * (large iPhone / small tablet) devices so nothing overflows on a 375px viewport
 * while still looking good on 360–430px screens.
 */

const BASE_WIDTH = 375;

/** Largest layout width we ever lay out against (keeps web/tablets phone-like). */
export const MAX_CONTENT_WIDTH = 480;

const window = Dimensions.get('window');

/** Effective width used for layout math (clamped so web/tablets stay phone-sized). */
export const SCREEN_WIDTH =
  Platform.OS === 'web' ? Math.min(window.width, MAX_CONTENT_WIDTH) : window.width;
export const SCREEN_HEIGHT = window.height;

/** True on compact phones (e.g. iPhone SE, small Android). */
export const isSmallDevice = SCREEN_WIDTH < 360;
/** True on the smallest common phones. */
export const isTinyDevice = SCREEN_WIDTH <= 340;

const rawRatio = SCREEN_WIDTH / BASE_WIDTH;
// Clamp so fonts/spacing never get extreme on very small or very large screens.
const ratio = Math.min(Math.max(rawRatio, 0.85), 1.15);

/** Linear scale relative to the 375px baseline. */
export const scale = (size: number): number => Math.round(size * ratio);

/**
 * Softer scale: only applies a fraction of the size delta. Best for typography
 * and spacing so they breathe a little without distorting on big screens.
 */
export const moderateScale = (size: number, factor = 0.5): number =>
  Math.round(size + (scale(size) - size) * factor);

/** Percentage of the (clamped) screen width. */
export const widthPct = (pct: number): number => Math.round((SCREEN_WIDTH * pct) / 100);

/** Round to the nearest device pixel for crisp borders. */
export const px = (size: number): number => PixelRatio.roundToNearestPixel(size);
