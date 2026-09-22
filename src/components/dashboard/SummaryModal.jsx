import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calendar,
  CalendarDays,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  History,
  RotateCcw,
  Sun,
  X,
} from 'lucide-react';

import AnimatedNumber from '../common/AnimatedNumber';
import { useAppStore } from '../store/appStore';
import {
  getPeriodSummary,
  getAllTimeSummary,
} from '../services/analyticsService';
import {
  getPeriodBaseDate,
  getPeriodOffsetLabel,
  getPeriodSubLabel,
  getMaxOffset,
} from '../utils/dates';
import { formatNumber } from '../utils/formatting';
import { lockBody } from '../utils/scrollLock';

const SECTIONS = [
  {
    key: 'daily',
    period: 'daily',
    icon: Sun,
    accent: 'text-primary',
    resetLabel: 'امروز',
  },
  {
    key: 'weekly',
    period: 'weekly',
    icon: CalendarDays,
    accent: 'text-blue',
    resetLabel: 'این هفته',
  },
  {
    key: 'monthly',
    period: 'monthly',
    icon: CalendarRange,
    accent: 'text-purple',
    resetLabel: 'این ماه',
  },
  {
    key: 'yearly',
    period: 'yearly',
    icon: Calendar,
    accent: 'text-orange',
    resetLabel: 'امسال',
  },
  {
    key: 'allTime',
    period: 'allTime',
    icon: History,
    accent: 'text-fg-2',
    resetLabel: null,
  },
];

const MODE_TITLES = {
  both: { subtitle: 'نگاهی به همه‌ی دوره‌ها', title: 'خلاصه‌ی مالی' },
  income: { subtitle: 'درآمد در همه‌ی دوره‌ها', title: 'خلاصه‌ی درآمد' },
  expense: { subtitle: 'مصرف در همه‌ی دوره‌ها', title: 'خلاصه‌ی مصارف' },
};

export default function SummaryModal({ open, onClose, mode = 'both' }) {
  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  const titles = MODE_TITLES[mode] || MODE_TITLES.both;

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-end justify-center lg:items-center lg:p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="kh-modal-overlay"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            dir="rtl"
            className="glass-strong relative z-10 flex max-h-[90vh] w-full flex-col overflow-hidden rounded-t-3xl shadow-2xl lg:max-h-[88vh] lg:max-w-[480px] lg:rounded-3xl"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="kh-modal-glow" />

            <div className="relative shrink-0 px-5 pt-3 pb-4 lg:px-6 lg:pt-5">
              <div className="kh-drag-handle lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-fg-3">{titles.subtitle}</p>
                  <h2 className="mt-0.5 text-xl font-extrabold text-fg-1 lg:text-2xl">
                    {titles.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="بستن"
                  className="kh-close-btn"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-6 lg:px-6">
              <div className="space-y-3">
                {SECTIONS.map((section) => (
                  <SummarySection key={section.key} section={section} mode={mode} />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

function SummarySection({ section, mode }) {
  const { period, icon: Icon, accent, resetLabel } = section;

  const dataVersion = useAppStore((s) => s.dataVersion);

  const [offset, setOffset] = useState(0);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAllTime = period === 'allTime';
  const maxOffset = getMaxOffset(period);

  const canGoBack = !isAllTime && offset > maxOffset;
  const canGoForward = !isAllTime && offset < 0;
  const isCurrent = offset === 0;

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        let data;
        if (isAllTime) {
          data = await getAllTimeSummary();
        } else {
          const baseDate = getPeriodBaseDate(period, offset);
          data = await getPeriodSummary({ period, baseDate });
        }
        if (cancelled) return;
        setSummary(data);
      } catch (err) {
        console.error('Summary section failed:', err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [period, offset, isAllTime, dataVersion]);

  const currentLabel = isAllTime
    ? 'از ابتدا تا کنون'
    : getPeriodOffsetLabel(period, offset);

  const subLabel = isAllTime ? null : getPeriodSubLabel(period, offset);

  const hasData = summary && (summary.income > 0 || summary.expense > 0);
  const showIncome = mode === 'both' || mode === 'income';
  const showExpense = mode === 'both' || mode === 'expense';
  const singleColumn = mode !== 'both';

  return (
    <div className="rounded-2xl border border-border-1 bg-fill-1 p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          aria-label="بعدی"
          className="kh-nav-btn !h-7 !w-7"
        >
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-border-1 bg-fill-1">
            <Icon size={14} strokeWidth={2} className={accent} />
          </div>

          <div className="flex min-w-0 flex-col items-center gap-0">
            <p className="truncate text-sm font-bold leading-tight text-fg-1">
              {currentLabel}
            </p>
            {subLabel && (
              <p className="mt-0.5 truncate text-2xs font-medium leading-tight text-fg-3">
                {subLabel}
              </p>
            )}
          </div>
        </div>

        <button
          type="button"
          disabled={!canGoBack}
          onClick={() => setOffset((o) => o - 1)}
          aria-label="قبلی"
          className="kh-nav-btn !h-7 !w-7"
        >
          <ChevronLeft size={16} strokeWidth={2.2} />
        </button>
      </div>

      {loading || !summary ? (
        <div className="grid grid-cols-2 gap-2.5">
          <div className="kh-skeleton h-[58px] rounded-xl" />
          <div className="kh-skeleton h-[58px] rounded-xl" />
        </div>
      ) : (
        <>
          <div
            className={[
              'grid gap-2.5',
              singleColumn ? 'grid-cols-1' : 'grid-cols-2',
            ].join(' ')}
          >
            {showIncome && (
              <div className="rounded-xl border border-primary/20 bg-primary/[0.08] px-3 py-2.5 backdrop-blur-md">
                <p className="text-2xs font-medium text-fg-2">درآمد</p>
                <p className="mt-1 text-lg font-extrabold tabular-nums text-primary">
                  <AnimatedNumber value={summary.income} duration={550} />
                </p>
              </div>
            )}

            {showExpense && (
              <div className="rounded-xl border border-expense/20 bg-expense/[0.08] px-3 py-2.5 backdrop-blur-md">
                <p className="text-2xs font-medium text-fg-2">مصرف</p>
                <p className="mt-1 text-lg font-extrabold tabular-nums text-expense">
                  <AnimatedNumber value={summary.expense} duration={550} />
                </p>
              </div>
            )}
          </div>

          {hasData && mode === 'both' && (
            <div className="mt-2.5 flex items-center justify-between border-t border-border-1 pt-2.5">
              <span className="text-2xs text-fg-3">موجودی</span>
              <span
                className={[
                  'text-sm font-bold tabular-nums',
                  summary.balance >= 0 ? 'text-fg-1' : 'text-expense',
                ].join(' ')}
              >
                {formatNumber(summary.balance)} افغانی
              </span>
            </div>
          )}

          {!isAllTime && !isCurrent && resetLabel && (
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-primary/25 bg-primary/[0.08] py-1.5 text-2xs font-semibold text-primary backdrop-blur-md transition-all hover:bg-primary/[0.14] active:scale-[0.98]"
            >
              <RotateCcw size={11} strokeWidth={2.2} />
              بازگشت به {resetLabel}
            </button>
          )}
        </>
      )}
    </div>
  );
}