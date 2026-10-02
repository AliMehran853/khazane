// ============================================================
// Afghan Solar Calendar (تقویم شمسی افغانی)
// ============================================================

import {
  format,
  startOfWeek as dfStartOfWeek,
  endOfWeek as dfEndOfWeek,
  startOfMonth as dfStartOfMonth,
  endOfMonth as dfEndOfMonth,
  startOfYear as dfStartOfYear,
  endOfYear as dfEndOfYear,
  addMonths,
  addDays,
  addYears,
} from 'date-fns-jalali';

export const AFGHAN_MONTHS = [
  'حمل',
  'ثور',
  'جوزا',
  'سرطان',
  'اسد',
  'سنبله',
  'میزان',
  'عقرب',
  'قوس',
  'جدی',
  'دلو',
  'حوت',
];

// شنبه تا جمعه (هفته در افغانستان از شنبه شروع می‌شود)
export const AFGHAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

const WEEK_OPTIONS = { weekStartsOn: 6 }; // 6 = Saturday

export const afghanCalendar = {
  id: 'afghan',
  months: AFGHAN_MONTHS,
  weekDays: AFGHAN_WEEK_DAYS,
  weekStartsOn: 6,

  format,
  addMonths,
  addDays,
  addYears,

  startOfWeek: (date) => dfStartOfWeek(date, WEEK_OPTIONS),
  endOfWeek: (date) => dfEndOfWeek(date, WEEK_OPTIONS),
  startOfMonth: (date) => dfStartOfMonth(date),
  endOfMonth: (date) => dfEndOfMonth(date),
  startOfYear: (date) => dfStartOfYear(date),
  endOfYear: (date) => dfEndOfYear(date),

  getMonthName: (date) => {
    const idx = Number(format(date, 'M')) - 1;
    return AFGHAN_MONTHS[idx] || '';
  },

  getMonthIndex: (date) => Number(format(date, 'M')) - 1,

  getDayName: (date) => {
    // date-fns-jalali: getDay() → 0=Sunday ... 6=Saturday
    // AFGHAN_WEEK_DAYS: 0=Saturday ... 6=Friday
    const jsDay = date.getDay();
    // Map: Saturday(6)→0, Sunday(0)→1, Monday(1)→2, ..., Friday(5)→6
    const map = [1, 2, 3, 4, 5, 6, 0];
    return AFGHAN_WEEK_DAYS[map[jsDay]];
  },

  getDayNumber: (date) => Number(format(date, 'd')),
  getYear: (date) => Number(format(date, 'yyyy')),
  getMonthNumber: (date) => Number(format(date, 'M')),
};