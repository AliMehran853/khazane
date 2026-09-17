import { useEffect, useState } from 'react';
import {
  getCategorySummary,
  getIncomeExpenseTrend,
  getPeriodSummary,
  getRecentTransactions,
} from '../services/analyticsService';
import { useAppStore } from '../store/appStore';

export function useAnalytics({ period = 'weekly', type, categoryId } = {}) {
  const dataVersion = useAppStore((state) => state.dataVersion);

  const [summary, setSummary] = useState({
    income: 0, expense: 0, balance: 0, transactionCount: 0,
  });
  const [trend, setTrend] = useState([]);
  const [categories, setCategories] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        const [summaryData, trendData, categoryData, recentData] = await Promise.all([
          getPeriodSummary({ period }),
          getIncomeExpenseTrend({ period, type, categoryId }),
          getCategorySummary({ period, type: type || 'expense' }),
          getRecentTransactions(),
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
    return () => { cancelled = true; };
  }, [period, type, categoryId, dataVersion]);

  return { summary, trend, categories, recentTransactions, loading };
}