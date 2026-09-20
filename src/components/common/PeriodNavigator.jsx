import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import {
  getPeriodOffsetLabel,
  getPeriodSubLabel,
  getMaxOffset,
} from '../utils/dates';

const RESET_LABELS = {
  daily: 'امروز',
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

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
  const resetLabel = RESET_LABELS[period] || 'حالا';

  return (
    <div className="glass rounded-2xl px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        {/* راست = آینده */}
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setOffset(offset + 1)}
          aria-label="بعدی"
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
            canGoForward
              ? 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#00D1A7] active:scale-95'
              : 'cursor-not-allowed text-[#334155]',
          ].join(' ')}
        >
          <ChevronRight size={18} strokeWidth={2.2} />
        </button>

        <div className="min-w-0 flex-1 text-center">
          <p
            className={[
              'truncate text-[12.5px] font-bold transition-colors',
              isCurrent ? 'text-[#00D1A7]' : 'text-[#F8FAFC]',
            ].join(' ')}
          >
            {label}
          </p>
          {subLabel && (
            <p className="mt-0.5 truncate text-[10.5px] font-medium text-[#64748B]">
              {subLabel}
            </p>
          )}
        </div>

        {/* چپ = گذشته */}
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setOffset(offset - 1)}
          aria-label="قبلی"
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
            canGoBack
              ? 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#00D1A7] active:scale-95'
              : 'cursor-not-allowed text-[#334155]',
          ].join(' ')}
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => setOffset(0)}
          className="
            mt-2 flex w-full items-center justify-center gap-1.5
            rounded-xl border border-[#00D1A7]/30 bg-[#00D1A7]/[0.10]
            py-1.5 text-[10.5px] font-semibold text-[#00D1A7]
            transition-all hover:bg-[#00D1A7]/[0.16] active:scale-[0.98]
          "
        >
          <RotateCcw size={11} strokeWidth={2.2} />
          بازگشت به {resetLabel}
        </button>
      )}
    </div>
  );
}