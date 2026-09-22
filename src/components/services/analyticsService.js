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
import { MEMBER_ID } from '../utils/constants';

async function getMemberTransactions(memberId = MEMBER_ID) {
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

export async function getPeriodSummary({
  period = 'weekly',
  memberId = MEMBER_ID,
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

export async function getAllTimeSummary({ memberId = MEMBER_ID } = {}) {
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

export async function getCategorySummary({
  period = 'weekly',
  type = 'expense',
  memberId = MEMBER_ID,
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

export async function getIncomeExpenseTrend({
  period = 'weekly',
  memberId = MEMBER_ID,
  baseDate,
} = {}) {
  const transactions = await getMemberTransactions(memberId);
  const today = new Date();
  const todayKey = today.toDateString();
  const refDate = baseDate || today;

  if (period === 'daily') {
    const days = getWeekDays(refDate);
    const selectedKey = startOfDay(refDate).toDateString();
    return days.map((day) => {
      const s = startOfDay(day.date);
      const e = endOfDay(day.date);
      return {
        label: day.label,
        income: sumBetween(transactions, 'income', s, e),
        expense: sumBetween(transactions, 'expense', s, e),
        isCurrent: day.date.toDateString() === selectedKey,
      };
    });
  }

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

export async function getRecentTransactions({
  limit = 8,
  memberId = MEMBER_ID,
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

export async function getPeriodComparison({
  period = 'weekly',
  memberId = MEMBER_ID,
  baseDate,
  periodOffset = 0,
} = {}) {
  const refDate = baseDate || new Date();

  let baselineDate;
  if (periodOffset < 0) {
    baselineDate = new Date();
  } else {
    baselineDate = getPreviousPeriodDate(period, refDate);
  }

  const [current, previous] = await Promise.all([
    getPeriodSummary({ period, memberId, baseDate: refDate }),
    getPeriodSummary({ period, memberId, baseDate: baselineDate }),
  ]);

  return {
    current,
    previous,
    incomeChange: current.income - previous.income,
    expenseChange: current.expense - previous.expense,
  };
}