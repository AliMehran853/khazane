import { ChevronLeft } from 'lucide-react';

import AnimatedNumber from './AnimatedNumber';
import ChangeBadge from './ChangeBadge';
import { formatNumber } from '../utils/formatting';

function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'income',
  featured = false,
  animate = true,
  change = null,
  fillHeight = false,
  onClick,
  clickHint,
}) {
  const isIncome = tone === 'income';
  const clickable = typeof onClick === 'function';

  const accentText = isIncome ? 'text-primary' : 'text-expense';
  const accentBg = isIncome ? 'bg-primary/15' : 'bg-expense/15';

  const numericValue = typeof value === 'number' ? value : Number(value) || 0;

  const Wrapper = clickable ? 'button' : 'div';

  return (
    <Wrapper
      {...(clickable ? { type: 'button', onClick } : {})}
      className={[
        'glass rounded-3xl text-right transition-all duration-200',
        featured ? 'p-5 lg:p-6' : 'p-4 lg:p-5',
        fillHeight ? 'flex h-full flex-col justify-center' : '',
        clickable ? 'w-full hover:border-primary/30 active:scale-[0.99]' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-fg-3 lg:text-sm">{title}</p>

          <div className="mt-2 flex items-center gap-2">
            <p
              className={[
                'font-extrabold tracking-tight text-fg-1',
                featured ? 'text-4xl lg:text-5xl' : 'text-2xl lg:text-3xl',
              ].join(' ')}
            >
              {animate ? (
                <AnimatedNumber
                  value={numericValue}
                  duration={650}
                  format={formatNumber}
                />
              ) : (
                formatNumber(numericValue)
              )}
            </p>

            {change && (
              <ChangeBadge
                current={change.current}
                previous={change.previous}
                tone={tone}
                size={featured ? 'md' : 'sm'}
              />
            )}
          </div>

          {clickable && clickHint && (
            <p className="mt-1.5 text-2xs font-semibold text-primary/80">
              {clickHint}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {Icon && (
            <div
              className={[
                'flex items-center justify-center rounded-xl',
                accentBg,
                featured
                  ? 'h-11 w-11 lg:h-12 lg:w-12'
                  : 'h-10 w-10 lg:h-11 lg:w-11',
              ].join(' ')}
            >
              <Icon
                size={featured ? 20 : 18}
                strokeWidth={1.9}
                className={accentText}
              />
            </div>
          )}

          {clickable && (
            <ChevronLeft
              size={16}
              strokeWidth={2.2}
              className="text-primary"
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default StatCard;