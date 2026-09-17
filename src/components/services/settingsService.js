import db from '../db/database';

// ============================================================
// Generic
// ============================================================

export async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key);
  return row?.value ?? fallback;
}

export async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: Date.now() });
}

export async function getAllSettings() {
  const rows = await db.settings.toArray();
  const result = {};
  for (const row of rows) result[row.key] = row.value;
  return result;
}

// ============================================================
// Profile
// ============================================================

export async function getUserName() {
  return getSetting('userName', '');
}

export async function setUserName(name) {
  return setSetting('userName', String(name || '').trim());
}

// ============================================================
// Currency
// ============================================================

export async function getCurrencyLabel() {
  return getSetting('currencyLabel', 'افغانی');
}

export async function setCurrencyLabel(label) {
  return setSetting('currencyLabel', label);
}

// ============================================================
// Reminder
// ============================================================

export async function isReminderEnabled() {
  return Boolean(await getSetting('reminderEnabled', false));
}

export async function setReminderEnabled(enabled) {
  return setSetting('reminderEnabled', Boolean(enabled));
}

export async function getReminderTime() {
  return getSetting('reminderTime', '21:00'); // ⭐ پیش‌فرض ۹ شب
}

export async function setReminderTime(time) {
  return setSetting('reminderTime', time);
}

// ============================================================
// Backup / Restore
// ============================================================

export async function exportAllData() {
  const [transactions, categories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ]);

  return {
    app: 'khazane',
    version: 1,
    exportedAt: new Date().toISOString(),
    transactions,
    categories,
    settings,
  };
}

export async function importAllData(data) {
  if (
    !data ||
    data.app !== 'khazane' ||
    !Array.isArray(data.transactions) ||
    !Array.isArray(data.categories) ||
    !Array.isArray(data.settings)
  ) {
    throw new Error('فایل پشتیبان نامعتبر است.');
  }

  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.settings,
    async () => {
      await db.transactions.clear();
      await db.categories.clear();
      await db.settings.clear();

      if (data.transactions.length) {
        await db.transactions.bulkAdd(data.transactions);
      }
      if (data.categories.length) {
        await db.categories.bulkAdd(data.categories);
      }
      if (data.settings.length) {
        await db.settings.bulkAdd(data.settings);
      }
    }
  );
}

export async function clearAllData() {
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.settings,
    async () => {
      await db.transactions.clear();
      await db.categories.clear();
      await db.settings.clear();
    }
  );
}