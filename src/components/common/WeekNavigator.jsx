import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import {
  getWeekRangeFromOffset,
  getWeekOffsetLabel,
  formatWeekRange,
} from '../utils/dates';

const MAX_WEEKS_BACK = -52;

export default function WeekNavigator() {
  const weekOffset = useAppStore((s) => s.weekOffset);
  const setWeekOffset = useAppStore((s) => s.setWeekOffset);

  const { start, end } = getWeekRangeFromOffset(weekOffset);
  const label = getWeekOffsetLabel(weekOffset);
  const range = formatWeekRange(start, end);

  const canGoBack = weekOffset > MAX_WEEKS_BACK;
  const canGoForward = weekOffset < 0;
  const isCurrent = weekOffset === 0;

  return (
    <div className="mt-3 rounded-2xl border border-white/[0.06] bg-[#0F211E] px-2 py-2">
      <div className="flex items-center justify-between gap-2">
        {/* دکمه‌ی اول — آینده */}
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setWeekOffset(weekOffset + 1)}
          aria-label="هفته‌ی بعد"
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
            canGoForward
              ? 'text-[#8FA39D] hover:bg-white/[0.05] hover:text-[#E3B341] active:scale-95'
              : 'cursor-not-allowed text-[#2A3936]',
          ].join(' ')}
        >
          <ChevronRight size={18} strokeWidth={2.2} />
        </button>

        {/* برچسب وسط */}
        <div className="min-w-0 flex-1 text-center">
          <p
            className={[
              'truncate text-[12.5px] font-bold transition-colors',
              isCurrent ? 'text-[#E3B341]' : 'text-[#F2EFE9]',
            ].join(' ')}
          >
            {label}
          </p>
          <p className="mt-0.5 truncate text-[10.5px] font-medium text-[#5C736C]">
            {range}
          </p>
        </div>

        {/* دکمه‌ی دوم — گذشته */}
        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setWeekOffset(weekOffset - 1)}
          aria-label="هفته‌ی قبل"
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition-all',
            canGoBack
              ? 'text-[#8FA39D] hover:bg-white/[0.05] hover:text-[#E3B341] active:scale-95'
              : 'cursor-not-allowed text-[#2A3936]',
          ].join(' ')}
        >
          <ChevronLeft size={18} strokeWidth={2.2} />
        </button>
      </div>

      {!isCurrent && (
        <button
          type="button"
          onClick={() => setWeekOffset(0)}
          className="
            mt-2 flex w-full items-center justify-center gap-1.5
            rounded-xl border border-[#E3B341]/25 bg-[#E3B341]/[0.06]
            py-1.5 text-[10.5px] font-semibold text-[#E3B341]
            transition-all hover:bg-[#E3B341]/[0.10] active:scale-[0.98]
          "
        >
          <RotateCcw size={11} strokeWidth={2.2} />
          بازگشت به این هفته
        </button>
      )}
    </div>
  );
}