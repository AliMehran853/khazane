import {
  format,
  startOfWeek as dfStartOfWeek,
  endOfWeek as dfEndOfWeek,
  startOfMonth as dfStartOfMonth,
  endOfMonth as dfEndOfMonth,
  startOfYear as dfStartOfYear,
  endOfYear as dfEndOfYear,
  addMonths,
} from 'date-fns-jalali';

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

const FA_NUM = new Intl.NumberFormat('fa-AF');

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
// ⭐ ناوبری عمومی دوره‌ها (daily / weekly / monthly / yearly)
// ============================================================

export function getPeriodBaseDate(period, offset = 0) {
  const d = new Date();

  if (period === 'daily') {
    d.setDate(d.getDate() + offset);
    return d;
  }

  if (period === 'weekly') {
    d.setDate(d.getDate() + offset * 7);
    return d;
  }

  if (period === 'monthly') {
    return addMonths(d, offset);
  }

  if (period === 'yearly') {
    d.setFullYear(d.getFullYear() + offset);
    return d;
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

// ============================================================
// برچسب‌های دوره
// ============================================================

export function getPeriodOffsetLabel(period, offset = 0) {
  if (offset === 0) {
    if (period === 'daily') return 'امروز';
    if (period === 'weekly') return 'این هفته';
    if (period === 'monthly') return 'این ماه';
    if (period === 'yearly') return 'امسال';
  }

  if (period === 'daily') {
    if (offset === -1) return 'دیروز';
    if (offset === 1) return 'فردا';
    const n = Math.abs(offset);
    return offset < 0
      ? `${FA_NUM.format(n)} روز پیش`
      : `${FA_NUM.format(n)} روز بعد`;
  }

  if (period === 'weekly') {
    if (offset === -1) return 'هفته‌ی گذشته';
    if (offset === 1) return 'هفته‌ی بعد';
    const n = Math.abs(offset);
    return offset < 0
      ? `${FA_NUM.format(n)} هفته پیش`
      : `${FA_NUM.format(n)} هفته بعد`;
  }

  if (period === 'monthly') {
    const d = getPeriodBaseDate('monthly', offset);
    const monthIdx = Number(format(d, 'M')) - 1;
    const year = format(d, 'yyyy');
    const monthName = AFGHAN_MONTHS[monthIdx] || '';
    return `${monthName} ${year}`;
  }

  if (period === 'yearly') {
    const d = getPeriodBaseDate('yearly', offset);
    return format(d, 'yyyy');
  }

  return '';
}

export function getPeriodSubLabel(period, offset = 0) {
  const baseDate = getPeriodBaseDate(period, offset);

  if (period === 'daily') {
    return formatShortDate(baseDate);
  }

  if (period === 'weekly') {
    const start = startOfWeek(baseDate);
    const end = endOfWeek(baseDate);
    return formatWeekRange(start, end);
  }

  if (period === 'monthly') {
    const start = dfStartOfMonth(baseDate);
    const nextMonth = addMonths(start, 1);
    const end = new Date(nextMonth.getTime() - 1);
    return formatWeekRange(start, end);
  }

  // yearly — خود برچسب سال کافیه
  return null;
}

// ============================================================
// دوره → بازه
// ============================================================

export function getRange(period = 'weekly', date = new Date()) {
  if (period === 'daily') {
    return { start: startOfDay(date), end: endOfDay(date) };
  }

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
    return { start: dfStartOfYear(date), end: dfEndOfYear(date) };
  }

  return { start: startOfDay(date), end: endOfDay(date) };
}

export function getPeriodRange(period, offset = 0) {
  const baseDate = getPeriodBaseDate(period, offset);
  return { ...getRange(period, baseDate), baseDate };
}

// ============================================================
// ⭐ متن توصیفی مقایسه
// ============================================================

export function getComparisonLabel(period, offset = 0) {
  if (period === 'daily') {
    if (offset === 0) return 'امروز نسبت به دیروز';
    if (offset === -1) return 'دیروز نسبت به امروز';
    const n = Math.abs(offset);
    return `${FA_NUM.format(n)} روز پیش نسبت به امروز`;
  }

  if (period === 'weekly') {
    if (offset === 0) return 'این هفته نسبت به هفته‌ی گذشته';
    if (offset === -1) return 'هفته‌ی گذشته نسبت به این هفته';
    const n = Math.abs(offset);
    return `${FA_NUM.format(n)} هفته پیش نسبت به این هفته`;
  }

  if (period === 'monthly') {
    if (offset === 0) return 'این ماه نسبت به ماه گذشته';
    if (offset === -1) return 'ماه گذشته نسبت به این ماه';
    const n = Math.abs(offset);
    return `${FA_NUM.format(n)} ماه پیش نسبت به این ماه`;
  }

  if (period === 'yearly') {
    if (offset === 0) return 'امسال نسبت به سال گذشته';
    if (offset === -1) return 'سال گذشته نسبت به امسال';
    const n = Math.abs(offset);
    return `${FA_NUM.format(n)} سال پیش نسبت به امسال`;
  }

  return '';
}

// ============================================================
// ⭐ دوره‌ی قبل (برای حالت این دوره / دوره‌ی گذشته)
// ============================================================

export function getPreviousPeriodDate(period, baseDate) {
  const d = new Date(baseDate || new Date());

  if (period === 'daily') {
    d.setDate(d.getDate() - 1);
    return d;
  }

  if (period === 'weekly') {
    d.setDate(d.getDate() - 7);
    return d;
  }

  if (period === 'monthly') {
    return addMonths(d, -1);
  }

  if (period === 'yearly') {
    d.setFullYear(d.getFullYear() - 1);
    return d;
  }

  return d;
}

// ============================================================
// روزهای هفته / ماه / سال
// ============================================================

export function getWeekDays(date = new Date()) {
  const weekStart = startOfDay(startOfWeek(date));
  const days = [];
  for (let i = 0; i < 7; i += 1) {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    const dayName = PERSIAN_DAYS[d.getDay()] || '';
    days.push({
      date: d,
      label: dayName,
      shortLabel: dayName.slice(0, 2),
      key: d.toISOString(),
    });
  }
  return days;
}

export function getDaysInJalaliMonth(date = new Date()) {
  const start = dfStartOfMonth(date);
  const nextMonth = addMonths(start, 1);
  const diffMs = nextMonth.getTime() - start.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

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
// برچسب‌های امروز
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

export function formatShortDate(dateInput) {
  const d = new Date(dateInput);
  const dayName = PERSIAN_DAYS[d.getDay()];
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  return `${dayName} ${dayNum} ${monthName}`;
}

export function formatFullDate(dateInput) {
  const d = new Date(dateInput);
  const dayName = PERSIAN_DAYS[d.getDay()];
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  const year = format(d, 'yyyy');
  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

export function formatWeekRange(start, end) {
  const sDay = Number(format(start, 'd'));
  const eDay = Number(format(end, 'd'));
  const sMonthIdx = Number(format(start, 'M')) - 1;
  const eMonthIdx = Number(format(end, 'M')) - 1;
  const sMonth = AFGHAN_MONTHS[sMonthIdx] || '';
  const eMonth = AFGHAN_MONTHS[eMonthIdx] || '';

  if (sMonthIdx === eMonthIdx) {
    return `${FA_NUM.format(sDay)} - ${FA_NUM.format(eDay)} ${sMonth}`;
  }
  return `${FA_NUM.format(sDay)} ${sMonth} - ${FA_NUM.format(eDay)} ${eMonth}`;
}

// ============================================================
// ساعت
// ============================================================

export function formatTime12(dateInput) {
  const d = new Date(dateInput);
  const h24 = d.getHours();
  const m = d.getMinutes();
  const period = h24 < 12 ? 'صبح' : 'عصر';
  let h12 = h24 % 12;
  if (h12 === 0) h12 = 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

export function formatFullDateTime(dateInput) {
  return `${formatFullDate(dateInput)} • ${formatTime12(dateInput)}`;
}

// ============================================================
// فرمت تاریخ تراکنش
// ============================================================

export function formatTransactionDate(dateInput) {
  const d = new Date(dateInput);
  const now = new Date();

  const diffDays = Math.floor(
    (startOfDay(now).getTime() - startOfDay(d).getTime()) /
      (1000 * 60 * 60 * 24),
  );

  const timePart = formatTime12(d);

  if (diffDays === 0) return `امروز • ${timePart}`;
  if (diffDays === 1) return `دیروز • ${timePart}`;

  const dayName = PERSIAN_DAYS[d.getDay()];
  const dayNum = format(d, 'd');
  const monthIdx = Number(format(d, 'M')) - 1;
  const monthName = AFGHAN_MONTHS[monthIdx] || '';
  const year = format(d, 'yyyy');
  const currentYear = format(now, 'yyyy');

  if (year === currentYear) {
    return `${dayName} ${dayNum} ${monthName} • ${timePart}`;
  }

  return `${dayName} ${dayNum} ${monthName} ${year}`;
}

/**
 * برچسب دوره‌ی مبنا (baseline)
 *   offset = 0  → مبنا: دوره‌ی قبل («دیروز» / «هفته‌ی گذشته» / ...)
 *   offset < 0  → مبنا: این دوره («امروز» / «این هفته» / ...)
 */
export function getBaselineLabel(period, offset = 0) {
  const baselineOffset = offset < 0 ? 0 : -1;
  return getPeriodOffsetLabel(period, baselineOffset);
}