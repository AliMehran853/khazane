
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
        featured ? 'p-5' : 'p-4',
      ].join(' ')}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium text-[#5C736C]">
            {title}
          </p>

          <p
            className={[
              'mt-2 font-extrabold tracking-tight text-[#F2EFE9]',
              featured ? 'text-[28px]' : 'text-[19px]',
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
              featured ? 'h-11 w-11' : 'h-10 w-10',
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