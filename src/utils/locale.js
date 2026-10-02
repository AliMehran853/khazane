// ============================================================
// Locale utilities — language & number formatting
// ============================================================

import i18n from '../i18n';

const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/**
 * زبان فعلی اپ ('fa' | 'en')
 */
export function getCurrentLanguage() {
  return i18n.language || 'fa';
}

/**
 * آیا زبان فعلی راست‌به‌چپ است؟
 */
export function isRTL() {
  return getCurrentLanguage() === 'fa';
}

/**
 * Locale مناسب برای Intl بر اساس زبان فعلی
 */
export function getNumberLocale() {
  const lang = getCurrentLanguage();
  if (lang === 'fa') return 'fa-AF';
  return 'en-US';
}

/**
 * فرمت عدد بر اساس زبان فعلی
 * - fa → ۱۲۳٬۴۵۶
 * - en → 123,456
 */
export function formatNumberLocale(value) {
  const num = Number(value) || 0;
  try {
    return new Intl.NumberFormat(getNumberLocale()).format(Math.round(num));
  } catch {
    return String(Math.round(num));
  }
}

/**
 * تبدیل ارقام لاتین به ارقام زبان مقصد
 * - fa → ۱۲۳
 * - en → 123 (بدون تغییر)
 */
export function toLocaleDigits(str) {
  const s = String(str ?? '');
  if (!isRTL()) return s;
  return s.replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/**
 * تبدیل ارقام فارسی/عربی به ارقام لاتین (برای ذخیره در دیتابیس)
 */
export function toEnglishDigits(str) {
  return String(str ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

/**
 * نگه‌داشتن سازگاری با کد قدیمی
 */
export const toPersianDigits = toLocaleDigits;