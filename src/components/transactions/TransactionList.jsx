import TransactionItem from './TransactionItem';

export default function TransactionList({
  transactions = [],
  categoriesMap = {},
  emptyTitle = 'هنوز تراکنشی ثبت نشده است',
  emptyHint = 'از دکمه + برای ثبت اولین تراکنش استفاده کن.',
}) {
  if (transactions.length === 0) {
    return (
      <div className="rounded-[24px] border border-white/[0.06] bg-[#0F211E] px-4 py-8 text-center lg:px-6 lg:py-10">
        <p className="text-[13px] font-semibold text-[#8FA39D] lg:text-[13.5px]">
          {emptyTitle}
        </p>
        <p className="mt-1 text-[11px] text-[#5C736C] lg:text-[11.5px]">
          {emptyHint}
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E] lg:rounded-[22px]">
      {transactions.map((t) => (
        <TransactionItem
          key={t.id}
          transaction={t}
          category={categoriesMap[t.categoryId]}
        />
      ))}
    </div>
  );
}