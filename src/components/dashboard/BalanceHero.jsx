import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
} from 'lucide-react';

import AnimatedNumber from '../common/AnimatedNumber';
import ChangeBadge from '../common/ChangeBadge';
import { getPeriodOffsetLabel, getBaselineLabel } from '../utils/dates';

const FA_NUM = new Intl.NumberFormat('fa-AF');

export default function BalanceHero({
  summary,
  period = 'weekly',
  periodOffset = 0,
  comparison = null,
  variant = 'mobile',
  onOpenSummary,
}) {
  const isDesktop = variant === 'desktop';
  const isNegative = (summary.balance || 0) < 0;
  const balanceColor = isNegative ? 'text-[#E2574C]' : 'text-[#F2EFE9]';
  const periodLabel = getPeriodOffsetLabel(period, periodOffset);

  if (isDesktop) {
    const hasComparison = Boolean(comparison);

    return (
      <section className="flex items-center gap-7 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] px-7 py-6">
        <div className="flex shrink-0 flex-col">
          <p className="text-[13px] font-medium text-[#8FA39D]">
            موجودی {periodLabel}
          </p>

          <p
            className={[
              'mt-3 text-[42px] font-extrabold leading-none tracking-tight transition-colors',
              balanceColor,
            ].join(' ')}
          >
            <AnimatedNumber value={summary.balance} duration={750} />
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p className="text-[12px] text-[#5C736C]">افغانی</p>
            {isNegative && (
              <span className="rounded-full bg-[#E2574C]/[0.12] px-2 py-0.5 text-[10px] font-bold text-[#E2574C]">
                کمبود
              </span>
            )}
          </div>
        </div>

        {hasComparison && (
          <div className="h-24 w-px shrink-0 bg-white/[0.06]" />
        )}

        {hasComparison && (
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
            <CompareCard
              icon={ArrowDownLeft}
              label="درآمد"
              tone="income"
              value={summary.income}
              current={comparison.current.income}
              previous={comparison.previous.income}
              period={period}
              periodOffset={periodOffset}
            />
            <CompareCard
              icon={ArrowUpRight}
              label="مصرف"
              tone="expense"
              value={summary.expense}
              current={comparison.current.expense}
              previous={comparison.previous.expense}
              period={period}
              periodOffset={periodOffset}
            />
          </div>
        )}
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] p-5">
      <p className="text-[12px] text-[#8FA39D]">موجودی {periodLabel}</p>

      <p
        className={[
          'mt-2 text-[32px] font-extrabold tracking-tight transition-colors',
          balanceColor,
        ].join(' ')}
      >
        <AnimatedNumber value={summary.balance} duration={750} />
      </p>

      <div className="mt-0.5 flex items-center gap-2">
        <p className="text-[11px] text-[#5C736C]">افغانی</p>
        {isNegative && (
          <span className="rounded-full bg-[#E2574C]/[0.12] px-2 py-0.5 text-[10px] font-bold text-[#E2574C]">
            کمبود
          </span>
        )}
      </div>

      <div className="mt-5 h-px bg-white/[0.06]" />

      <div className="mt-4 space-y-3">
        <CompareRow
          icon={ArrowDownLeft}
          label="درآمد"
          tone="income"
          value={summary.income}
          current={comparison?.current?.income}
          previous={comparison?.previous?.income}
          period={period}
          periodOffset={periodOffset}
        />
        <CompareRow
          icon={ArrowUpRight}
          label="مصرف"
          tone="expense"
          value={summary.expense}
          current={comparison?.current?.expense}
          previous={comparison?.previous?.expense}
          period={period}
          periodOffset={periodOffset}
        />
      </div>

      {onOpenSummary && (
        <button
          type="button"
          onClick={onOpenSummary}
          className="
            mt-4 flex w-full items-center justify-between gap-2
            rounded-2xl border border-[#E3B341]/25 bg-[#E3B341]/[0.06]
            px-4 py-3 transition-all
            hover:bg-[#E3B341]/[0.10] active:scale-[0.98]
          "
        >
          <span className="flex items-center gap-2 text-[12px] font-semibold text-[#E3B341]">
            <BarChart3 size={15} strokeWidth={2.2} />
            خلاصه‌ی همه‌ی دوره‌ها
          </span>
          <ChevronLeft size={16} strokeWidth={2} className="text-[#E3B341]" />
        </button>
      )}
    </section>
  );
}

// ============================================================
// ساخت جمله‌ی توصیفی
// ============================================================

function buildSentence({ tone, current, previous, period, periodOffset }) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;

  if (current === undefined || previous === undefined) return null;
  if (c === 0 && p === 0) return null;

  const diff = c - p;
  const absDiff = Math.abs(Math.round(diff));
  const amountText = FA_NUM.format(absDiff);
  const typeLabel = tone === 'income' ? 'درآمد' : 'مصرف';

  const periodLabel = getPeriodOffsetLabel(period, periodOffset);
  const baselineLabel = getBaselineLabel(period, periodOffset);

  if (diff === 0) {
    return {
      text: `${periodLabel} نسبت به ${baselineLabel} بدون تغییر مانده`,
      color: 'text-[#8FA39D]',
    };
  }

  const direction = diff > 0 ? 'بیشتر' : 'کمتر';
  const isGood = tone === 'income' ? diff > 0 : diff < 0;

  return {
    text: `${periodLabel} نسبت به ${baselineLabel} ${amountText} افغانی ${typeLabel} ${direction} بوده`,
    color: isGood ? 'text-[#4FD1BE]' : 'text-[#E2574C]',
  };
}

// ============================================================
// کارت مقایسه (دسکتاپ)
// ============================================================

function CompareCard({
  icon: Icon,
  label,
  tone,
  value,
  current,
  previous,
  period,
  periodOffset,
}) {
  const [expanded, setExpanded] = useState(false);

  const isIncome = tone === 'income';
  const accentText = isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]';
  const accentBg = isIncome ? 'bg-[#4FD1BE]/[0.07]' : 'bg-[#E2574C]/[0.07]';

  const showComparison = current !== undefined && previous !== undefined;
  const sentence = showComparison
    ? buildSentence({ tone, current, previous, period, periodOffset })
    : null;
  const clickable = Boolean(sentence);

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => clickable && setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      className={[
        'overflow-hidden rounded-2xl transition-all',
        accentBg,
        clickable ? 'cursor-pointer active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon size={16} strokeWidth={2} className={accentText} />
            <span className="text-[11.5px] font-medium text-[#8FA39D]">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {showComparison && (
              <ChangeBadge
                current={current}
                previous={previous}
                tone={tone}
                size="md"
              />
            )}

            {sentence && (
              <ChevronDown
                size={13}
                strokeWidth={2.4}
                className={[
                  'shrink-0 text-[#5C736C]/60 transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
              />
            )}
          </div>
        </div>

        <p
          className={[
            'mt-2 text-[22px] font-extrabold tabular-nums',
            accentText,
          ].join(' ')}
        >
          <AnimatedNumber value={value} duration={650} />
        </p>
      </div>

      <AnimatePresence initial={false}>
        {expanded && sentence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className={[
                'px-4 pb-3 text-[10.5px] leading-relaxed',
                sentence.color,
              ].join(' ')}
            >
              {sentence.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ============================================================
// ردیف مقایسه (موبایل)
// ============================================================

function CompareRow({
  icon: Icon,
  label,
  tone,
  value,
  current,
  previous,
  period,
  periodOffset,
}) {
  const [expanded, setExpanded] = useState(false);

  const isIncome = tone === 'income';
  const accentText = isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]';
  const accentBg = isIncome ? 'bg-[#4FD1BE]/[0.07]' : 'bg-[#E2574C]/[0.07]';

  const showComparison = current !== undefined && previous !== undefined;
  const sentence = showComparison
    ? buildSentence({ tone, current, previous, period, periodOffset })
    : null;
  const clickable = Boolean(sentence);

  return (
    <div
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
      onClick={() => clickable && setExpanded((v) => !v)}
      onKeyDown={(e) => {
        if (!clickable) return;
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setExpanded((v) => !v);
        }
      }}
      className={[
        'overflow-hidden rounded-2xl transition-all',
        accentBg,
        clickable ? 'cursor-pointer active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="p-3.5">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon size={16} strokeWidth={2} className={accentText} />
            <span className="text-[11.5px] font-medium text-[#8FA39D]">
              {label}
            </span>
          </div>

          <div className="flex items-center gap-1">
            {showComparison && (
              <ChangeBadge
                current={current}
                previous={previous}
                tone={tone}
                size="sm"
              />
            )}

            {sentence && (
              <ChevronDown
                size={13}
                strokeWidth={2.4}
                className={[
                  'shrink-0 text-[#5C736C]/60 transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
              />
            )}
          </div>
        </div>

        <p
          className={[
            'mt-2 text-[18px] font-extrabold tabular-nums',
            accentText,
          ].join(' ')}
        >
          <AnimatedNumber value={value} duration={650} />
        </p>
      </div>

      <AnimatePresence initial={false}>
        {expanded && sentence && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden"
          >
            <p
              className={[
                'px-3.5 pb-3 text-[10px] leading-relaxed',
                sentence.color,
              ].join(' ')}
            >
              {sentence.text}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}