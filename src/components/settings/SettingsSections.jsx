import { ChevronLeft } from 'lucide-react';

// ============================================================
// گروه
// ============================================================

export function SettingsGroup({ children }) {
  return (
    <div className="glass mt-3 overflow-hidden rounded-[24px] lg:mt-4 lg:rounded-[22px]">
      {children}
    </div>
  );
}

// ============================================================
// ردیف دکمه‌ای
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
      ? 'bg-[#F43F5E]/[0.14] text-[#F43F5E] border-[#F43F5E]/25'
      : 'bg-white/[0.06] text-[#94A3B8] border-white/[0.06]';

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-[70px] w-full items-center gap-3 px-4 text-right transition-colors lg:min-h-[64px] lg:px-5',
        'active:bg-white/[0.04]',
        !isLast ? 'border-b border-white/[0.06]' : '',
      ].join(' ')}
    >
      {Icon && (
        <div
          className={[
            'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border lg:h-9 lg:w-9',
            iconBg,
          ].join(' ')}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#F8FAFC] lg:text-[14px]">
          {title}
        </p>
        {subtitle && (
          <p className="mt-1 truncate text-[11px] text-[#64748B] lg:text-[11.5px]">
            {subtitle}
          </p>
        )}
      </div>

      <ChevronLeft
        size={18}
        strokeWidth={1.8}
        className="shrink-0 text-[#64748B]"
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
        'flex min-h-[70px] items-center gap-3 px-4 lg:min-h-[64px] lg:px-5',
        !isLast ? 'border-b border-white/[0.06]' : '',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {Icon && (
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.06] text-[#94A3B8] lg:h-9 lg:w-9">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-semibold text-[#F8FAFC] lg:text-[14px]">
          {title}
        </p>
        {subtitle && (
          <p className="mt-1 truncate text-[11px] text-[#64748B] lg:text-[11.5px]">
            {subtitle}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        className={[
          'relative h-7 w-12 shrink-0 rounded-full transition-colors',
          checked ? 'bg-[#00D1A7]' : 'bg-white/[0.12]',
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
      className="glass-strong mt-6 flex w-full items-center gap-3 rounded-[26px] border-[#00D1A7]/20 p-5 text-right active:scale-[0.99] lg:mt-4 lg:p-6"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7] lg:h-14 lg:w-14">
        <span className="text-[20px] font-extrabold lg:text-[22px]">
          {name?.[0] ? name[0] : '؟'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-[14px] font-bold text-[#F8FAFC] lg:text-[16px]">
          {name || 'کاربر خزانه'}
        </p>
        <p className="mt-1 text-[11px] text-[#94A3B8] lg:text-[12px]">
          حساب محلی روی همین دستگاه
        </p>
      </div>

      <ChevronLeft size={18} className="shrink-0 text-[#64748B]" />
    </button>
  );
}

// ============================================================
// بج وضعیت
// ============================================================

export function StatusBadge({
  active,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}) {
  return (
    <span
      className={[
        'shrink-0 rounded-full border px-2.5 py-0.5 text-[10px] font-semibold backdrop-blur-md',
        active
          ? 'border-[#00D1A7]/25 bg-[#00D1A7]/[0.14] text-[#00D1A7]'
          : 'border-white/[0.08] bg-white/[0.06] text-[#64748B]',
      ].join(' ')}
    >
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}