import { getCategoryIcon } from '../utils/categoryIcons';
import { formatTransactionDate } from '../utils/dates';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

export default function TransactionItem({ transaction, category }) {
  const Icon = getCategoryIcon(category?.icon);
  const isIncome = transaction.type === 'income';

  const iconBg = isIncome
    ? 'bg-[#4FD1BE]/[0.10] text-[#4FD1BE]'
    : 'bg-[#E2574C]/[0.10] text-[#E2574C]';

  return (
    <div className="flex items-center gap-3 border-b border-white/[0.05] px-4 py-3 last:border-b-0">
      <div
        className={[
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          iconBg,
        ].join(' ')}
      >
        <Icon size={18} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[13px] font-semibold text-[#F2EFE9]">
          {category?.name || 'بدون دسته'}
        </p>
        <p className="mt-0.5 truncate text-[10.5px] text-[#5C736C]">
          {transaction.note || formatTransactionDate(transaction.date)}
        </p>
      </div>

      <span
        className={[
          'shrink-0 text-[14px] font-bold',
          isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]',
        ].join(' ')}
      >
        {isIncome ? '+' : '-'}
        {formatNumber(transaction.amount)}
      </span>
    </div>
  );
}