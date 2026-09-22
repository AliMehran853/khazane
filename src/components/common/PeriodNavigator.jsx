import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import {
  getPeriodOffsetLabel,
  getPeriodSubLabel,
  getMaxOffset,
} from '../utils/dates';
import { PERIOD_LABELS } from '../utils/constants';

export default function PeriodNavigator() {
  const period = useAppStore((s) => s.period);
  const offset = useAppStore((s) => s.periodOffset);
  const setOffset = useAppStore((s) => s.setPeriodOffset);

  const label = getPeriodOffsetLabel(period, offset);
  const subLabel = getPeriodSubLabel(period, offset);

  const maxOffset = getMaxOffset(period);
  const canGoBack = offset > maxOffset;
  const canGoForward = offset < 0;
  const isCurrent = offset === 0;
  const resetLabel = PERIOD_LABELS[period] || 'حالا';

  return (
    <div className="glass rounded-2xl px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setOffset(offset + 1)}
          aria-label="بعدی"
          data-disabled={!canGoForward}
          className="kh-nav-btn"
        >
          <ChevronRight size={18} strokeWidth={2.2} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p
            className={[
              'truncate text-sm font-bold transition-colors',
              isCurrent ? 'text-primary' : 'text-fg-1',
            ].join(' ')}
          >
            {label}
          </p>
          {subLabel && (
            <p className="mt-0.5 truncate text-2xs font-medium text-fg-3">
              {subLabel}
            </p>
          )}
        </div>

        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setOffset(offset - 1)}
          aria-label="قبلی"
          data-disabled={!canGoBack}
          className="kh-nav-btn"
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => setOffset(0)}
          className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/10 py-1.5 text-2xs font-semibold text-primary transition-all hover:bg-primary/15 active:scale-[0.98]"
        >
          <RotateCcw size={11} strokeWidth={2.2} />
          بازگشت به {resetLabel}
        </button>
      )}
    </div>
  );
}