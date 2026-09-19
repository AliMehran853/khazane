import { Minus, TrendingDown, TrendingUp } from 'lucide-react';

const FA_NUM = new Intl.NumberFormat('fa-AF');

function getPrevLabel(period, weekOffset) {
  if (period === 'weekly') {
    if (weekOffset === 0) return 'هفته‌ی گذشته';
    if (weekOffset === -1) return '۲ هفته پیش';
    return `${FA_NUM.format(Math.abs(weekOffset - 1))} هفته پیش`;
  }
  if (period === 'monthly') return 'ماه گذشته';
  if (period === 'yearly') return 'سال گذشته';
  return '';
}

export default function ComparisonCard({
  comparison,
  period = 'weekly',
  weekOffset = 0,
}) {
  if (!comparison) return null;

  const { previous, incomeChange, expenseChange } = comparison;

  // اگه دوره‌ی قبل هیچ تراکنشی نداشت، این کارت بی‌معنیه
  if (previous.income === 0 && previous.expense === 0) {
    return null;
  }

  const prevLabel = getPrevLabel(period, weekOffset);

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-[15px] font-bold text-[#F2EFE9]">مقایسه</h2>
        <span className="text-[10.5px] text-[#5C736C]">
          با {prevLabel}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CompareItem label="درآمد" tone="income" change={incomeChange} />
        <CompareItem label="مصرف" tone="expense" change={expenseChange} />
      </div>
    </section>
  );
}

function CompareItem({ label, tone, change }) {
  const isIncome = tone === 'income';
  const hasValue = change !== null && change !== undefined;
  const isUp = hasValue && change > 0.5;
  const isDown = hasValue && change < -0.5;
  const isZero = hasValue && Math.abs(change) <= 0.5;
  const absVal = hasValue ? Math.abs(change) : 0;

  let Icon = Minus;
  let colorClass = 'text-[#5C736C]';
  let bgClass = isIncome
    ? 'border-[#4FD1BE]/[0.10]'
    : 'border-[#E2574C]/[0.10]';

  if (isUp) {
    Icon = TrendingUp;
    // درآمد بالا = خوب (سبز) | مصرف بالا = بد (سرخ)
    colorClass = isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]';
  } else if (isDown) {
    Icon = TrendingDown;
    // درآمد پایین = بد (سرخ) | مصرف پایین = خوب (سبز)
    colorClass = isIncome ? 'text-[#E2574C]' : 'text-[#4FD1BE]';
  }

  return (
    <div
      className={[
        'rounded-[22px] border bg-[#0F211E] p-4',
        bgClass,
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-[11px] font-medium text-[#5C736C]">{label}</p>
        <Icon size={14} strokeWidth={2.4} className={colorClass} />
      </div>

      {hasValue ? (
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={[
              'text-[18px] font-extrabold tabular-nums',
              colorClass,
            ].join(' ')}
          >
            {isZero ? '—' : `${FA_NUM.format(Math.round(absVal))}٪`}
          </span>
          {!isZero && (
            <span className="text-[10px] font-semibold text-[#5C736C]">
              {isUp ? 'بیشتر' : 'کمتر'}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-2 text-[11px] font-semibold text-[#5C736C]">
          بدون سابقه
        </p>
      )}
    </div>
  );
}