import { useEffect, useMemo, useState } from 'react';

import {
  getCategorySummary,
  getIncomeExpenseTrend,
  getPeriodSummary,
  getRecentTransactions,
  getPeriodComparison,
} from '../services/analyticsService';
import { useAppStore } from '../store/appStore';
import { getPeriodBaseDate } from '../utils/dates';

export function useAnalytics({
  period = 'weekly',
  type,
  categoryId,
  periodOffset = 0,
} = {}) {
  const dataVersion = useAppStore((state) => state.dataVersion);

  const [summary, setSummary] = useState({
    income: 0,
    expense: 0,
    balance: 0,
    transactionCount: 0,
  });
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [comparison, setComparison] = useState(null);
  const [loading, setLoading] = useState(true);

  const baseDate = useMemo(() => {
    if (periodOffset === 0) return new Date();
    return getPeriodBaseDate(period, periodOffset);
  }, [period, periodOffset]);

  const baseTime = baseDate.getTime();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [
          summaryData,
          trendData,
          categoryData,
          recentData,
          comparisonData,
        ] = await Promise.all([
          getPeriodSummary({ period, baseDate }),
          getIncomeExpenseTrend({ period, type, categoryId, baseDate }),
          getCategorySummary({ period, type: type || 'expense', baseDate }),
          getRecentTransactions({ period, baseDate }),
          getPeriodComparison({ period, baseDate, periodOffset }),
        ]);
        if (cancelled) return;
        setSummary(summaryData);
        setTrend(trendData);
        setCategories(categoryData);
        setRecentTransactions(recentData);
        setComparison(comparisonData);
      } catch (error) {
        console.error('Analytics loading failed:', error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [period, type, categoryId, dataVersion, baseTime, periodOffset]);

  return {
    summary,
    trend,
    categories,
    recentTransactions,
    comparison,
    loading,
    baseDate,
  };
}