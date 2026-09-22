import { ChevronLeft } from 'lucide-react';

export function SettingsGroup({ children }) {
  return (
    <div className="glass mt-3 overflow-hidden rounded-3xl lg:mt-4">
      {children}
    </div>
  );
}

export function SettingsButtonRow({
  icon: Icon,
  title,
  subtitle,
  onClick,
  tone = 'default',
  isLast = false,
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'kh-settings-row',
        !isLast ? 'border-b border-border-1' : '',
      ].join(' ')}
    >
      {Icon && (
        <div
          className={[
            'kh-settings-row-icon',
            tone === 'danger' ? 'kh-settings-row-icon-danger' : '',
          ].join(' ')}
        >
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-md font-semibold text-fg-1 lg:text-base">{title}</p>
        {subtitle && (
          <p className="mt-1 truncate text-xs text-fg-3 lg:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <ChevronLeft
        size={18}
        strokeWidth={1.8}
        className="shrink-0 text-fg-3"
      />
    </button>
  );
}

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
        'kh-settings-row',
        !isLast ? 'border-b border-border-1' : '',
        disabled ? 'opacity-50' : '',
      ].join(' ')}
    >
      {Icon && (
        <div className="kh-settings-row-icon">
          <Icon size={19} strokeWidth={1.8} />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <p className="text-md font-semibold text-fg-1 lg:text-base">{title}</p>
        {subtitle && (
          <p className="mt-1 truncate text-xs text-fg-3 lg:text-sm">
            {subtitle}
          </p>
        )}
      </div>

      <button
        type="button"
        onClick={() => !disabled && onChange?.(!checked)}
        disabled={disabled}
        data-checked={checked}
        className="kh-toggle"
        aria-label={title}
        aria-pressed={checked}
      >
        <span className="kh-toggle-thumb" />
      </button>
    </div>
  );
}

export function SettingsProfileCard({ name, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="glass-strong mt-6 flex w-full items-center gap-3 rounded-3xl border-primary/20 p-5 text-right active:scale-[0.99] lg:mt-4 lg:p-6"
    >
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary lg:h-14 lg:w-14">
        <span className="text-xl font-extrabold lg:text-2xl">
          {name?.[0] ? name[0] : '؟'}
        </span>
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-md font-bold text-fg-1 lg:text-lg">
          {name || 'کاربر خزانه'}
        </p>
        <p className="mt-1 text-xs text-fg-2 lg:text-sm">
          حساب محلی روی همین دستگاه
        </p>
      </div>

      <ChevronLeft size={18} className="shrink-0 text-fg-3" />
    </button>
  );
}

export function StatusBadge({
  active,
  activeLabel = 'فعال',
  inactiveLabel = 'غیرفعال',
}) {
  return (
    <span className="kh-status-badge" data-active={active}>
      {active ? activeLabel : inactiveLabel}
    </span>
  );
}