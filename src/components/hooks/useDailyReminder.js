import { useEffect, useState, useCallback } from 'react';

import db from '../db/database';
import {
  REMINDER_HOURS_MS,
  REMINDER_CHECK_DELAY,
} from '../utils/constants';

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
  const lastShownAt = Number(await getSetting(KEYS.LAST_SHOWN)) || 0;
  if (now - lastShownAt < REMINDER_HOURS_MS) return false;

  // Optimized: use Dexie's orderBy instead of loading all transactions
  const latestTx = await db.transactions
    .orderBy('createdAt')
    .last()
    .catch(() => null);

  const lastTransaction = latestTx
    ? Number(latestTx.createdAt) || new Date(latestTx.date).getTime()
    : 0;

  if (lastTransaction === 0) return true;
  return now - lastTransaction >= REMINDER_HOURS_MS;
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

    const t = setTimeout(check, REMINDER_CHECK_DELAY);

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

  const forceShow = useCallback(async () => {
    await db.settings.delete(KEYS.LAST_SHOWN);
    setVisible(true);
  }, []);

  return { visible, dismiss, forceShow };
}