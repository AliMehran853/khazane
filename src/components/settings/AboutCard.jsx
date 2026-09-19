import { ChevronLeft, Info } from 'lucide-react';

export default function AboutCard({ onClick, isLast = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-[70px] w-full items-center gap-3 px-4 text-right',
        'transition-colors lg:min-h-[64px] lg:px-5',
        'active:bg-white/[0.025]',
        !isLast ? 'border-b border-white/[0.06]' : '',
      ].join(' ')}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D] lg:h-9 lg:w-9">
        <Info size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#F2EFE9] lg:text-[14px]">
          درباره‌ی خزانه
        </p>
        <p className="mt-1 truncate text-[11px] text-[#5C736C] lg:text-[11.5px]">
          اطلاعات اپ و ارتباط با سازنده
        </p>
      </div>

      <ChevronLeft
        size={18}
        strokeWidth={1.8}
        className="shrink-0 text-[#5C736C]"
      />
    </button>
  );
}