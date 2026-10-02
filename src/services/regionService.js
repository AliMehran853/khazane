// ============================================================
// Region Service — مدیریت منطقه، زبان، تقویم، ارز
// ============================================================

import db from '../components/db/database';
import { seedDatabase } from '../components/db/seed';
import { changeLanguage } from '../i18n';
import { setCalendar } from '../utils/calendar';
import { DEFAULT_REGION, getRegion } from '../config/regions';
import { useAppStore } from '../components/store/appStore';

/* ---------- Settings keys ---------- */

const KEYS = {
  REGION: 'regionId',
  LANGUAGE: 'language',
  CALENDAR: 'calendarId',
  CURRENCY: 'currencyCode',
};

async function getSetting(key, fallback = null) {
  const row = await db.settings.get(key);
  return row?.value ?? fallback;
}

async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: Date.now() });
}

/* ---------- Read current ---------- */

export async function getCurrentRegionId() {
  return getSetting(KEYS.REGION, DEFAULT_REGION);
}

export async function getCurrentLanguage() {
  const regionId = await getCurrentRegionId();
  return getSetting(KEYS.LANGUAGE, getRegion(regionId).language);
}

export async function getCurrentCalendarId() {
  const regionId = await getCurrentRegionId();
  return getSetting(KEYS.CALENDAR, getRegion(regionId).calendar);
}

export async function getCurrentCurrencyCode() {
  const regionId = await getCurrentRegionId();
  return getSetting(KEYS.CURRENCY, getRegion(regionId).currency);
}

/* ---------- Apply on app start ---------- */

export async function applyRegion() {
  const regionId = await getCurrentRegionId();
  const language = await getCurrentLanguage();
  const calendarId = await getCurrentCalendarId();
  const currencyCode = await getCurrentCurrencyCode();

  changeLanguage(language);
  setCalendar(calendarId);

  // آپدیت استور
  useAppStore.getState().setRegion({ language, calendarId, currencyCode });

  return { regionId, language, calendarId, currencyCode };
}

/* ---------- Change language ---------- */

export async function updateLanguage(lang) {
  if (lang !== 'fa' && lang !== 'en') return false;
  await setSetting(KEYS.LANGUAGE, lang);
  changeLanguage(lang);
  useAppStore.getState().setLanguage(lang);
  return true;
}

/* ---------- Change region ---------- */

export async function updateRegion(regionId) {
  const region = getRegion(regionId);
  if (!region) return false;

  await setSetting(KEYS.REGION, regionId);
  await setSetting(KEYS.LANGUAGE, region.language);
  await setSetting(KEYS.CALENDAR, region.calendar);
  await setSetting(KEYS.CURRENCY, region.currency);

  changeLanguage(region.language);
  setCalendar(region.calendar);

  useAppStore.getState().setRegion({
    language: region.language,
    calendarId: region.calendar,
    currencyCode: region.currency,
  });

  return true;
}

/* ---------- Change currency (با بک‌آپ اجباری) ---------- */

export async function countTransactions() {
  return db.transactions.count();
}

export async function downloadBackupBeforeCurrencyChange() {
  const [transactions, categories, settings] = await Promise.all([
    db.transactions.toArray(),
    db.categories.toArray(),
    db.settings.toArray(),
  ]);

  const backup = {
    app: 'khazane',
    version: 1,
    exportedAt: new Date().toISOString(),
    reason: 'currency-change',
    transactions,
    categories,
    settings,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], {
    type: 'application/json',
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  const ts = new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-');
  a.href = url;
  a.download = `khazane-backup-before-currency-change-${ts}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);

  return true;
}

export async function changeCurrencyWithReset(
  newCurrencyCode,
  { onProgress } = {},
) {
  onProgress?.('backup');
  await downloadBackupBeforeCurrencyChange();

  onProgress?.('clearing');
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

  await seedDatabase();
  await setSetting(KEYS.CURRENCY, newCurrencyCode);
  useAppStore.getState().setCurrencyCode(newCurrencyCode);

  onProgress?.('done');

  return true;
}

export async function setCurrencyWithoutReset(code) {
  await setSetting(KEYS.CURRENCY, code);
  useAppStore.getState().setCurrencyCode(code);
}