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

const FA_NUM = new Intl.NumberFormat('fa-AF');

function lockBody() {
  const body = document.body;
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  const prevOverflow = body.style.overflow;
  const prevPaddingRight = body.style.paddingRight;

  body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    body.style.overflow = prevOverflow;
    body.style.paddingRight = prevPaddingRight;
  };
}

const SECTIONS = [
  {
    key: 'daily',
    period: 'daily',
    icon: Sun,
    accent: 'text-[#00D1A7]',
    resetLabel: 'امروز',
  },
  {
    key: 'weekly',
    period: 'weekly',
    icon: CalendarDays,
    accent: 'text-[#3B82F6]',
    resetLabel: 'این هفته',
  },
  {
    key: 'monthly',
    period: 'monthly',
    icon: CalendarRange,
    accent: 'text-[#8B5CF6]',
    resetLabel: 'این ماه',
  },
  {
    key: 'yearly',
    period: 'yearly',
    icon: Calendar,
    accent: 'text-[#F59E0B]',
    resetLabel: 'امسال',
  },
  {
    key: 'allTime',
    period: 'allTime',
    icon: History,
    accent: 'text-[#94A3B8]',
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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            dir="rtl"
            className="
              glass-strong relative z-10 flex max-h-[90vh] w-full flex-col
              overflow-hidden rounded-t-[28px] shadow-2xl
              lg:max-h-[88vh] lg:max-w-[480px] lg:rounded-[28px]
            "
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(0,209,167,0.20), transparent 70%)',
              }}
            />

            <div className="relative shrink-0 px-5 pt-3 pb-4 lg:px-6 lg:pt-5">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.18] lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#64748B]">
                    {titles.subtitle}
                  </p>
                  <h2 className="mt-0.5 text-[18px] font-extrabold text-[#F8FAFC] lg:text-[20px]">
                    {titles.title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="بستن"
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-[#94A3B8] backdrop-blur-md active:scale-95"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-5 pb-6 lg:px-6">
              <div className="space-y-3">
                {SECTIONS.map((section) => (
                  <SummarySection
                    key={section.key}
                    section={section}
                    mode={mode}
                  />
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
    <div className="rounded-2xl border border-white/[0.08] bg-white/[0.04] p-4 backdrop-blur-md">
      <div className="mb-3 flex items-center justify-between gap-2">
        <button
          type="button"
          disabled={!canGoForward}
          onClick={() => setOffset((o) => Math.min(0, o + 1))}
          aria-label="بعدی"
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
            canGoForward
              ? 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#00D1A7] active:scale-90'
              : 'cursor-not-allowed text-[#334155]',
          ].join(' ')}
        >
          <ChevronRight size={16} strokeWidth={2.2} />
        </button>

        <div className="flex min-w-0 flex-1 items-center justify-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/[0.06] bg-white/[0.04]">
            <Icon size={14} strokeWidth={2} className={accent} />
          </div>

          <div className="flex min-w-0 flex-col items-center gap-0">
            <p className="truncate text-[12.5px] font-bold leading-tight text-[#F8FAFC]">
              {currentLabel}
            </p>
            {subLabel && (
              <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-[#64748B]">
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
          className={[
            'flex h-7 w-7 shrink-0 items-center justify-center rounded-lg transition-all',
            canGoBack
              ? 'text-[#94A3B8] hover:bg-white/[0.06] hover:text-[#00D1A7] active:scale-90'
              : 'cursor-not-allowed text-[#334155]',
          ].join(' ')}
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
              <div className="rounded-xl border border-[#00D1A7]/20 bg-[#00D1A7]/[0.08] px-3 py-2.5 backdrop-blur-md">
                <p className="text-[10px] font-medium text-[#94A3B8]">درآمد</p>
                <p className="mt-1 text-[15px] font-extrabold tabular-nums text-[#00D1A7]">
                  <AnimatedNumber value={summary.income} duration={550} />
                </p>
              </div>
            )}

            {showExpense && (
              <div className="rounded-xl border border-[#F43F5E]/20 bg-[#F43F5E]/[0.08] px-3 py-2.5 backdrop-blur-md">
                <p className="text-[10px] font-medium text-[#94A3B8]">مصرف</p>
                <p className="mt-1 text-[15px] font-extrabold tabular-nums text-[#F43F5E]">
                  <AnimatedNumber value={summary.expense} duration={550} />
                </p>
              </div>
            )}
          </div>

          {hasData && mode === 'both' && (
            <div className="mt-2.5 flex items-center justify-between border-t border-white/[0.08] pt-2.5">
              <span className="text-[10.5px] text-[#64748B]">موجودی</span>
              <span
                className={[
                  'text-[12.5px] font-bold tabular-nums',
                  summary.balance >= 0 ? 'text-[#F8FAFC]' : 'text-[#F43F5E]',
                ].join(' ')}
              >
                {FA_NUM.format(Math.round(summary.balance))} افغانی
              </span>
            </div>
          )}

          {!isAllTime && !isCurrent && resetLabel && (
            <button
              type="button"
              onClick={() => setOffset(0)}
              className="
                mt-2.5 flex w-full items-center justify-center gap-1.5
                rounded-xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.08]
                py-1.5 text-[10.5px] font-semibold text-[#00D1A7]
                backdrop-blur-md transition-all hover:bg-[#00D1A7]/[0.14] active:scale-[0.98]
              "
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