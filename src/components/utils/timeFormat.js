/**
 * تبدیل ۲۴ ساعته به ۱۲ ساعته با صبح/شب
 * مثال: '21:00' → { hour: 9, minute: 0, period: 'شب' }
 */
export function parseTime24(time24) {
  if (!time24 || typeof time24 !== 'string') {
    return { hour: 9, minute: 0, period: 'شب' };
  }

  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;

  const period = h < 12 ? 'صبح' : 'شب';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return { hour: h12, minute: m, period };
}

/**
 * تبدیل ۱۲ ساعته به ۲۴ ساعته
 * مثال: (9, 0, 'شب') → '21:00'
 */
export function toTime24(hour12, minute, period) {
  let h = Number(hour12) % 12;
  if (period === 'شب') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

/**
 * نمایش ۱۲ ساعته از رشته‌ی ۲۴ ساعته
 * مثال: '21:00' → '۹:۰۰ شب'
 */
export function formatTime12(time24) {
  const { hour, minute, period } = parseTime24(time24);
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}

/**
 * نمایش ۱۲ ساعته از رشته‌ی ۲۴ ساعته — بدون دقیقه (اگر صفر بود)
 * مثال: '21:00' → '۹ شب'
 */
export function formatTime12Short(time24) {
  const { hour, minute, period } = parseTime24(time24);
  if (minute === 0) return `${hour} ${period}`;
  return `${hour}:${String(minute).padStart(2, '0')} ${period}`;
}