import db from '../db/database';
import { seedDatabase } from '../db/seed';

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

// ⭐ فیلدهای اسم و تخلص برای Onboarding
export async function getFirstName() {
  return getSetting('firstName', '');
}

export async function setFirstName(name) {
  return setSetting('firstName', String(name || '').trim());
}

export async function getLastName() {
  return getSetting('lastName', '');
}

export async function setLastName(name) {
  return setSetting('lastName', String(name || '').trim());
}

// ============================================================
// Onboarding
// ============================================================

export async function isOnboardingCompleted() {
  return Boolean(await getSetting('onboardingCompleted', false));
}

export async function setOnboardingCompleted(completed) {
  return setSetting('onboardingCompleted', Boolean(completed));
}

export async function getOnboardingStep() {
  return Number(await getSetting('onboardingStep', 0)) || 0;
}

export async function setOnboardingStep(step) {
  return setSetting('onboardingStep', Number(step) || 0);
}

// ⭐ اولین خوش‌آمدگویی — فقط یک بار نمایش داده می‌شود
export async function hasSeenWelcome() {
  const seen = await getSetting('welcomeGreetingSeenAt', null);
  return Boolean(seen);
}

export async function markWelcomeSeen() {
  return setSetting('welcomeGreetingSeenAt', Date.now());
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
  return getSetting('reminderTime', '21:00');
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
    },
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
    },
  );
}

// ============================================================
// ⭐ شروع مجدد کامل — همه‌چیز مثل اولین نصب
// ============================================================

const LOCAL_KEYS = [
  'khazane_greetings_shown',
  'khazane_greetings_counter',
  'khazane_install_dismissed_at',
];

export async function resetApp() {
  // ۱. پاک کردن کامل Dexie
  await db.transaction(
    'rw',
    db.transactions,
    db.categories,
    db.settings,
    async () => {
      await db.transactions.clear();
      await db.categories.clear();
      await db.settings.clear();
    },
  );

  // ۲. پاک کردن کلیدهای localStorage
  try {
    LOCAL_KEYS.forEach((key) => localStorage.removeItem(key));
  } catch {
    /* ignore */
  }

  // ۳. پاک کردن کل sessionStorage
  try {
    sessionStorage.clear();
  } catch {
    /* ignore */
  }

  // ۴. دوباره seed کن (دسته‌ها + تنظیمات پیش‌فرض)
  await seedDatabase();

  return true;
}