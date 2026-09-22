// ============================================================
// Unified formatting utilities
// ============================================================

const FA_NUM = new Intl.NumberFormat('fa-AF');
const FA_DIGITS = '۰۱۲۳۴۵۶۷۸۹';
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/* ---------- Numbers ---------- */

export function formatNumber(value) {
  const num = Number(value) || 0;
  return FA_NUM.format(Math.round(num));
}

export function formatCurrency(value, currencyLabel = 'افغانی') {
  return `${formatNumber(value)} ${currencyLabel}`;
}

export function formatPercent(value, decimals = 0) {
  const num = Number(value) || 0;
  return `${num.toFixed(decimals)}٪`;
}

export function parseNumberInput(value) {
  if (!value && value !== 0) return '';
  return String(value).replace(/[^\d.]/g, '');
}

export function toEnglishDigits(str) {
  return String(str ?? '')
    .replace(/[۰-۹]/g, (d) => String(FA_DIGITS.indexOf(d)))
    .replace(/[٠-٩]/g, (d) => String(AR_DIGITS.indexOf(d)));
}

export function toPersianDigits(str) {
  return String(str ?? '').replace(/\d/g, (d) => FA_DIGITS[Number(d)]);
}

/* ---------- Time (24h string ↔ 12h display) ---------- */

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

export function toTime24(hour12, minute, period) {
  let h = Number(hour12) % 12;
  if (period === 'شب') h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatTime12FromString(time24) {
  const { hour, minute, period } = parseTime24(time24);
  return `${toPersianDigits(hour)}:${String(minute).padStart(2, '0')} ${period}`;
}

export function formatTime12Short(time24) {
  const { hour, minute, period } = parseTime24(time24);
  if (minute === 0) return `${toPersianDigits(hour)} ${period}`;
  return `${toPersianDigits(hour)}:${String(minute).padStart(2, '0')} ${period}`;
}