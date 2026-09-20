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
    <section className="glass-strong relative mt-4 overflow-hidden rounded-[28px] p-5">
      {/* ⭐ عکس داخلی — واضح در بالا */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
          opacity: 0.55,
          filter: 'blur(0.5px) saturate(1.6) brightness(1.05)',
        }}
      />

      {/* ⭐ گرادیان حرفه‌ای: روشن در بالا → تیره در پایین */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isNegative
            ? `linear-gradient(
                180deg,
                rgba(11,34,38,0.10) 0%,
                rgba(11,34,38,0.45) 35%,
                rgba(11,34,38,0.80) 65%,
                rgba(20,10,14,0.94) 100%
              )`
            : `linear-gradient(
                180deg,
                rgba(11,34,38,0.08) 0%,
                rgba(11,34,38,0.42) 35%,
                rgba(11,34,38,0.80) 65%,
                rgba(11,34,38,0.94) 100%
              )`,
        }}
      />

      {/* ⭐ گرادیان جانبی: سمت چپ کمی روشن‌تر، سمت راست تیره‌تر */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'linear-gradient(90deg, rgba(11,34,38,0.00) 0%, rgba(11,34,38,0.35) 100%)',
        }}
      />

      {/* هاله‌ی فیروزه‌ای ملایم در گوشه‌ی بالا-چپ */}
      <div
        className="pointer-events-none absolute -left-16 -top-16 h-44 w-44 rounded-full blur-3xl"
        style={{
          background: isNegative
            ? 'rgba(244,63,94,0.18)'
            : 'rgba(0,209,167,0.22)',
        }}
      />

      <div className="relative">
        {/* هدر */}
        <div className="flex items-center justify-between">
          <p
            className="text-[11.5px] font-medium tracking-wide text-[#B8C6CD]"
            style={{
              textShadow: '0 1px 3px rgba(0,0,0,0.55)',
            }}
          >
            موجودی {periodLabel}
          </p>
          <div className="flex h-7 w-7 items-center justify-center rounded-full border border-[#00D1A7]/30 bg-[#00D1A7]/[0.14] backdrop-blur-md">
            <Sparkles size={13} strokeWidth={2} className="text-[#00D1A7]" />
          </div>
        </div>

        {/* عدد بزرگ */}
        <div className="mt-3 flex items-end gap-2">
          <p
            className="text-[38px] font-extrabold leading-none tracking-tight"
            style={{
              backgroundImage: isNegative
                ? 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)'
                : 'linear-gradient(135deg, #FFFFFF 0%, #00D1A7 130%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
              filter: isNegative
                ? 'drop-shadow(0 4px 16px rgba(244,63,94,0.45))'
                : 'drop-shadow(0 4px 16px rgba(0,209,167,0.45))',
            }}
          >
            <AnimatedNumber value={summary.balance} duration={750} />
          </p>
          <span
            className="mb-1 text-[12px] font-semibold text-[#B8C6CD]"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
          >
            افغانی
          </span>
        </div>

        {isNegative && (
          <span className="mt-2 inline-block rounded-full border border-[#F43F5E]/40 bg-[#F43F5E]/[0.20] px-2.5 py-0.5 text-[10px] font-bold text-[#F43F5E] backdrop-blur-md">
            کمبود
          </span>
        )}

        {/* جداکننده‌ی تزئینی */}
        <div className="mt-5 flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-white/[0.18] to-transparent" />
          <div className="h-1 w-1 rounded-full bg-[#00D1A7]/60 shadow-[0_0_8px_rgba(0,209,167,0.6)]" />
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-white/[0.18] to-transparent" />
        </div>

        {/* ردیف‌های مقایسه */}
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

        {/* دکمه‌ی خلاصه */}
        {onOpenSummary && (
          <button
            type="button"
            onClick={onOpenSummary}
            className="
              group mt-4 flex w-full items-center justify-between gap-2
              rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.10]
              px-4 py-3 backdrop-blur-md transition-all
              hover:border-[#00D1A7]/40 hover:bg-[#00D1A7]/[0.16]
              active:scale-[0.98]
            "
          >
            <span className="flex items-center gap-2 text-[12px] font-semibold text-[#00D1A7]">
              <BarChart3 size={15} strokeWidth={2.2} />
              خلاصه‌ی همه‌ی دوره‌ها
            </span>
            <ChevronLeft
              size={16}
              strokeWidth={2}
              className="text-[#00D1A7] transition-transform group-hover:-translate-x-0.5"
            />
          </button>
        )}
      </div>
    </section>
  );
}

