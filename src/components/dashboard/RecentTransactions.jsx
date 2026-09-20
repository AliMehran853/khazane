import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ListChecks } from 'lucide-react';

import TransactionList from '../transactions/TransactionList';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

const INITIAL_LIMIT = 5;
const EXPANDED_LIMIT = 20;

export default function RecentTransactions({
  transactions = [],
  categoriesMap = {},
  limit,
  showNavigateButton = true,
  navigateTo = '/expenses',
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const initial = limit || INITIAL_LIMIT;
  const total = transactions.length;
  const hasMore = total > initial;

  const visible = expanded
    ? transactions.slice(0, EXPANDED_LIMIT)
    : transactions.slice(0, initial);

  function handleShowAll() {
    if (showNavigateButton) {
      navigate(navigateTo);
    } else {
      setExpanded(true);
    }
  }

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#F8FAFC] lg:text-[17px]">
          تراکنش‌های اخیر
        </h2>
        <span className="text-[11px] text-[#64748B] lg:text-[12px]">
          {formatNumber(total)} تراکنش
        </span>
      </div>

      <div className="mt-3">
        <TransactionList
          transactions={visible}
          categoriesMap={categoriesMap}
        />

        {hasMore && !expanded && (
          <button
            type="button"
            onClick={handleShowAll}
            className="
              glass mt-3 flex w-full items-center justify-center gap-2
              rounded-2xl py-3 text-[12.5px] font-semibold text-[#00D1A7]
              transition-all hover:border-[#00D1A7]/30 active:scale-[0.98]
            "
          >
            <ListChecks size={16} strokeWidth={2} />
            نمایش همه ({formatNumber(total - visible.length)} مورد دیگر)
          </button>
        )}

        {expanded && total > INITIAL_LIMIT && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="
              glass mt-3 flex w-full items-center justify-center gap-2
              rounded-2xl py-3 text-[12.5px] font-semibold text-[#94A3B8]
              transition-all hover:border-[#00D1A7]/30 active:scale-[0.98]
            "
          >
            <ChevronLeft size={16} strokeWidth={2} className="rotate-90" />
            بستن
          </button>
        )}
      </div>
    </section>
  );
}