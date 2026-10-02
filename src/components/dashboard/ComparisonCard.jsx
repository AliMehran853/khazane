import { Minus, TrendingDown, TrendingUp } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { formatNumber } from '../utils/formatting';

export default function ComparisonCard({
  comparison,
  period = 'weekly',
  weekOffset = 0,
}) {
  const { t } = useTranslation();

  if (!comparison) return null;

  const { previous, incomeChange, expenseChange } = comparison;

  if (previous.income === 0 && previous.expense === 0) return null;

  const prevLabel = t(`comparison.previous.${period}`, {
    defaultValue: t('comparison.previous.weekly'),
  });

  return (
    <section className="mt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-fg-1">{t('comparison.title')}</h2>
        <span className="text-2xs text-fg-3">
          {t('comparison.with', { label: prevLabel })}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3">
        <CompareItem
          label={t('balance.income')}
          tone="income"
          change={incomeChange}
        />
        <CompareItem
          label={t('balance.expense')}
          tone="expense"
          change={expenseChange}
        />
      </div>
    </section>
  );
}

function CompareItem({ label, tone, change }) {
  const { t } = useTranslation();
  const isIncome = tone === 'income';
  const hasValue = change !== null && change !== undefined;
  const isUp = hasValue && change > 0.5;
  const isDown = hasValue && change < -0.5;
  const isZero = hasValue && Math.abs(change) <= 0.5;
  const absVal = hasValue ? Math.abs(change) : 0;

  let Icon = Minus;
  let colorClass = 'text-fg-3';
  let borderClass = isIncome ? 'border-primary/10' : 'border-expense/10';

  if (isUp) {
    Icon = TrendingUp;
    colorClass = isIncome ? 'text-primary' : 'text-expense';
  } else if (isDown) {
    Icon = TrendingDown;
    colorClass = isIncome ? 'text-expense' : 'text-primary';
  }

  return (
    <div
      className={[
        'rounded-3xl border bg-fill-1 p-4 backdrop-blur-md',
        borderClass,
      ].join(' ')}
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-fg-3">{label}</p>
        <Icon size={14} strokeWidth={2.4} className={colorClass} />
      </div>

      {hasValue ? (
        <div className="mt-2 flex items-baseline gap-1.5">
          <span
            className={['text-xl font-extrabold tabular-nums', colorClass].join(
              ' ',
            )}
          >
            {isZero ? '—' : `${formatNumber(absVal)}٪`}
          </span>
          {!isZero && (
            <span className="text-2xs font-semibold text-fg-3">
              {isUp ? t('comparison.more') : t('comparison.less')}
            </span>
          )}
        </div>
      ) : (
        <p className="mt-2 text-xs font-semibold text-fg-3">
          {t('comparison.noHistory')}
        </p>
      )}
    </div>
  );
}