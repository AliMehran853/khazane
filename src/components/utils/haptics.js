// ============================================================
// Haptic Feedback — ارتعاش ملایم روی موبایل
// فقط روی دستگاه‌هایی که از navigator.vibrate پشتیبانی می‌کنن کار می‌کنه
// ============================================================

export const HAPTIC = {
  tap: 8,
  light: 5,
  medium: 12,
  heavy: 20,
  success: [10, 40, 10],
  warning: [20, 40, 20],
  error: [30, 60, 30],
};

export function vibrate(pattern = HAPTIC.tap) {
  if (typeof navigator === 'undefined') return;
  if (!('vibrate' in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* ignore */
  }
}