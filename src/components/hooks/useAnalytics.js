import { useEffect, useMemo, useState } from 'react';

import {
  getCategorySummary,
  getIncomeExpenseTrend,
  getPeriodSummary,
  getRecentTransactions,
} from '../services/analyticsService';
import { useAppStore } from '../store/appStore';
import { getWeekBaseDate } from '../utils/dates';

export function useAnalytics({
  period = 'weekly',
  type,
  categoryId,
  weekOffset = 0,
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
  const [loading, setLoading] = useState(true);

  // ⭐ تاریخ پایه برای هفته‌ی انتخابی
  const baseDate = useMemo(() => {
    if (period !== 'weekly') return new Date();
    if (weekOffset === 0) return new Date();
    return getWeekBaseDate(weekOffset);
  }, [period, weekOffset]);

  // ⭐ برای وابستگی useEffect (چون Date object هر رندر متفاوته)
  const baseTime = baseDate.getTime();

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [summaryData, trendData, categoryData, recentData] =
          await Promise.all([
            getPeriodSummary({ period, baseDate }),
            getIncomeExpenseTrend({ period, type, categoryId, baseDate }),
            getCategorySummary({ period, type: type || 'expense', baseDate }),
            getRecentTransactions({ period, baseDate }),
          ]);
        if (cancelled) return;
        setSummary(summaryData);
        setTrend(trendData);
        setCategories(categoryData);
        setRecentTransactions(recentData);
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
  }, [period, type, categoryId, dataVersion, baseTime]);

  return { summary, trend, categories, recentTransactions, loading, baseDate };
}