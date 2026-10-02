// ============================================================
// Unified formatting utilities — locale-aware
// Location: src/components/utils/formatting.js
// ============================================================

import i18n from '../../i18n';
import {
  formatNumberLocale,
  toEnglishDigits as toEnDigits,
  toLocaleDigits,
} from '../../utils/locale';

const t = (key, opts = {}) => i18n.t(key, opts);

/* ============================================================
   Numbers
   ============================================================ */

export function formatNumber(value) {
  return formatNumberLocale(value);
}

export function formatCurrency(value, currencyCode) {
  const label = t(`currencies.${currencyCode}.label`);
  return `${formatNumber(value)} ${label}`;
}

export function formatPercent(value, decimals = 0) {
  const num = Number(value) || 0;
  const s = num.toFixed(decimals);
  return `${toLocaleDigits(s)}٪`;
}

export function parseNumberInput(value) {
  if (!value && value !== 0) return '';
  return String(value).replace(/[^\d.]/g, '');
}

export function toEnglishDigits(str) {
  return toEnDigits(str);
}

export function toPersianDigits(str) {
  return toLocaleDigits(str);
}

/* ============================================================
   Time (24h string ↔ 12h display)
   ============================================================ */

export function parseTime24(time24) {
  if (!time24 || typeof time24 !== 'string') {
    return { hour: 9, minute: 0, period: 'night' };
  }
  const [hStr, mStr] = time24.split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;

  const period = h < 12 ? 'morning' : 'night';
  let h12 = h % 12;
  if (h12 === 0) h12 = 12;

  return { hour: h12, minute: m, period };
}

export function toTime24(hour12, minute, period) {
  let h = Number(hour12) % 12;
  const isNight = period === 'night' || period === 'شب';
  if (isNight) h += 12;
  return `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
}

export function formatTime12FromString(time24) {
  const { hour, minute, period } = parseTime24(time24);
  const periodLabel = t(`reminder.${period}`);
  return `${toLocaleDigits(hour)}:${String(minute).padStart(2, '0')} ${periodLabel}`;
}

export function formatTime12Short(time24) {
  const { hour, minute, period } = parseTime24(time24);
  const periodLabel = t(`reminder.${period}`);
  if (minute === 0) return `${toLocaleDigits(hour)} ${periodLabel}`;
  return `${toLocaleDigits(hour)}:${String(minute).padStart(2, '0')} ${periodLabel}`;
}