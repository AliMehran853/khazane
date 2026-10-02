import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getUserName,
  hasSeenWelcome,
  markWelcomeSeen,
} from '../services/settingsService';
import { useAppStore } from '../store/appStore';
import {
  STORAGE_KEYS,
  GREETING_CHECK_DELAY,
} from '../utils/constants';

const STORAGE_SHOWN_KEY = STORAGE_KEYS.greetingsShown;
const STORAGE_COUNTER_KEY = STORAGE_KEYS.greetingsCounter;

/* ============================================================
   Helpers — همه inline شده‌اند (بدون greetings.js)
   ============================================================ */

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

function getPeriodIdForHour(hour) {
  if (hour >= 5 && hour <= 7) return 'dawn';
  if (hour >= 8 && hour <= 10) return 'morning';
  if (hour >= 11 && hour <= 13) return 'forenoon';
  if (hour >= 14 && hour <= 16) return 'afternoon';
  if (hour >= 17 && hour <= 19) return 'evening';
  return 'night';
}

function getPeriodEmoji(periodId) {
  const map = {
    dawn: '🌅',
    morning: '☀️',
    forenoon: '🌤️',
    afternoon: '⛅',
    evening: '🌇',
    night: '🌙',
  };
  return map[periodId] || '✨';
}

/* ============================================================
   Hook
   ============================================================ */

export function useGreeting({ enabled = true } = {}) {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = useState(false);
  const [greeting, setGreeting] = useState(null);

  const dataVersion = useAppStore((s) => s.dataVersion);

  useEffect(() => {
    if (!enabled) return;
    let cancelled = false;

    async function check() {
      try {
        const rawName = await getUserName();
        const name = String(rawName || '').trim();
        if (!name) return;
        if (cancelled) return;

        const seenWelcome = await hasSeenWelcome();
        if (!seenWelcome) {
          await markWelcomeSeen();
          if (cancelled) return;

          setGreeting({
            name,
            greeting: t('greeting.welcome'),
            emoji: '👋',
            message: t('greeting.welcomeMessage'),
          });
          setVisible(true);
          return;
        }

        // پیام‌ها از i18n
        const greetingPeriods = t('greeting.periods', {
          returnObjects: true,
        });
        const greetingMessages = t('greeting.messages', {
          returnObjects: true,
        });

        if (!greetingMessages || typeof greetingMessages !== 'object') return;

        const hour = new Date().getHours();
        const periodId = getPeriodIdForHour(hour);
        const periodGreeting = greetingPeriods?.[periodId] || '';
        const messages = greetingMessages[periodId] || [];
        if (!messages.length) return;

        const shown = loadShown();
        if (shown[periodId]) return;

        const counter = loadCounter();
        const idx = Number(counter[periodId]) || 0;
        const message = messages[idx % messages.length];

        counter[periodId] = idx + 1;
        saveCounter(counter);

        shown[periodId] = true;
        shown.date = getTodayKey();
        saveShown(shown);

        if (cancelled) return;

        setGreeting({
          name,
          greeting: periodGreeting,
          emoji: getPeriodEmoji(periodId),
          message,
        });
        setVisible(true);
      } catch (err) {
        console.error('Greeting check failed:', err);
      }
    }

    const timer = setTimeout(check, GREETING_CHECK_DELAY);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [enabled, dataVersion, t, i18n.language]);

  const dismiss = useCallback(() => setVisible(false), []);

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