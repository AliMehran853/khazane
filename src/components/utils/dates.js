import {
  format,
  startOfWeek as dfStartOfWeek,
  endOfWeek as dfEndOfWeek,
  startOfMonth as dfStartOfMonth,
  endOfMonth as dfEndOfMonth,
  startOfYear as dfStartOfYear,
  endOfYear as dfEndOfYear,
  addMonths,
  eachDayOfInterval,
} from 'date-fns-jalali';

// ============================================================
// ثابت‌ها
// ============================================================

const WEEK_OPTIONS = { weekStartsOn: 6 };

const PERSIAN_DAYS = [
  'یکشنبه',
  'دوشنبه',
  'سه‌شنبه',
  'چهارشنبه',
  'پنجشنبه',
  'جمعه',
  'شنبه',
];

const AFGHAN_MONTHS = [
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

// ============================================================
// Helpers
// ============================================================

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
  return dfStartOfWeek(date, WEEK_OPTIONS);
}

export function endOfWeek(date = new Date()) {
  return dfEndOfWeek(date, WEEK_OPTIONS);
}

// ============================================================
// دوره (Period) → بازه (Range)
// ============================================================

export function getRange(period = 'weekly', date = new Date()) {
  if (period === 'weekly') {
    return { start: startOfWeek(date), end: endOfWeek(date) };
  }

  if (period === 'monthly') {
    const start = dfStartOfMonth(date);
    const nextMonth = addMonths(start, 1);
    const end = new Date(nextMonth.getTime() - 1);
    return { start, end };
  }

  if (period === 'yearly') {
    return {
      start: dfStartOfYear(date),
      end: dfEndOfYear(date),
    };
  }

  return { start: startOfDay(date), end: endOfDay(date) };
}

// ============================================================
// لیست روزهای هفته (شنبه تا جمعه)
// ============================================================

export function getWeekDays(date = new Date()) {
  const start = startOfWeek(date);
  const end = endOfWeek(date);
  const days = eachDayOfInterval({ start, end });

  return days.map((d) => {
    const dayName = PERSIAN_DAYS[d.getDay()];
    return {
      date: d,
      label: dayName,
      shortLabel: dayName.slice(0, 2),
      key: d.toISOString(),
    };
  });
}

// ============================================================
// تعداد روزهای ماه شمسی (روش مطمئن: اختلاف با ماه بعد)
// ============================================================

export function getDaysInJalaliMonth(date = new Date()) {
  const start = dfStartOfMonth(date);
  const nextMonth = addMonths(start, 1);

  const diffMs = nextMonth.getTime() - start.getTime();
  const days = Math.round(diffMs / (1000 * 60 * 60 * 24));

  return days; // ۲۹، ۳۰ یا ۳۱
}

// ============================================================
// لیست روزهای ماه جاری (شمسی)
// ============================================================

export function getMonthDays(date = new Date()) {
  const start = dfStartOfMonth(date);
  const totalDays = getDaysInJalaliMonth(date);

  const days = [];
  const cursor = new Date(start);

  for (let i = 0; i < totalDays; i += 1) {
    days.push({
      date: new Date(cursor),
      // مستقیم از اندیس می‌سازیم - بدون فرمت که باگ داشته باشد
      label: String(i + 1),
      key: cursor.toISOString(),
    });
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

// ============================================================
// لیست ۱۲ ماه سال شمسی
// ============================================================

export function getYearMonths(date = new Date()) {
  const startYear = dfStartOfYear(date);

  return Array.from({ length: 12 }, (_, i) => {
    const monthStart = addMonths(startYear, i);
    const nextMonthStart = addMonths(monthStart, 1);
    const monthEnd = new Date(nextMonthStart.getTime() - 1);

    return {
      startDate: dfStartOfMonth(monthStart),
      endDate: monthEnd,
      label: AFGHAN_MONTHS[i],
      key: format(monthStart, 'yyyy-MM'),
    };
  });
}

// ============================================================
// برچسب امروز به شمسی
// ============================================================

export function getTodayLabel() {
  const d = new Date();
  const dayName = PERSIAN_DAYS[d.getDay()];
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  const year = format(d, 'yyyy');

  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

export function getTodayShort() {
  const d = new Date();
  const dayName = PERSIAN_DAYS[d.getDay()];
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';

  return `${dayName} ${dayNum} ${monthName}`;
}

// ============================================================
// فرمت تاریخ تراکنش (برای نمایش در لیست)
// ============================================================

export function formatTransactionDate(dateInput) {
  const d = new Date(dateInput);
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  const hour = String(d.getHours()).padStart(2, '0');
  const minute = String(d.getMinutes()).padStart(2, '0');

  const today = new Date();
  const isToday =
    d.getDate() === today.getDate() &&
    d.getMonth() === today.getMonth() &&
    d.getFullYear() === today.getFullYear();

  if (isToday) return `امروز، ${hour}:${minute}`;

  return `${dayNum} ${monthName}، ${hour}:${minute}`;
}