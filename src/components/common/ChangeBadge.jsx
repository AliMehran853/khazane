import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

const FA_NUM = new Intl.NumberFormat('fa-AF');

export function computeChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  const diff = c - p;

  if (c === 0 && p === 0) return { type: 'none', diff: 0 };
  if (diff === 0) return { type: 'flat', diff: 0 };

  return { type: diff > 0 ? 'up' : 'down', diff };
}

/**
 * ChangeBadge
 * tone="income"  → ▲ سبز / ▼ سرخ
 * tone="expense" → ▲ سرخ / ▼ سبز
 */
export default function ChangeBadge({
  current,
  previous,
  tone = 'income',
  size = 'sm',
  currency = 'افغانی',
}) {
  const change = computeChange(current, previous);
  if (change.type === 'none') return null;

  const isIncome = tone === 'income';

  let isGood = true;
  if (change.type === 'up') isGood = isIncome;
  else if (change.type === 'down') isGood = !isIncome;

  const colorClass =
    change.type === 'flat'
      ? 'text-[#8FA39D] bg-white/[0.05]'
      : isGood
        ? 'text-[#4FD1BE] bg-[#4FD1BE]/[0.12]'
        : 'text-[#E2574C] bg-[#E2574C]/[0.12]';

  let Icon = Minus;
  if (change.type === 'up') Icon = ArrowUp;
  else if (change.type === 'down') Icon = ArrowDown;

  const isSm = size === 'sm';
  const amount = FA_NUM.format(Math.abs(Math.round(change.diff)));

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-bold tabular-nums',
        isSm ? 'px-2 py-[3px] text-[9.5px]' : 'px-2.5 py-1 text-[10.5px]',
        colorClass,
      ].join(' ')}
    >
      <Icon size={isSm ? 10 : 12} strokeWidth={2.6} />

      {change.type === 'flat' ? (
        <span>ثابت</span>
      ) : (
        <>
          <span>{amount}</span>
          <span className="opacity-70">{currency}</span>
          <span className="opacity-70">
            {change.type === 'up' ? 'بیشتر' : 'کمتر'}
          </span>
        </>
      )}
    </span>
  );
}