import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowDownLeft,
  ArrowUpRight,
  BarChart3,
  ChevronDown,
  ChevronLeft,
  Sparkles,
} from 'lucide-react';

import AnimatedNumber from '../common/AnimatedNumber';
import ChangeBadge from '../common/ChangeBadge';
import { getPeriodOffsetLabel, getBaselineLabel } from '../utils/dates';
import { formatNumber } from '../utils/formatting';

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
  const periodLabel = getPeriodOffsetLabel(period, periodOffset);

  if (isDesktop) {
    return (
      <DesktopHero
        summary={summary}
        period={period}
        periodOffset={periodOffset}
        comparison={comparison}
        periodLabel={periodLabel}
        isNegative={isNegative}
      />
    );
  }

  return (
    <section className="kh-hero mt-4 p-5">
      <div className="kh-hero-bg" />
      <div className="kh-hero-overlay-v" data-negative={isNegative} />
      <div className="kh-hero-overlay-h" />
      <div className="kh-hero-glow" data-negative={isNegative} />

      <div className="relative">
        <div className="flex items-center justify-between">
          <p className="kh-hero-text-shadow text-xs font-medium tracking-wide text-fg-2">
            موجودی {periodLabel}
          </p>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-primary/30 bg-primary/15 backdrop-blur-md">
            <Sparkles size={13} strokeWidth={2} className="text-primary" />
          </div>
        </div>

        <div className="mt-3 flex items-end gap-2">
          <p
            className={[
              'kh-hero-gradient-text text-5xl font-extrabold leading-none tracking-tight',
              isNegative ? 'kh-hero-negative' : 'kh-hero-positive',
            ].join(' ')}
          >
            <AnimatedNumber value={summary.balance} duration={750} />
          </p>
          <span className="kh-hero-text-shadow mb-1 text-sm font-semibold text-fg-2">
            افغانی
          </span>
        </div>

        {isNegative && (
          <span className="mt-2 inline-block rounded-full border border-expense/40 bg-expense/20 px-2.5 py-0.5 text-2xs font-bold text-expense backdrop-blur-md">
            کمبود
          </span>
        )}

        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.18] to-transparent" />
          <div className="h-1 w-1 rounded-full bg-primary/60 shadow-[0_0_8px_rgba(0,209,167,0.6)]" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
        </div>

        <div className="mt-4 space-y-2.5">
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
            className="group mt-4 flex w-full items-center justify-between gap-2 rounded-2xl border border-primary/25 bg-primary/10 px-4 py-3 backdrop-blur-md transition-all hover:border-primary/40 hover:bg-primary/15 active:scale-[0.98]"
          >
            <span className="flex items-center gap-2 text-sm font-semibold text-primary">
              <BarChart3 size={15} strokeWidth={2.2} />
              خلاصه‌ی همه‌ی دوره‌ها
            </span>
            <ChevronLeft
              size={16}
              strokeWidth={2}
              className="text-primary transition-transform group-hover:-translate-x-0.5"
            />
          </button>
        )}
      </div>
    </section>
  );
}

