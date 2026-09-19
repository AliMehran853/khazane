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

function addWeeksLocal(date, n) {
  const d = new Date(date);
  d.setDate(d.getDate() + n * 7);
  return d;
}

// ============================================================
// دوره → بازه
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
    return { start: dfStartOfYear(date), end: dfEndOfYear(date) };
  }

  return { start: startOfDay(date), end: endOfDay(date) };
}

// ============================================================
// ناوبری هفته
// ============================================================

export function getWeekBaseDate(offset = 0) {
  return addWeeksLocal(new Date(), offset);
}

export function getWeekRangeFromOffset(offset = 0) {
  const baseDate = getWeekBaseDate(offset);
  return { ...getRange('weekly', baseDate), baseDate };
}

export function getWeekOffsetLabel(offset) {
  if (offset === 0) return 'این هفته';
  if (offset === -1) return 'هفته‌ی گذشته';
  return `${FA_NUM.format(Math.abs(offset))} هفته پیش`;
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
// روزهای هفته
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

// ============================================================
// روزهای ماه
// ============================================================

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

// ============================================================
// ماه‌های سال
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

// ============================================================
// فرمت‌های تاریخ مشخص
// ============================================================

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

// ============================================================
// ساعت ۱۲ ساعته — export می‌کنیم
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
// ⭐ فرمت تاریخ تراکنش — همیشه با تاریخ
//    امروز • ۲:۳۷ عصر
//    دیروز • ۹:۱۵ صبح
//    پنجشنبه ۲۶ سنبله • ۱۰:۴۲ صبح
//    پنجشنبه ۲۶ سنبله ۱۴۰۳
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