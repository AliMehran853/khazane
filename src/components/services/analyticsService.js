import db from '../db/database';
import {
  getRange,
  getWeekDays,
  getMonthDays,
  getYearMonths,
  startOfDay,
  endOfDay,
  getPreviousPeriodDate,
} from '../utils/dates';

// ============================================================
// Helpers
// ============================================================

async function getMemberTransactions(memberId = 'self') {
  return db.transactions.where('memberId').equals(memberId).toArray();
}

function sumBetween(transactions, type, start, end) {
  let total = 0;
  for (const t of transactions) {
    if (t.type !== type) continue;
    const d = new Date(t.date);
    if (d >= start && d <= end) total += Number(t.amount);
  }
  return total;
}

function countBetween(transactions, start, end) {
  return transactions.filter((t) => {
    const d = new Date(t.date);
    return d >= start && d <= end;
  }).length;
}

// ============================================================
// خلاصه دوره
// ============================================================

export async function getPeriodSummary({
  period = 'weekly',
  memberId = 'self',
  baseDate,
} = {}) {
  const { start, end } = getRange(period, baseDate || new Date());
  const transactions = await getMemberTransactions(memberId);

  const income = sumBetween(transactions, 'income', start, end);
  const expense = sumBetween(transactions, 'expense', start, end);

  return {
    income,
    expense,
    balance: income - expense,
    transactionCount: countBetween(transactions, start, end),
  };
}

// ============================================================
// ⭐ خلاصه‌ی کل — مجموع همه‌ی دوره‌ها
// ============================================================

export async function getAllTimeSummary({ memberId = 'self' } = {}) {
  const transactions = await getMemberTransactions(memberId);

  let income = 0;
  let expense = 0;

  for (const t of transactions) {
    const amount = Number(t.amount) || 0;
    if (t.type === 'income') income += amount;
    else if (t.type === 'expense') expense += amount;
  }

  return {
    income,
    expense,
    balance: income - expense,
    transactionCount: transactions.length,
  };
}

// ============================================================
// خلاصه دسته‌بندی‌ها
// ============================================================

export async function getCategorySummary({
  period = 'weekly',
  type = 'expense',
  memberId = 'self',
  baseDate,
} = {}) {
  const { start, end } = getRange(period, baseDate || new Date());
  const transactions = await getMemberTransactions(memberId);

  const totals = new Map();

  for (const t of transactions) {
    if (t.type !== type) continue;
    const d = new Date(t.date);
    if (d < start || d > end) continue;
    const current = totals.get(t.categoryId) || 0;
    totals.set(t.categoryId, current + Number(t.amount));
  }

  const categories = await db.categories.toArray();

  return categories
    .filter((c) => c.type === type)
    .map((c) => ({ ...c, total: totals.get(c.id) || 0 }))
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);
}

// ============================================================
// روند درآمد و مصرف
// ============================================================

export async function getIncomeExpenseTrend({
  period = 'weekly',
  memberId = 'self',
  baseDate,
} = {}) {
  const transactions = await getMemberTransactions(memberId);
  const today = new Date();
  const todayKey = today.toDateString();
  const refDate = baseDate || today;

  if (period === 'weekly') {
    const days = getWeekDays(refDate);
    return days.map((day) => {
      const s = startOfDay(day.date);
      const e = endOfDay(day.date);
      return {
        label: day.label,
        income: sumBetween(transactions, 'income', s, e),
        expense: sumBetween(transactions, 'expense', s, e),
        isCurrent: day.date.toDateString() === todayKey,
      };
    });
  }

  if (period === 'monthly') {
    const days = getMonthDays(refDate);
    return days.map((day) => {
      const s = startOfDay(day.date);
      const e = endOfDay(day.date);
      return {
        label: day.label,
        income: sumBetween(transactions, 'income', s, e),
        expense: sumBetween(transactions, 'expense', s, e),
        isCurrent: day.date.toDateString() === todayKey,
      };
    });
  }

  if (period === 'yearly') {
    const months = getYearMonths(refDate);
    return months.map((m) => ({
      label: m.label,
      income: sumBetween(transactions, 'income', m.startDate, m.endDate),
      expense: sumBetween(transactions, 'expense', m.startDate, m.endDate),
      isCurrent: today >= m.startDate && today <= m.endDate,
    }));
  }

  return [];
}

// ============================================================
// تراکنش‌های اخیر (با فیلتر دوره)
// ============================================================

export async function getRecentTransactions({
  limit = 8,
  memberId = 'self',
  period,
  baseDate,
} = {}) {
  const transactions = await getMemberTransactions(memberId);
  let filtered = transactions;

  if (period) {
    const { start, end } = getRange(period, baseDate || new Date());
    filtered = transactions.filter((t) => {
      const d = new Date(t.date);
      return d >= start && d <= end;
    });
  }

  return filtered
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}

// ============================================================
// ⭐ مقایسه با دوره‌ی مرجع
//
//   این هفته     → مقایسه با هفته‌ی گذشته
//   هفته‌ی گذشته → مقایسه با این هفته‌ی جاری
//   ۴ هفته پیش   → مقایسه با این هفته‌ی جاری
// ============================================================

export async function getPeriodComparison({
  period = 'weekly',
  memberId = 'self',
  baseDate,
  weekOffset = 0,
} = {}) {
  const refDate = baseDate || new Date();

  let baselineDate;

  if (period === 'weekly' && weekOffset < 0) {
    // ⭐ کاربر در یک هفته‌ی گذشته → مقایسه با این هفته‌ی جاری
    baselineDate = new Date();
  } else {
    // این هفته یا ماه/سال → مقایسه با دوره‌ی قبل
    baselineDate = getPreviousPeriodDate(period, refDate);
  }

  const [current, previous] = await Promise.all([
    getPeriodSummary({ period, memberId, baseDate: refDate }),
    getPeriodSummary({ period, memberId, baseDate: baselineDate }),
  ]);

  function pct(curr, prev) {
    if (prev === 0) {
      return curr === 0 ? 0 : null;
    }
    return ((curr - prev) / prev) * 100;
  }

  return {
    current,
    previous,
    incomeChange: pct(current.income, previous.income),
    expenseChange: pct(current.expense, previous.expense),
  };
}