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
}) {
  const isIncome = tone === 'income';

  const accent = isIncome
    ? {
        text: 'text-[#4FD1BE]',
        iconBg: 'bg-[#4FD1BE]/[0.10]',
        border: 'border-[#4FD1BE]/[0.08]',
      }
    : {
        text: 'text-[#E2574C]',
        iconBg: 'bg-[#E2574C]/[0.10]',
        border: 'border-[#E2574C]/[0.08]',
      };

  const numericValue =
    typeof value === 'number'
      ? value
      : Number(String(value || '').replace(/[^\d.-]/g, '') || 0);

  return (
    <div
      className={[
        'rounded-[22px] border bg-[#0F211E]',
        'transition-all duration-200',
        accent.border,
        featured ? 'p-5 lg:p-6' : 'p-4 lg:p-5',
        fillHeight ? 'flex h-full flex-col justify-center' : '',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-[#5C736C] lg:text-[12px]">
            {title}
          </p>

          <div className="mt-2 flex items-center gap-2">
            <p
              className={[
                'font-extrabold tracking-tight text-[#F2EFE9]',
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
        </div>

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
      </div>
    </div>
  );
}

export default StatCard;