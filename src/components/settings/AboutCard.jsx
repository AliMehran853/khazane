import { ChevronLeft, Info } from 'lucide-react';

export default function AboutCard({ onClick, isLast = false }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'kh-settings-row',
        !isLast ? 'border-b border-border-1' : '',
      ].join(' ')}
    >
      <div className="kh-settings-row-icon">
        <Info size={19} strokeWidth={1.8} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-md font-semibold text-fg-1 lg:text-base">
          درباره‌ی خزانه
        </p>
        <p className="mt-1 truncate text-xs text-fg-3 lg:text-sm">
          اطلاعات اپ و ارتباط با سازنده
        </p>
      </div>

      <ChevronLeft
        size={18}
        strokeWidth={1.8}
        className="shrink-0 text-fg-3"
      />
    </button>
  );
}