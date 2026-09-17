import db from '../db/database';
import {
  getRange,
  getWeekDays,
  getMonthDays,
  getYearMonths,
  startOfDay,
  endOfDay,
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

export async function getPeriodSummary({ period = 'weekly', memberId = 'self' } = {}) {
  const { start, end } = getRange(period);
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
// خلاصه دسته‌بندی‌ها
// ============================================================

export async function getCategorySummary({
  period = 'weekly',
  type = 'expense',
  memberId = 'self',
} = {}) {
  const { start, end } = getRange(period);
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
// روند درآمد و مصرف (با isCurrent)
// ============================================================

export async function getIncomeExpenseTrend({
  period = 'weekly',
  memberId = 'self',
} = {}) {
  const transactions = await getMemberTransactions(memberId);
  const today = new Date();
  const todayKey = today.toDateString();

  // -------- هفتگی: ۷ روز هفته --------
  if (period === 'weekly') {
    const days = getWeekDays();
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

  // -------- ماهانه: ۳۰ روز ماه --------
  if (period === 'monthly') {
    const days = getMonthDays();
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

  // -------- سالانه: ۱۲ ماه --------
  if (period === 'yearly') {
    const months = getYearMonths();
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
// تراکنش‌های اخیر
// ============================================================

export async function getRecentTransactions({ limit = 8, memberId = 'self' } = {}) {
  const transactions = await getMemberTransactions(memberId);

  return transactions
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, limit);
}