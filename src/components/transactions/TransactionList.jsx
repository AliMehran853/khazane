import { useTranslation } from 'react-i18next';

import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions = [],
  categoriesMap = {},
  emptyTitle,
  emptyHint,
}) {
  const { t } = useTranslation();

  const finalEmptyTitle = emptyTitle || t('transaction.noTransactions');
  const finalEmptyHint = emptyHint || t('transaction.noTransactionsHint');

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-3xl px-4 py-8 text-center lg:px-6 lg:py-10">
        <p className="text-base font-semibold text-fg-2 lg:text-md">
          {finalEmptyTitle}
        </p>
        <p className="mt-1 text-xs text-fg-3 lg:text-sm">
          {finalEmptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {transactions.map((tx, index) => (
        <div
          key={tx.id}
          className="tx-list-item"
          style={{ contentVisibility: index >= 15 ? 'auto' : 'visible' }}
        >
          <TransactionItem
            transaction={tx}
            category={categoriesMap[tx.categoryId]}
          />
        </div>
      ))}
    </div>
  );
}