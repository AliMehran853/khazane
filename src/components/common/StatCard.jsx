function StatCard({
  title,
  value,
  icon: Icon,
  tone = 'income',
  featured = false,
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

  return (
    <div
      className={[
        'rounded-[22px] border bg-[#0F211E]',
        'transition-all duration-200',
        accent.border,
        featured ? 'p-5 lg:p-6' : 'p-4 lg:p-5',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#5C736C] lg:text-[12px]">
            {title}
          </p>

          <p
            className={[
              'mt-2 font-extrabold tracking-tight text-[#F2EFE9]',
              featured ? 'text-[28px] lg:text-[32px]' : 'text-[19px] lg:text-[22px]',
            ].join(' ')}
          >
            {value}
          </p>
        </div>

        {Icon && (
          <div
            className={[
              'flex items-center justify-center rounded-2xl',
              accent.iconBg,
              featured ? 'h-11 w-11 lg:h-12 lg:w-12' : 'h-10 w-10 lg:h-11 lg:w-11',
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