function DesktopHero({
  summary,
  period,
  periodOffset,
  comparison,
  periodLabel,
  isNegative,
}) {
  const hasComparison = Boolean(comparison);

  return (
    <section className="kh-hero flex items-center gap-7 px-7 py-7">
      <div className="kh-hero-bg kh-hero-bg-desktop" />
      <div className="kh-hero-overlay-d" data-negative={isNegative} />
      <div className="kh-hero-glow kh-hero-glow-desktop" data-negative={isNegative} />

      <div className="relative flex shrink-0 flex-col">
        <div className="flex items-center gap-2">
          <p className="kh-hero-text-shadow text-base font-medium tracking-wide text-fg-2">
            موجودی {periodLabel}
          </p>
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-primary/30 bg-primary/15 backdrop-blur-md">
            <Sparkles size={11} strokeWidth={2} className="text-primary" />
          </div>
        </div>

        <p
          className={[
            'kh-hero-gradient-text mt-3 text-5xl font-extrabold leading-none tracking-tight',
            isNegative ? 'kh-hero-negative' : 'kh-hero-positive',
          ].join(' ')}
        >
          <AnimatedNumber value={summary.balance} duration={750} />
        </p>

        <div className="mt-3 flex items-center gap-2">
          <p className="kh-hero-text-shadow text-sm font-semibold text-fg-2">
            افغانی
          </p>
          {isNegative && (
            <span className="rounded-full border border-expense/40 bg-expense/20 px-2.5 py-0.5 text-2xs font-bold text-expense backdrop-blur-md">
              کمبود
            </span>
          )}
        </div>
      </div>

      {hasComparison && (
        <div className="relative h-28 w-px shrink-0 bg-gradient-to-b from-transparent via-white/[0.18] to-transparent" />
      )}

      {hasComparison && (
        <div className="relative grid min-w-0 flex-1 grid-cols-2 gap-3">
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

function buildSentence({ tone, current, previous, period, periodOffset }) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;

  if (current === undefined || previous === undefined) return null;
  if (c === 0 && p === 0) return null;

  const diff = c - p;
  const absDiff = Math.abs(Math.round(diff));
  const amountText = formatNumber(absDiff);
  const typeLabel = tone === 'income' ? 'درآمد' : 'مصرف';

  const periodLabel = getPeriodOffsetLabel(period, periodOffset);
  const baselineLabel = getBaselineLabel(period, periodOffset);

  if (diff === 0) {
    return {
      text: `${periodLabel} نسبت به ${baselineLabel} بدون تغییر مانده`,
      color: 'text-fg-2',
    };
  }

  const direction = diff > 0 ? 'بیشتر' : 'کمتر';
  const isGood = tone === 'income' ? diff > 0 : diff < 0;

  return {
    text: `${periodLabel} نسبت به ${baselineLabel} ${amountText} افغانی ${typeLabel} ${direction} بوده`,
    color: isGood ? 'text-primary' : 'text-expense',
  };
}

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
  const accentText = isIncome ? 'text-primary' : 'text-expense';
  const accentBg = isIncome
    ? 'from-primary/[0.12] to-primary/[0.03] border-primary/25'
    : 'from-expense/[0.12] to-expense/[0.03] border-expense/25';

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
        'overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl transition-all',
        accentBg,
        clickable ? 'cursor-pointer active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="flex items-center gap-3 px-3.5 py-3">
        <div
          className={[
            'flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
            isIncome
              ? 'bg-primary/20 text-primary'
              : 'bg-expense/20 text-expense',
          ].join(' ')}
        >
          <Icon size={16} strokeWidth={2.2} />
        </div>

        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="text-xs font-medium text-fg-2">{label}</span>
          <span
            className={[
              'text-xl font-extrabold tabular-nums',
              accentText,
            ].join(' ')}
          >
            <AnimatedNumber value={value} duration={650} />
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
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
                'shrink-0 text-fg-3 transition-transform duration-200',
                expanded ? 'rotate-180' : '',
              ].join(' ')}
            />
          )}
        </div>
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
                'border-t border-border-1 px-3.5 pb-3 pt-2.5 text-2xs leading-relaxed',
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
  const accentText = isIncome ? 'text-primary' : 'text-expense';
  const accentBg = isIncome
    ? 'from-primary/[0.14] to-primary/[0.04] border-primary/25'
    : 'from-expense/[0.14] to-expense/[0.04] border-expense/25';

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
      className={[
        'overflow-hidden rounded-2xl border bg-gradient-to-br backdrop-blur-xl transition-all',
        accentBg,
        clickable ? 'cursor-pointer active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="p-4">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div
              className={[
                'flex h-9 w-9 items-center justify-center rounded-full',
                isIncome
                  ? 'bg-primary/20 text-primary'
                  : 'bg-expense/20 text-expense',
              ].join(' ')}
            >
              <Icon size={16} strokeWidth={2.2} />
            </div>
            <span className="text-sm font-medium text-fg-2">{label}</span>
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
                  'shrink-0 text-fg-3 transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
              />
            )}
          </div>
        </div>

        <p
          className={[
            'mt-3 text-3xl font-extrabold tabular-nums tracking-tight',
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
                'border-t border-border-1 px-4 pb-3 pt-2.5 text-2xs leading-relaxed',
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