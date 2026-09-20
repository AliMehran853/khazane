import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions = [],
  categoriesMap = {},
  emptyTitle = 'هنوز تراکنشی ثبت نشده است',
  emptyHint = 'از دکمه + برای ثبت اولین تراکنش استفاده کن.',
}) {
  if (transactions.length === 0) {
    return (
      <div className="glass rounded-[24px] px-4 py-8 text-center lg:px-6 lg:py-10">
        <p className="text-[13px] font-semibold text-[#94A3B8] lg:text-[13.5px]">
          {emptyTitle}
        </p>
        <p className="mt-1 text-[11px] text-[#64748B] lg:text-[11.5px]">
          {emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="glass overflow-hidden rounded-[24px] lg:rounded-[22px]">
      {transactions.map((t, index) => (
        <div
          key={t.id}
          className="tx-list-item"
          style={{
            contentVisibility: index >= 15 ? 'auto' : 'visible',
          }}
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