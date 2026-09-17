import { ChevronLeft } from 'lucide-react';

// ============================================================
// گروه (کارت سفید که چند ردیف را در خودش دارد)
// ============================================================

export function SettingsGroup({ children }) {
  return (
    <div className="mt-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
      {children}
    </div>
  );
}

// ============================================================
// ردیف دکمه‌ای (کلیک می‌شود و چیزی باز می‌کند)
// ============================================================

export function SettingsButtonRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = 'default',
  isLast = false,
}) {
  const iconBg =
    tone === 'danger'
      ? 'bg-[#E2574C]/[0.10] text-[#E2574C]'
      : 'bg-[#153029] text-[#8FA39D]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-[70px] w-full items-center gap-3 px-4 text-right transition-colors',
        'active:bg-white/[0.025]',
        !isLast ? 'border-b border-white/[0.06]' : '',
      ].join(' ')}
    >
      {Icon && (
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
            iconBg,
          ].join(' ')}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#F2EFE9]">{title}</p>
        {subtitle && (
          <p className="mt-1 truncate text-[11px] text-[#5C736C]">{subtitle}</p>
        )}
      </div>

      <ChevronLeft
        size={18}
        strokeWidth={1.8}
        className="shrink-0 text-[#5C736C]"
      />
    </button>
  );
}

// ============================================================
// ردیف با تاگل
// ============================================================

export function SettingsToggleRow({
  icon: Icon,
  title,
  subtitle,
  checked = false,
  onChange,
  disabled = false,
  isLast = false,
}) {
  return (
    <div
      className={[
        'flex min-h-[70px] items-center gap-3 px-4',
        !isLast ? 'border-b border-white/[0.06]' : '',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D]">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#F2EFE9]">{title}</p>
        {subtitle && (
          <p className="mt-1 truncate text-[11px] text-[#5C736C]">{subtitle}</p>
        )}
      </div>

      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={[
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[#E3B341]' : 'bg-white/[0.10]',
        ].join(' ')}
        aria-label={title}
      >
        <span
          className={[
            'absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full bg-white shadow',
            'transition-all duration-200',
            checked ? 'left-[3px]' : 'left-[25px]',
          ].join(' ')}
        />
      </button>
    </div>
  );
}

// ============================================================
// کارت پروفایل
// ============================================================

export function SettingsProfileCard({ name, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="mt-6 flex w-full items-center gap-3 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] p-5 text-right active:scale-[0.99]"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/10 text-[#E3B341]">
        <span className="text-[20px] font-extrabold">
          {name?.[0] ? name[0] : '؟'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#F2EFE9]">
          {name || 'کاربر خزانه'}
        </p>
        <p className="mt-1 text-[11px] text-[#8FA39D]">
          حساب محلی روی همین دستگاه
        </p>
      </div>

      <ChevronLeft size={18} className="shrink-0 text-[#5C736C]" />
    </button>
  );
}

// ============================================================
// بج وضعیت (فعال / غیرفعال)
// ============================================================

export function StatusBadge({ active, activeLabel = 'فعال', inactiveLabel = 'غیرفعال' }) {
  return (
    <span
      className={[
        'shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold',
        active
          ? 'bg-[#4FD1BE]/10 text-[#4FD1BE]'
          : 'bg-white/[0.05] text-[#5C736C]',
      ].join(' ')}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}