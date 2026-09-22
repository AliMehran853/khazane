import { useEffect, useState } from 'react';

import { getAllTimeSummary } from '../services/analyticsService';
import { useAppStore } from '../store/appStore';

export function useAllTimeSummary() {
  const dataVersion = useAppStore((s) => s.dataVersion);

  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const data = await getAllTimeSummary();
        if (cancelled) return;
        setSummary(data);
      } catch (err) {
        console.error('All-time summary failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  return { summary, loading };
}