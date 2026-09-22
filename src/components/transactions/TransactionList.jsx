import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions = [],
  categoriesMap = {},
  emptyTitle = 'هنوز تراکنشی ثبت نشده است',
  emptyHint = 'از دکمه + برای ثبت اولین تراکنش استفاده کن.',
}) {
  if (transactions.length === 0) {
    return (
      <div className="glass rounded-3xl px-4 py-8 text-center lg:px-6 lg:py-10">
        <p className="text-base font-semibold text-fg-2 lg:text-md">
          {emptyTitle}
        </p>
        <p className="mt-1 text-xs text-fg-3 lg:text-sm">{emptyHint}</p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-3xl">
      {transactions.map((t, index) => (
        <div
          key={t.id}
          className="tx-list-item"
          style={{ contentVisibility: index >= 15 ? 'auto' : 'visible' }}
        >
          <TransactionItem
            transaction={t}
            category={categoriesMap[t.categoryId]}
          />
        </div>
      ))}
    </div>
  );
}