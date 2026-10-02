// ============================================================
// Iranian Solar Calendar (تقویم شمسی ایرانی)
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

export const IRANIAN_MONTHS = [
  'فروردین',
  'اردیبهشت',
  'خرداد',
  'تیر',
  'مرداد',
  'شهریور',
  'مهر',
  'آبان',
  'آذر',
  'دی',
  'بهمن',
  'اسفند',
];

export const IRANIAN_WEEK_DAYS = [
  'شنبه',
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
];

const WEEK_OPTIONS = { weekStartsOn: 6 };

export const iranianCalendar = {
  id: 'iranian',
  months: IRANIAN_MONTHS,
  weekDays: IRANIAN_WEEK_DAYS,
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
    return IRANIAN_MONTHS[idx] || '';
  },

  getMonthIndex: (date) => Number(format(date, 'M')) - 1,

  getDayName: (date) => {
    const jsDay = date.getDay();
    const map = [1, 2, 3, 4, 5, 6, 0];
    return IRANIAN_WEEK_DAYS[map[jsDay]];
  },

  getDayNumber: (date) => Number(format(date, 'd')),
  getYear: (date) => Number(format(date, 'yyyy')),
  getMonthNumber: (date) => Number(format(date, 'M')),
};