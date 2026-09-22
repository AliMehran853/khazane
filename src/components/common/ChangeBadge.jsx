import { ArrowDown, ArrowUp, Minus } from 'lucide-react';

import { formatNumber } from '../utils/formatting';

export function computeChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;
  const diff = c - p;

  if (c === 0 && p === 0) return { type: 'none', diff: 0 };
  if (diff === 0) return { type: 'flat', diff: 0 };

  return { type: diff > 0 ? 'up' : 'down', diff };
}

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
      ? 'text-fg-2 bg-fill-2 border-border-1'
      : isGood
        ? 'text-primary bg-primary/15 border-primary/25'
        : 'text-expense bg-expense/15 border-expense/25';

  let Icon = Minus;
  if (change.type === 'up') Icon = ArrowUp;
  else if (change.type === 'down') Icon = ArrowDown;

  const isSm = size === 'sm';
  const amount = formatNumber(Math.abs(change.diff));

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border font-bold tabular-nums backdrop-blur-md',
        isSm ? 'px-2 py-[3px] text-2xs' : 'px-2.5 py-1 text-xs',
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