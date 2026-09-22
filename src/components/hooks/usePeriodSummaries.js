import { useEffect, useState } from 'react';

import {
  getPeriodSummary,
  getAllTimeSummary,
} from '../services/analyticsService';
import { useAppStore } from '../store/appStore';

export function usePeriodSummaries() {
  const dataVersion = useAppStore((s) => s.dataVersion);

  const [summaries, setSummaries] = useState({
    daily: null,
    weekly: null,
    monthly: null,
    yearly: null,
    allTime: null,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [daily, weekly, monthly, yearly, allTime] = await Promise.all([
          getPeriodSummary({ period: 'daily' }),
          getPeriodSummary({ period: 'weekly' }),
          getPeriodSummary({ period: 'monthly' }),
          getPeriodSummary({ period: 'yearly' }),
          getAllTimeSummary(),
        ]);
        if (cancelled) return;
        setSummaries({ daily, weekly, monthly, yearly, allTime });
      } catch (err) {
        console.error('Period summaries failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  return { summaries, loading };
}