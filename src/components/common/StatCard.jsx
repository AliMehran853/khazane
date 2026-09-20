import { ChevronLeft } from 'lucide-react';
import AnimatedNumber from './AnimatedNumber';
import ChangeBadge from './ChangeBadge';

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

  const accent = isIncome
    ? {
        text: 'text-[#00D1A7]',
        iconBg: 'bg-[#00D1A7]/[0.12]',
      }
    : {
        text: 'text-[#F43F5E]',
        iconBg: 'bg-[#F43F5E]/[0.12]',
      };

  const numericValue =
    typeof value === 'number'
      ? value
      : Number(String(value || '').replace(/[^\d.-]/g, '') || 0);

  const Wrapper = clickable ? 'button' : 'div';

  return (
    <Wrapper
      {...(clickable ? { type: 'button', onClick } : {})}
      className={[
        'glass rounded-[22px] text-right',
        'transition-all duration-200',
        featured ? 'p-5 lg:p-6' : 'p-4 lg:p-5',
        fillHeight ? 'flex h-full flex-col justify-center' : '',
        clickable
          ? 'w-full hover:border-[#00D1A7]/30 active:scale-[0.99]'
          : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-medium text-[#64748B] lg:text-[12px]">
            {title}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p
              className={[
                'font-extrabold tracking-tight text-[#F8FAFC]',
                featured
                  ? 'text-[28px] lg:text-[32px]'
                  : 'text-[19px] lg:text-[22px]',
              ].join(' ')}
            >
              {animate && typeof value === 'number' ? (
                <AnimatedNumber value={numericValue} duration={650} />
              ) : (
                value
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
            <p className="mt-1.5 text-[10.5px] font-semibold text-[#00D1A7]/80">
              {clickHint}
            </p>
          )}
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {Icon && (
            <div
              className={[
                'flex items-center justify-center rounded-2xl',
                accent.iconBg,
                featured
                  ? 'h-11 w-11 lg:h-12 lg:w-12'
                  : 'h-10 w-10 lg:h-11 lg:w-11',
              ].join(' ')}
            >
              <Icon
                size={featured ? 20 : 18}
                strokeWidth={1.9}
                className={accent.text}
              />
            </div>
          )}

          {clickable && (
            <ChevronLeft
              size={16}
              strokeWidth={2.2}
              className="text-[#00D1A7]"
            />
          )}
        </div>
      </div>
    </Wrapper>
  );
}

export default StatCard;