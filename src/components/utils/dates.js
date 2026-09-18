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
// تعداد روزهای ماه شمسی
// ============================================================

export function getDaysInJalaliMonth(date = new Date()) {
  const start = dfStartOfMonth(date);
  const nextMonth = addMonths(start, 1);
  const diffMs = nextMonth.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
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
  const year = format(d, 'jYYYY');

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
// فرمت ساعت ۱۲ ساعته
// ============================================================

function formatTime12(dateInput) {
  const d = new Date(dateInput);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const period = h24 < 12 ? 'صبح' : 'عصر';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  const minute = String(m).padStart(2, '0');
  return `${h12}:${minute} ${period}`;
}

// ============================================================
// فرمت تاریخ تراکنش — سبک واتساپ
//
//  ۰ روز: امروز • ۲:۳۷ عصر
//  ۱ روز: دیروز • ۹:۱۵ صبح
//  ۲-۶ روز: سه‌شنبه • ۲:۳۷ عصر
//  ۷-۱۳ روز: هفته‌ی پیش • ۲:۳۷ عصر
//  ۱۴+ روز (سال جاری): ۲۶ سنبله • ۲:۳۷ عصر
//  سال‌های قبل: ۲۶ سنبله ۱۴۰۲
// ============================================================

export function formatTransactionDate(dateInput) {
  const d = new Date(dateInput);
  const now = new Date();

  // فاصله به «روز» (بدون ساعت)
  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const timePart = formatTime12(d);

  // ---------- امروز ----------
  if (diffDays === 0) {
    return `امروز • ${timePart}`;
  }

  // ---------- دیروز ----------
  if (diffDays === 1) {
    return `دیروز • ${timePart}`;
  }

  // ---------- ۲ تا ۶ روز پیش: نام روز ----------
  if (diffDays >= 2 && diffDays <= 6) {
    const dayName = PERSIAN_DAYS[d.getDay()];
    return `${dayName} • ${timePart}`;
  }

  // ---------- ۷ تا ۱۳ روز پیش: هفته‌ی پیش ----------
  if (diffDays >= 7 && diffDays <= 13) {
    return `هفته‌ی پیش • ${timePart}`;
  }

  // ---------- بقیه: تاریخ کامل شمسی ----------
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  const year = format(d, 'jYYYY');
  const currentYear = format(now, 'jYYYY');

  // اگر همان سال جاری است: تاریخ + ساعت
  if (year === currentYear) {
    return `${dayNum} ${monthName} • ${timePart}`;
  }

  // سال‌های قبل: تاریخ + سال، بدون ساعت
  return `${dayNum} ${monthName} ${year}`;
}