// ============================================================
// نسخه‌ی دسکتاپ
// ============================================================

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
    <section className="glass-strong relative flex items-center gap-7 overflow-hidden rounded-[28px] px-7 py-7">
      {/* عکس داخلی */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: 'url(/background.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          opacity: 0.5,
          filter: 'blur(0.5px) saturate(1.6) brightness(1.05)',
        }}
      />

      {/* گرادیان افقی: چپ روشن‌تر، راست تیره‌تر */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: isNegative
            ? 'linear-gradient(90deg, rgba(11,34,38,0.15) 0%, rgba(11,34,38,0.75) 45%, rgba(20,10,14,0.94) 100%)'
            : 'linear-gradient(90deg, rgba(11,34,38,0.12) 0%, rgba(11,34,38,0.72) 45%, rgba(11,34,38,0.94) 100%)',
        }}
      />

      {/* هاله‌ی گوشه‌ی بالا-چپ */}
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-56 w-56 rounded-full blur-3xl"
        style={{
          background: isNegative
            ? 'rgba(244,63,94,0.20)'
            : 'rgba(0,209,167,0.24)',
        }}
      />

      <div className="relative flex shrink-0 flex-col">
        <div className="flex items-center gap-2">
          <p
            className="text-[13px] font-medium tracking-wide text-[#B8C6CD]"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
          >
            موجودی {periodLabel}
          </p>
          <div className="flex h-6 w-6 items-center justify-center rounded-full border border-[#00D1A7]/30 bg-[#00D1A7]/[0.14] backdrop-blur-md">
            <Sparkles size={11} strokeWidth={2} className="text-[#00D1A7]" />
          </div>
        </div>

        <p
          className="mt-3 text-[48px] font-extrabold leading-none tracking-tight"
          style={{
            backgroundImage: isNegative
              ? 'linear-gradient(135deg, #F43F5E 0%, #BE123C 100%)'
              : 'linear-gradient(135deg, #FFFFFF 0%, #00D1A7 130%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            filter: isNegative
              ? 'drop-shadow(0 4px 20px rgba(244,63,94,0.45))'
              : 'drop-shadow(0 4px 20px rgba(0,209,167,0.45))',
          }}
        >
          <AnimatedNumber value={summary.balance} duration={750} />
        </p>

        <div className="mt-3 flex items-center gap-2">
          <p
            className="text-[12px] font-semibold text-[#B8C6CD]"
            style={{ textShadow: '0 1px 3px rgba(0,0,0,0.55)' }}
          >
            افغانی
          </p>
          {isNegative && (
            <span className="rounded-full border border-[#F43F5E]/40 bg-[#F43F5E]/[0.20] px-2.5 py-0.5 text-[10px] font-bold text-[#F43F5E] backdrop-blur-md">
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

// ============================================================
// Helperها
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
      color: 'text-[#B8C6CD]',
    };
  }

  const direction = diff > 0 ? 'بیشتر' : 'کمتر';
  const isGood = tone === 'income' ? diff > 0 : diff < 0;

  return {
    text: `${periodLabel} نسبت به ${baselineLabel} ${amountText} افغانی ${typeLabel} ${direction} بوده`,
    color: isGood ? 'text-[#00D1A7]' : 'text-[#F43F5E]',
  };
}

// ============================================================
// CompareRow (موبایل)
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
  const accentText = isIncome ? 'text-[#00D1A7]' : 'text-[#F43F5E]';
  const accentBg = isIncome
    ? 'from-[#00D1A7]/[0.12] to-[#00D1A7]/[0.03] border-[#00D1A7]/25'
    : 'from-[#F43F5E]/[0.12] to-[#F43F5E]/[0.03] border-[#F43F5E]/25';

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
              ? 'bg-[#00D1A7]/[0.20] text-[#00D1A7]'
              : 'bg-[#F43F5E]/[0.20] text-[#F43F5E]',
          ].join(' ')}
        >
          <Icon size={16} strokeWidth={2.2} />
        </div>

        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          <span className="text-[11.5px] font-medium text-[#B8C6CD]">
            {label}
          </span>
          <span
            className={[
              'text-[16px] font-extrabold tabular-nums',
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
                'shrink-0 text-[#6E828B] transition-transform duration-200',
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
                'border-t border-white/[0.08] px-3.5 pb-3 pt-2.5 text-[10.5px] leading-relaxed',
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
// CompareCard (دسکتاپ)
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
  const accentText = isIncome ? 'text-[#00D1A7]' : 'text-[#F43F5E]';
  const accentBg = isIncome
    ? 'from-[#00D1A7]/[0.14] to-[#00D1A7]/[0.04] border-[#00D1A7]/25'
    : 'from-[#F43F5E]/[0.14] to-[#F43F5E]/[0.04] border-[#F43F5E]/25';

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
                  ? 'bg-[#00D1A7]/[0.20] text-[#00D1A7]'
                  : 'bg-[#F43F5E]/[0.20] text-[#F43F5E]',
              ].join(' ')}
            >
              <Icon size={16} strokeWidth={2.2} />
            </div>
            <span className="text-[12px] font-medium text-[#B8C6CD]">
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
                  'shrink-0 text-[#6E828B] transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
              />
            )}
          </div>
        </div>

        <p
          className={[
            'mt-3 text-[26px] font-extrabold tabular-nums tracking-tight',
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
                'border-t border-white/[0.08] px-4 pb-3 pt-2.5 text-[10.5px] leading-relaxed',
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