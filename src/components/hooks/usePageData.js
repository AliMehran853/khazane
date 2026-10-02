import { useEffect, useState } from 'react';

import { useAppStore } from '../store/appStore';
import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { getPeriodRange } from '../utils/dates';

export function usePageData({ type, period, periodOffset }) {
  const dataVersion = useAppStore((s) => s.dataVersion);

  const [transactions, setTransactions] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const range = getPeriodRange(period, periodOffset);
      const [txs, cats] = await Promise.all([
        getTransactions({
          type,
          startDate: range.start,
          endDate: range.end,
        }),
        getCategories(type),
      ]);
      if (cancelled) return;

      setTransactions(txs);
      const map = {};
      cats.forEach((c) => {
        map[c.id] = c;
      });
      setCategoriesMap(map);
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [dataVersion, period, periodOffset, type]);

  return { transactions, categoriesMap };
}