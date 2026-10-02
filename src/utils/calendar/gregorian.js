// ============================================================
// Gregorian Calendar (تقویم میلادی) — بدون نیاز به کتابخانه
// ============================================================

export const GREGORIAN_MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const GREGORIAN_MONTHS_SHORT = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

export const GREGORIAN_WEEK_DAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

/* ---------- Internal helpers ---------- */

function _startOfWeek(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - d.getDay()); // 0 = Sunday
  return d;
}

function _endOfWeek(date) {
  const d = _startOfWeek(date);
  d.setDate(d.getDate() + 6);
  d.setHours(23, 59, 59, 999);
  return d;
}

function _startOfMonth(date) {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function _endOfMonth(date) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + 1);
  d.setDate(0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function _startOfYear(date) {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
}

function _endOfYear(date) {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
}

function _addDays(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

function _addMonths(date, n) {
  const d = new Date(date);
  const day = d.getDate();
  d.setDate(1);
  d.setMonth(d.getMonth() + n);
  const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  d.setDate(Math.min(day, lastDay));
  return d;
}

function _addYears(date, n) {
  const d = new Date(date);
  const month = d.getMonth();
  const day = d.getDate();
  d.setFullYear(d.getFullYear() + n);
  // Handle Feb 29 on non-leap years
  if (d.getMonth() !== month) d.setDate(0);
  return d;
}

/* ---------- Public API ---------- */

export const gregorianCalendar = {
  id: 'gregorian',
  months: GREGORIAN_MONTHS,
  monthsShort: GREGORIAN_MONTHS_SHORT,
  weekDays: GREGORIAN_WEEK_DAYS,
  weekStartsOn: 0,

  addDays: _addDays,
  addMonths: _addMonths,
  addYears: _addYears,

  startOfWeek: _startOfWeek,
  endOfWeek: _endOfWeek,
  startOfMonth: _startOfMonth,
  endOfMonth: _endOfMonth,
  startOfYear: _startOfYear,
  endOfYear: _endOfYear,

  getMonthName: (date) => GREGORIAN_MONTHS[date.getMonth()] || '',
  getMonthNameShort: (date) => GREGORIAN_MONTHS_SHORT[date.getMonth()] || '',
  getMonthIndex: (date) => date.getMonth(),
  getDayName: (date) => GREGORIAN_WEEK_DAYS[date.getDay()],
  getDayNumber: (date) => date.getDate(),
  getYear: (date) => date.getFullYear(),
  getMonthNumber: (date) => date.getMonth() + 1,
};