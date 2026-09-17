import TransactionList from '../transactions/TransactionList';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

export default function RecentTransactions({
  transactions = [],
  categoriesMap = {},
  limit = 5,
}) {
  const visible = transactions.slice(0, limit);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#F2EFE9]">
          تراکنش‌های اخیر
        </h2>
        <span className="text-[11px] text-[#5C736C]">
          {formatNumber(transactions.length)} تراکنش
        </span>
      </div>

      <div className="mt-3">
        <TransactionList
          transactions={visible}
          categoriesMap={categoriesMap}
        />
      </div>
    </section>
  );
}