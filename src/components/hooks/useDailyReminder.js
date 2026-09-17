import { useEffect, useState, useCallback } from 'react';
import db from '../db/database';

const HOURS_24_MS = 24 * 60 * 60 * 1000;

const KEYS = {
  REMINDER_ENABLED: 'reminderEnabled',
  LAST_SHOWN: 'reminderLastShownAt',
};

async function getSetting(key) {
  const row = await db.settings.get(key);
  return row?.value ?? null;
}

async function setSetting(key, value) {
  await db.settings.put({ key, value, updatedAt: Date.now() });
}

async function shouldShowReminder() {
  const enabled = Boolean(await getSetting(KEYS.REMINDER_ENABLED));
  if (!enabled) return false;

  const now = Date.now();

  // آخرین نمایش
  const lastShownAt = Number(await getSetting(KEYS.LAST_SHOWN)) || 0;
  if (now - lastShownAt < HOURS_24_MS) return false;

  // آخرین تراکنش
  const all = await db.transactions.toArray();
  const lastTransaction = all.reduce((latest, t) => {
    const ts = Number(t.createdAt) || new Date(t.date).getTime();
    return ts > latest ? ts : latest;
  }, 0);

  // اگر تراکنشی نداری یا از ۲۴ ساعت گذشته → نشان بده
  if (lastTransaction === 0) return true;
  return now - lastTransaction >= HOURS_24_MS;
}

export function useDailyReminder() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        const should = await shouldShowReminder();
        if (!cancelled) setVisible(should);
      } catch (err) {
        console.error('Daily reminder check failed:', err);
      }
    }

    const t = setTimeout(check, 1200);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, []);

  const dismiss = useCallback(async () => {
    setVisible(false);
    try {
      await setSetting(KEYS.LAST_SHOWN, Date.now());
    } catch (err) {
      console.error('Failed to save reminder dismissal:', err);
    }
  }, []);

  // ⭐ تابع تست برای دکمه‌ی Debug در تنظیمات
  const forceShow = useCallback(async () => {
    await db.settings.delete(KEYS.LAST_SHOWN);
    setVisible(true);
  }, []);

  return { visible, dismiss, forceShow };
}