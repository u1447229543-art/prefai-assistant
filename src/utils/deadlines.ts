import { Colors } from '../constants/colors';

/** Whole days from today until the given ISO date (negative = past). */
export function daysUntil(iso: string): number {
  const target = new Date(iso);
  if (isNaN(target.getTime())) return NaN;
  const now = new Date();
  const diff = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.round(diff / (1000 * 60 * 60 * 24));
}

/** Urgency color: red = urgent (≤3d), yellow = soon (≤10d), green/blue = ok. */
export function urgencyColor(days: number, done = false): string {
  if (done) return Colors.success;
  if (isNaN(days)) return Colors.textMuted;
  if (days < 0) return Colors.textMuted;
  if (days <= 3) return Colors.red;
  if (days <= 10) return Colors.warning;
  return Colors.success;
}

export function urgencyLabel(days: number, done = false): string {
  if (done) return 'Done';
  if (isNaN(days)) return '—';
  if (days < 0) return `${Math.abs(days)}d ago`;
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  return `${days} days`;
}

/** YYYY-MM-DD for a Date in local time. */
export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(
    d.getDate()
  ).padStart(2, '0')}`;
}
