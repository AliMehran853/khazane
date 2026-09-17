import db from '../db/database';

function normalizeTransaction(transaction) {
  const amount = Number(transaction.amount);

  if (!Number.isFinite(amount) || amount <= 0) {
    throw new Error('مبلغ باید بیشتر از صفر باشد.');
  }

  if (!['income', 'expense'].includes(transaction.type)) {
    throw new Error('نوع تراکنش نامعتبر است.');
  }

  if (!transaction.categoryId) {
    throw new Error('دسته‌بندی را انتخاب کنید.');
  }

  const date = transaction.date ? new Date(transaction.date) : new Date();

  if (Number.isNaN(date.getTime())) {
    throw new Error('تاریخ تراکنش نامعتبر است.');
  }

  return {
    memberId: transaction.memberId || 'self',
    type: transaction.type,
    categoryId: transaction.categoryId,
    amount,
    // توجه: دیگر title نداریم، فقط note
    note: (transaction.note || '').trim(),
    date: date.toISOString(),
  };
}

export async function createTransaction(input) {
  const normalized = normalizeTransaction(input);
  const now = Date.now();

  const transaction = {
    id: crypto.randomUUID(),
    ...normalized,
    createdAt: now,
    updatedAt: now,
  };

  await db.transactions.add(transaction);
  return transaction;
}

export async function getTransactions({
  memberId = 'self',
  type,
  categoryId,
  startDate,
  endDate,
} = {}) {
  let transactions = await db.transactions
    .where('memberId')
    .equals(memberId)
    .toArray();

  if (type) {
    transactions = transactions.filter((t) => t.type === type);
  }
  if (categoryId) {
    transactions = transactions.filter((t) => t.categoryId === categoryId);
  }
  if (startDate) {
    const start = new Date(startDate);
    transactions = transactions.filter((t) => new Date(t.date) >= start);
  }
  if (endDate) {
    const end = new Date(endDate);
    transactions = transactions.filter((t) => new Date(t.date) <= end);
  }

  return transactions.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
  );
}

export async function getTransactionById(id) {
  return db.transactions.get(id);
}

export async function updateTransaction(id, input) {
  const existing = await db.transactions.get(id);
  if (!existing) throw new Error('تراکنش پیدا نشد.');

  const normalized = normalizeTransaction(input);
  const updated = { ...existing, ...normalized, updatedAt: Date.now() };

  await db.transactions.put(updated);
  return updated;
}

export async function deleteTransaction(id) {
  await db.transactions.delete(id);
}

export async function getAllTransactions(memberId = 'self') {
  return getTransactions({ memberId });
}