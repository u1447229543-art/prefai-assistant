/**
 * PrefAI Assistant design system.
 * Dark theme with neon accents inspired by the French flag (blue / white / red).
 */

import { moderateScale } from './responsive';

export const Colors = {
  // Surfaces
  background: '#0A0A0F',
  card: '#12121A',
  cardElevated: '#181824',
  border: '#1E1E2E',

  // Neon accents
  blue: '#00D4FF',
  red: '#FF2D55',

  // Text
  white: '#F0F0FF',
  textPrimary: '#F0F0FF',
  textSecondary: '#9A9AB2',
  textMuted: '#6A6A82',

  // Status
  success: '#2EE6A6',
  warning: '#FFB020',
  danger: '#FF2D55',

  // Misc
  overlay: 'rgba(0,0,0,0.6)',
  glassBlue: 'rgba(0, 212, 255, 0.12)',
  glassRed: 'rgba(255, 45, 85, 0.12)',
  transparent: 'transparent',
} as const;

export type ColorKey = keyof typeof Colors;

/** Reusable gradient stops. */
export const Gradients = {
  french: ['#00D4FF', '#F0F0FF', '#FF2D55'] as const,
  blue: ['#00D4FF', '#0077FF'] as const,
  red: ['#FF2D55', '#FF6B00'] as const,
  blueRed: ['#00D4FF', '#FF2D55'] as const,
  card: ['#16161F', '#101018'] as const,
};

// Spacing scales gently with the viewport (factor 0.4) so compact phones get a
// touch tighter and larger phones a touch roomier, all from a 375px baseline.
const sp = (n: number) => moderateScale(n, 0.4);
export const Spacing = {
  xs: sp(4),
  sm: sp(8),
  md: sp(16),
  lg: sp(24),
  xl: sp(32),
  xxl: sp(48),
} as const;

// Corner radii barely scale to keep the visual language consistent.
const rd = (n: number) => moderateScale(n, 0.25);
export const Radius = {
  sm: rd(8),
  md: rd(14),
  lg: rd(20),
  xl: rd(28),
  pill: 999,
} as const;

// Typography scales moderately (factor 0.5) for legibility across screen sizes.
const fs = (n: number) => moderateScale(n, 0.5);
export const FontSize = {
  xs: fs(12),
  sm: fs(14),
  md: fs(16),
  lg: fs(18),
  xl: fs(22),
  xxl: fs(28),
  display: fs(34),
} as const;

/** Neon glow shadow helper for a given color. */
export const glow = (color: string, radius = 12) => ({
  shadowColor: color,
  shadowOffset: { width: 0, height: 0 },
  shadowOpacity: 0.6,
  shadowRadius: radius,
  elevation: 8,
});
