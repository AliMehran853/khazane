import { useCallback, useEffect, useState } from 'react';

import { getPeriodForHour } from '../utils/greetings';
import { getUserName } from '../services/settingsService';
import { useAppStore } from '../store/appStore';

const STORAGE_SHOWN_KEY = 'khazane_greetings_shown';
const STORAGE_COUNTER_KEY = 'khazane_greetings_counter';

function getTodayKey() {
  const d = new Date();
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

function loadShown() {
  try {
    const raw = localStorage.getItem(STORAGE_SHOWN_KEY);
    if (!raw) return {};
    const data = JSON.parse(raw);
    if (!data || data.date !== getTodayKey()) return {};
    return data;
  } catch {
    return {};
  }
}

function saveShown(shown) {
  try {
    localStorage.setItem(STORAGE_SHOWN_KEY, JSON.stringify(shown));
  } catch {
    /* ignore */
  }
}

function loadCounter() {
  try {
    const raw = localStorage.getItem(STORAGE_COUNTER_KEY);
    if (!raw) return {};
    return JSON.parse(raw) || {};
  } catch {
    return {};
  }
}

function saveCounter(counter) {
  try {
    localStorage.setItem(STORAGE_COUNTER_KEY, JSON.stringify(counter));
  } catch {
    /* ignore */
  }
}

/**
 * useGreeting
 * @param {{ enabled?: boolean }} options
 *   enabled: فقط وقتی true باشه چک می‌کنه (بعد از unlock)
 */
export function useGreeting({ enabled = true } = {}) {
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState(null);

  // ⭐ با هر refreshData (مثلاً ذخیره‌ی اسم) دوباره چک می‌شه
  const dataVersion = useAppStore((s) => s.dataVersion);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function check() {
      try {
        const rawName = await getUserName();
        const name = String(rawName || '').trim();
        if (!name) {
          console.log('[Greeting] نام کاربر ست نشده — پیام نمایش داده نمی‌شود');
          return;
        }
        if (cancelled) return;

        const period = getPeriodForHour(new Date().getHours());
        if (!period.messages?.length) return;

        const shown = loadShown();
        if (shown[period.id]) {
          console.log(
            `[Greeting] بازه‌ی «${period.id}» امروز قبلاً نمایش داده شده`,
          );
          return;
        }

        const counter = loadCounter();
        const idx = Number(counter[period.id]) || 0;
        const message = period.messages[idx % period.messages.length];

        counter[period.id] = idx + 1;
        saveCounter(counter);

        shown[period.id] = true;
        shown.date = getTodayKey();
        saveShown(shown);

        if (cancelled) return;

        console.log(`[Greeting] نمایش پیام بازه‌ی «${period.id}»`);
        setGreeting({
          name,
          greeting: period.greeting,
          emoji: period.emoji,
          message,
        });
        setVisible(true);
      } catch (err) {
        console.error('Greeting check failed:', err);
      }
    }

    const t = setTimeout(check, 1400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [enabled, dataVersion]);

  const dismiss = useCallback(() => setVisible(false), []);

  // ⭐ برای تست از تنظیمات
  const resetToday = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_SHOWN_KEY);
    } catch {
      /* ignore */
    }
    setVisible(false);
  }, []);

  return { visible, greeting, dismiss, resetToday };
}