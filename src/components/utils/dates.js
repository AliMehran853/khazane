// ============================================================
// Dates utilities — calendar-aware + i18n-aware
// Location: src/components/utils/dates.js
// ============================================================

import i18n from '../../i18n';
import { getCalendar } from '../../utils/calendar';
import { formatNumberLocale } from '../../utils/locale';

const t = (key, opts = {}) => i18n.t(key, opts);
const fmtN = (n) => formatNumberLocale(n);

/* ============================================================
   Day / Week boundaries
   ============================================================ */

export function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function endOfDay(date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

export function startOfWeek(date = new Date()) {
  return getCalendar().startOfWeek(date);
}

export function endOfWeek(date = new Date()) {
  return getCalendar().endOfWeek(date);
}

/* ============================================================
   Period navigation
   ============================================================ */

export function getPeriodBaseDate(period, offset = 0) {
  const d = new Date();
  const cal = getCalendar();

  if (period === 'daily') {
    d.setDate(d.getDate() + offset);
    return d;
  }

  if (period === 'weekly') {
    d.setDate(d.getDate() + offset * 7);
    return d;
  }

  if (period === 'monthly') {
    return cal.addMonths(d, offset);
  }

  if (period === 'yearly') {
    return cal.addYears(d, offset);
  }

  return d;
}

export function getMaxOffset(period) {
  if (period === 'daily') return -365;
  if (period === 'weekly') return -52;
  if (period === 'monthly') return -24;
  if (period === 'yearly') return -10;
  return 0;
}

/* ============================================================
   Period labels
   ============================================================ */

export function getPeriodOffsetLabel(period, offset = 0) {
  if (offset === 0) {
    if (period === 'daily') return t('periods.today');
    if (period === 'weekly') return t('periods.weekly');
    if (period === 'monthly') return t('periods.monthly');
    if (period === 'yearly') return t('periods.yearly');
  }

  if (period === 'daily') {
    if (offset === -1) return t('periods.yesterday');
    if (offset === 1) return t('periods.tomorrow');
    const n = Math.abs(offset);
    const suffix = offset < 0 ? t('periods.daysAgo') : t('periods.daysLater');
    return `${fmtN(n)} ${suffix}`;
  }

  if (period === 'weekly') {
    if (offset === -1) return t('periods.lastWeek');
    if (offset === 1) return t('periods.nextWeek');
    const n = Math.abs(offset);
    const suffix = offset < 0 ? t('periods.weeksAgo') : t('periods.weeksLater');
    return `${fmtN(n)} ${suffix}`;
  }

  if (period === 'monthly') {
    const d = getPeriodBaseDate('monthly', offset);
    const cal = getCalendar();
    const monthName = cal.getMonthName(d);
    const year = cal.getYear(d);
    return `${monthName} ${year}`;
  }

  if (period === 'yearly') {
    const d = getPeriodBaseDate('yearly', offset);
    return String(getCalendar().getYear(d));
  }

  return '';
}

export function getPeriodSubLabel(period, offset = 0) {
  const baseDate = getPeriodBaseDate(period, offset);
  const cal = getCalendar();

  if (period === 'daily') {
    return formatShortDate(baseDate);
  }

  if (period === 'weekly') {
    const start = cal.startOfWeek(baseDate);
    const end = cal.endOfWeek(baseDate);
    return formatWeekRange(start, end);
  }

  if (period === 'monthly') {
    const start = cal.startOfMonth(baseDate);
    const nextMonth = cal.addMonths(start, 1);
    const end = new Date(nextMonth.getTime() - 1);
    return formatWeekRange(start, end);
  }

  return null;
}

/* ============================================================
   Period ranges
   ============================================================ */

export function getRange(period = 'weekly', date = new Date()) {
  const cal = getCalendar();

  if (period === 'daily') {
    return { start: startOfDay(date), end: endOfDay(date) };
  }
  if (period === 'weekly') {
    return { start: cal.startOfWeek(date), end: cal.endOfWeek(date) };
  }
  if (period === 'monthly') {
    const start = cal.startOfMonth(date);
    const nextMonth = cal.addMonths(start, 1);
    const end = new Date(nextMonth.getTime() - 1);
    return { start, end };
  }
  if (period === 'yearly') {
    return { start: cal.startOfYear(date), end: cal.endOfYear(date) };
  }
  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getPeriodRange(period, offset = 0) {
  const baseDate = getPeriodBaseDate(period, offset);
  return { ...getRange(period, baseDate), baseDate };
}

/* ============================================================
   Previous period
   ============================================================ */

export function getPreviousPeriodDate(period, baseDate) {
  const d = new Date(baseDate || new Date());
  const cal = getCalendar();

  if (period === 'daily') {
    d.setDate(d.getDate() - 1);
    return d;
  }
  if (period === 'weekly') {
    d.setDate(d.getDate() - 7);
    return d;
  }
  if (period === 'monthly') {
    return cal.addMonths(d, -1);
  }
  if (period === 'yearly') {
    return cal.addYears(d, -1);
  }
  return d;
}

/* ============================================================
   Days / Months / Years arrays
   ============================================================ */

export function getWeekDays(date = new Date()) {
  const cal = getCalendar();
  const weekStart = startOfDay(cal.startOfWeek(date));
  const days = [];

  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dayName = cal.getDayName(d);
    days.push({
      date: d,
      label: dayName,
      shortLabel: dayName.slice(0, 2),
      key: d.toISOString(),
    });
  }
  return days;
}

export function getMonthDays(date = new Date()) {
  const cal = getCalendar();
  const start = cal.startOfMonth(date);
  const nextMonth = cal.addMonths(start, 1);
  const diffMs = nextMonth.getTime() - start.getTime();
  const totalDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  const days = [];
  const cursor = new Date(start);
  for (let i = 0; i < totalDays; i += 1) {
    days.push({
      date: new Date(cursor),
      label: String(i + 1),
      key: cursor.toISOString(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }
  return days;
}

export function getYearMonths(date = new Date()) {
  const cal = getCalendar();
  const startYear = cal.startOfYear(date);

  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = cal.addMonths(startYear, i);
    const nextMonthStart = cal.addMonths(monthStart, 1);
    const monthEnd = new Date(nextMonthStart.getTime() - 1);
    return {
      startDate: cal.startOfMonth(monthStart),
      endDate: monthEnd,
      label: cal.getMonthName(monthStart),
      key: `${cal.getYear(monthStart)}-${i + 1}`,
    };
  });
}

/* ============================================================
   Today labels
   ============================================================ */

export function getTodayLabel() {
  const d = new Date();
  const cal = getCalendar();
  return `${cal.getDayName(d)} ${cal.getDayNumber(d)} ${cal.getMonthName(d)} ${cal.getYear(d)}`;
}

export function getTodayShort() {
  const d = new Date();
  const cal = getCalendar();
  return `${cal.getDayName(d)} ${cal.getDayNumber(d)} ${cal.getMonthName(d)}`;
}

/* ============================================================
   Date formatting
   ============================================================ */

export function formatShortDate(dateInput) {
  const d = new Date(dateInput);
  const cal = getCalendar();
  return `${cal.getDayName(d)} ${cal.getDayNumber(d)} ${cal.getMonthName(d)}`;
}

export function formatFullDate(dateInput) {
  const d = new Date(dateInput);
  const cal = getCalendar();
  return `${cal.getDayName(d)} ${cal.getDayNumber(d)} ${cal.getMonthName(d)} ${cal.getYear(d)}`;
}

export function formatWeekRange(start, end) {
  const cal = getCalendar();
  const sDay = cal.getDayNumber(start);
  const eDay = cal.getDayNumber(end);
  const sMonthIdx = cal.getMonthIndex(start);
  const eMonthIdx = cal.getMonthIndex(end);
  const sMonth = cal.getMonthName(start);
  const eMonth = cal.getMonthName(end);

  if (sMonthIdx === eMonthIdx) {
    return `${fmtN(sDay)} - ${fmtN(eDay)} ${sMonth}`;
  }
  return `${fmtN(sDay)} ${sMonth} - ${fmtN(eDay)} ${eMonth}`;
}

/* ============================================================
   Time formatting
   ============================================================ */

export function formatTime12(dateInput) {
  const d = new Date(dateInput);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const periodKey = h24 < 12 ? 'time.am' : 'time.pm';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;

  const hStr = fmtN(h12);
  const mStr = String(m).padStart(2, '0');
  return `${hStr}:${mStr} ${t(periodKey)}`;
}

export function formatFullDateTime(dateInput) {
  return `${formatFullDate(dateInput)} • ${formatTime12(dateInput)}`;
}

/* ============================================================
   Transaction date (relative)
   ============================================================ */

export function formatTransactionDate(dateInput) {
  const d = new Date(dateInput);
  const now = new Date();

  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const timePart = formatTime12(d);

  if (diffDays === 0) return `${t('periods.today')} • ${timePart}`;
  if (diffDays === 1) return `${t('periods.yesterday')} • ${timePart}`;

  const cal = getCalendar();
  const dayName = cal.getDayName(d);
  const dayNum = cal.getDayNumber(d);
  const monthName = cal.getMonthName(d);
  const year = cal.getYear(d);
  const currentYear = cal.getYear(now);

  if (year === currentYear) {
    return `${dayName} ${dayNum} ${monthName} • ${timePart}`;
  }

  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

/* ============================================================
   Baseline label
   ============================================================ */

export function getBaselineLabel(period, offset = 0) {
  const baselineOffset = offset < 0 ? 0 : -1;
  return getPeriodOffsetLabel(period, baselineOffset);
}