import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ListChecks } from 'lucide-react';

import TransactionList from '../transactions/TransactionList';
import { formatNumber } from '../utils/formatting';
import {
  RECENT_TX_LIMIT,
  RECENT_TX_EXPANDED_LIMIT,
  ROUTES,
} from '../utils/constants';

export default function RecentTransactions({
  transactions = [],
  categoriesMap = {},
  limit,
  showNavigateButton = true,
  navigateTo = ROUTES.expenses,
}) {
  const navigate = useNavigate();
  const [expanded, setExpanded] = useState(false);

  const initial = limit || RECENT_TX_LIMIT;
  const total = transactions.length;
  const hasMore = total > initial;

  const visible = expanded
    ? transactions.slice(0, RECENT_TX_EXPANDED_LIMIT)
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
        <h2 className="text-lg font-bold text-fg-1 lg:text-xl">
          تراکنش‌های اخیر
        </h2>
        <span className="text-xs text-fg-3 lg:text-sm">
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
            className="glass mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-primary transition-all hover:border-primary/30 active:scale-[0.98]"
          >
            <ListChecks size={16} strokeWidth={2} />
            نمایش همه ({formatNumber(total - visible.length)} مورد دیگر)
          </button>
        )}

        {expanded && total > RECENT_TX_LIMIT && (
          <button
            type="button"
            onClick={() => setExpanded(false)}
            className="glass mt-3 flex w-full items-center justify-center gap-2 rounded-2xl py-3 text-sm font-semibold text-fg-2 transition-all hover:border-primary/30 active:scale-[0.98]"
          >
            <ChevronLeft size={16} strokeWidth={2} className="rotate-90" />
            بستن
          </button>
        )}
      </div>
    </section>
  );
}