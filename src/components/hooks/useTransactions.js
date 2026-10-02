import { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  createTransaction,
  deleteTransaction,
  getTransactions,
} from '../services/transactionService';

export function useTransactions({ type, categoryId, periodRange } = {}) {
  const { t } = useTranslation();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadTransactions = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const data = await getTransactions({
        type,
        categoryId,
        startDate: periodRange?.start,
        endDate: periodRange?.end,
      });

      setTransactions(data);
    } catch (err) {
      console.error(err);
      setError(t('errors.loadTransactionsFailed'));
    } finally {
      setLoading(false);
    }
  }, [type, categoryId, periodRange, t]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const addTransaction = async (data) => {
    const transaction = await createTransaction(data);
    await loadTransactions();
    return transaction;
  };

  const removeTransaction = async (id) => {
    await deleteTransaction(id);
    await loadTransactions();
  };

  return {
    transactions,
    loading,
    error,
    addTransaction,
    removeTransaction,
    reload: loadTransactions,
  };
}