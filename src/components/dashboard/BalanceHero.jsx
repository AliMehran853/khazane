import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';
import AnimatedNumber from '../common/AnimatedNumber';
import ChangeBadge from '../common/ChangeBadge';
import { getWeekOffsetLabel, getComparisonLabel } from '../utils/dates';

function getPeriodLabel(period, weekOffset) {
  if (period === 'weekly') return getWeekOffsetLabel(weekOffset);
  if (period === 'monthly') return 'این ماه';
  if (period === 'yearly') return 'امسال';
  return '';
}

export default function BalanceHero({
  summary,
  period = 'weekly',
  weekOffset = 0,
  comparison = null,
  variant = 'mobile',
}) {
  const isDesktop = variant === 'desktop';
  const isNegative = (summary.balance || 0) < 0;
  const balanceColor = isNegative ? 'text-[#E2574C]' : 'text-[#F2EFE9]';
  const periodLabel = getPeriodLabel(period, weekOffset);
  const comparisonLabel = getComparisonLabel(period, weekOffset);

  // ---------------------------------------------
  // دسکتاپ — افقی
  // ---------------------------------------------
  if (isDesktop) {
    const hasComparison =
      comparison &&
      comparison.previous &&
      (comparison.previous.income > 0 || comparison.previous.expense > 0);

    return (
      <section className="flex items-center gap-7 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] px-7 py-6">
        {/* راست: موجودی */}
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

        {/* جداکننده */}
        {hasComparison && (
          <div className="h-24 w-px shrink-0 bg-white/[0.06]" />
        )}

        {/* چپ: مقایسه */}
        {hasComparison && (
          <div className="grid min-w-0 flex-1 grid-cols-2 gap-3">
            <CompareCard
              icon={ArrowDownLeft}
              label="درآمد"
              tone="income"
              value={summary.income}
              current={comparison.current.income}
              previous={comparison.previous.income}
              hint={comparisonLabel}
            />
            <CompareCard
              icon={ArrowUpRight}
              label="مصرف"
              tone="expense"
              value={summary.expense}
              current={comparison.current.expense}
              previous={comparison.previous.expense}
              hint={comparisonLabel}
            />
          </div>
        )}
      </section>
    );
  }

  // ---------------------------------------------
  // موبایل (بدون تغییر)
  // ---------------------------------------------
  return (
    <section className="mt-7 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] p-5">
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
          hint={comparisonLabel}
        />
        <CompareRow
          icon={ArrowUpRight}
          label="مصرف"
          tone="expense"
          value={summary.expense}
          current={comparison?.current?.expense}
          previous={comparison?.previous?.expense}
          hint={comparisonLabel}
        />
      </div>
    </section>
  );
}

// ============================================================
// کارت مقایسه (دسکتاپ) — یک ستون
// ============================================================

function CompareCard({
  icon: Icon,
  label,
  tone,
  value,
  current,
  previous,
  hint,
}) {
  const isIncome = tone === 'income';
  const accentText = isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]';
  const accentBg = isIncome ? 'bg-[#4FD1BE]/[0.07]' : 'bg-[#E2574C]/[0.07]';
  const showBadge = current !== undefined && previous !== undefined;

  return (
    <div className={['rounded-2xl p-4', accentBg].join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} strokeWidth={2} className={accentText} />
          <span className="text-[11.5px] font-medium text-[#8FA39D]">
            {label}
          </span>
        </div>
        {showBadge && (
          <ChangeBadge
            current={current}
            previous={previous}
            tone={tone}
            size="md"
          />
        )}
      </div>

      <p
        className={[
          'mt-2 text-[22px] font-extrabold tabular-nums',
          accentText,
        ].join(' ')}
      >
        <AnimatedNumber value={value} duration={650} />
      </p>

      {showBadge && hint && (
        <p className="mt-1 text-[10.5px] text-[#5C736C]/90">{hint}</p>
      )}
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
  hint,
}) {
  const isIncome = tone === 'income';
  const accentText = isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]';
  const accentBg = isIncome ? 'bg-[#4FD1BE]/[0.07]' : 'bg-[#E2574C]/[0.07]';
  const showBadge = current !== undefined && previous !== undefined;

  return (
    <div className={['rounded-2xl p-3.5', accentBg].join(' ')}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Icon size={16} strokeWidth={2} className={accentText} />
          <span className="text-[11.5px] font-medium text-[#8FA39D]">
            {label}
          </span>
        </div>
        {showBadge && (
          <ChangeBadge
            current={current}
            previous={previous}
            tone={tone}
            size="sm"
          />
        )}
      </div>

      <p
        className={[
          'mt-2 text-[18px] font-extrabold tabular-nums',
          accentText,
        ].join(' ')}
      >
        <AnimatedNumber value={value} duration={650} />
      </p>

      {showBadge && hint && (
        <p className="mt-1 text-[10px] text-[#5C736C]/90">{hint}</p>
      )}
    </div>
  );
}