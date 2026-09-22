import { NavLink } from 'react-router-dom';
import { Home, ArrowDownLeft, ArrowUpRight, Settings, Plus } from 'lucide-react';

import AppLogo from '../common/AppLogo';
import { useHaptic } from '../hooks/useHaptic';
import { useRecordTransaction } from '../hooks/useRecordTransaction';
import { APP_VERSION, ROUTES } from '../utils/constants';

const ITEMS = [
  { label: 'خانه', to: ROUTES.home, icon: Home, end: true },
  { label: 'درآمد', to: ROUTES.income, icon: ArrowDownLeft },
  { label: 'مصارف', to: ROUTES.expenses, icon: ArrowUpRight },
  { label: 'تنظیمات', to: ROUTES.settings, icon: Settings },
];

function SidebarItem({ label, to, icon: Icon, end = false }) {
  const haptic = useHaptic();

  return (
    <NavLink to={to} end={end} className="block" onClick={() => haptic.tap()}>
      {({ isActive }) => (
        <div className="kh-sidebar-item" data-active={isActive}>
          <div className="kh-sidebar-icon">
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.9} />
          </div>
          <span className="kh-sidebar-label">{label}</span>
        </div>
      )}
    </NavLink>
  );
}

function Sidebar() {
  const { buttonLabel, isDisabled, trigger } = useRecordTransaction();

  return (
    <aside className="glass-strong fixed right-0 top-0 z-40 hidden h-dvh w-[260px] flex-col border-l border-border-1 lg:flex">
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-2xl">
          <AppLogo size={44} withShadow={false} />
        </div>
        <div>
          <p className="text-xl font-extrabold text-fg-1">خزانه</p>
          <p className="mt-0.5 text-xs text-fg-3">مدیریت مالی شخصی</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-border-1" />

      <nav className="mt-4 flex-1 space-y-1.5 px-3">
        {ITEMS.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-border-1 px-4 py-4">
        <button
          type="button"
          onClick={trigger}
          aria-disabled={isDisabled}
          disabled={isDisabled}
          className={[
            'kh-btn w-full py-3 text-md',
            isDisabled ? '' : 'kh-btn-primary',
          ].join(' ')}
          style={
            isDisabled
              ? {
                  background: 'rgba(0,168,138,0.50)',
                  color: 'rgba(255,255,255,0.4)',
                  cursor: 'not-allowed',
                }
              : undefined
          }
        >
          <Plus size={18} strokeWidth={2.4} />
          {buttonLabel}
        </button>
      </div>

      <div className="px-5 pb-5 pt-1">
        <p className="text-center text-2xs leading-relaxed text-fg-3">
          خزانه • نسخه {APP_VERSION} • کاملاً آفلاین
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;