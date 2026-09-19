import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';

const FA_NUM = new Intl.NumberFormat('fa-AF');

export function computeChange(current, previous) {
  const c = Number(current) || 0;
  const p = Number(previous) || 0;

  if (p === 0) {
    if (c === 0) return { type: 'none', pct: 0 };
    return { type: 'new', pct: 0 };
  }

  const pct = ((c - p) / p) * 100;
  if (Math.abs(pct) < 0.5) return { type: 'flat', pct: 0 };
  return { type: pct > 0 ? 'up' : 'down', pct };
}

/**
 * ChangeBadge
 * - tone="income"  : افزایش = خوب (سبز) | کاهش = بد (سرخ)
 * - tone="expense" : افزایش = بد (سرخ) | کاهش = خوب (سبز)
 */
export default function ChangeBadge({
  current,
  previous,
  tone = 'income',
  size = 'sm',
}) {
  const change = computeChange(current, previous);
  if (change.type === 'none') return null;

  const isIncome = tone === 'income';

  let isGood = true;
  if (change.type === 'up') isGood = isIncome;
  else if (change.type === 'down') isGood = !isIncome;

  const colorClass =
    change.type === 'flat' || change.type === 'new'
      ? 'text-[#8FA39D] bg-white/[0.04]'
      : isGood
        ? 'text-[#4FD1BE] bg-[#4FD1BE]/[0.12]'
        : 'text-[#E2574C] bg-[#E2574C]/[0.12]';

  let Icon = Minus;
  if (change.type === 'up') Icon = ArrowUpRight;
  else if (change.type === 'down') Icon = ArrowDownRight;

  let text = '';
  if (change.type === 'new') text = 'جدید';
  else if (change.type === 'flat') text = 'ثابت';
  else text = `${FA_NUM.format(Math.round(Math.abs(change.pct)))}٪`;

  const isSm = size === 'sm';

  return (
    <span
      className={[
        'inline-flex shrink-0 items-center gap-0.5 rounded-full font-bold tabular-nums',
        isSm ? 'px-1.5 py-0.5 text-[9.5px]' : 'px-2 py-0.5 text-[10.5px]',
        colorClass,
      ].join(' ')}
    >
      {change.type !== 'new' && (
        <Icon size={isSm ? 9 : 11} strokeWidth={2.6} />
      )}
      <span>{text}</span>
    </span>
  );
}