import { NavLink, useLocation } from 'react-router-dom';
import {
  Home,
  ArrowDownLeft,
  ArrowUpRight,
  Settings,
  Plus,
} from 'lucide-react';

import AppLogo from '../common/AppLogo';
import { useAppStore } from '../store/appStore';
import { useHaptic } from '../hooks/useHaptic';
import { getPeriodBaseDate } from '../utils/dates';
import { APP_VERSION } from '../utils/constants';

const items = [
  { label: 'خانه', to: '/', icon: Home, end: true },
  { label: 'درآمد', to: '/income', icon: ArrowDownLeft },
  { label: 'مصارف', to: '/expenses', icon: ArrowUpRight },
  { label: 'تنظیمات', to: '/settings', icon: Settings },
];

function SidebarItem({ label, to, icon: Icon, end = false }) {
  const haptic = useHaptic();

  return (
    <NavLink to={to} end={end} className="block" onClick={() => haptic.tap()}>
      {({ isActive }) => (
        <div
          className={[
            'group flex items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
            isActive
              ? 'bg-[#00D1A7]/[0.12] border border-[#00D1A7]/20'
              : 'hover:bg-white/[0.04] border border-transparent',
          ].join(' ')}
        >
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-all',
              isActive
                ? 'bg-[#00D1A7]/[0.18] text-[#00D1A7]'
                : 'bg-white/[0.06] text-[#94A3B8] group-hover:bg-white/[0.10] group-hover:text-[#F8FAFC]',
            ].join(' ')}
          >
            <Icon size={20} strokeWidth={isActive ? 2.2 : 1.9} />
          </div>
          <span
            className={[
              'text-[14.5px] font-semibold transition-colors',
              isActive
                ? 'text-[#00D1A7]'
                : 'text-[#94A3B8] group-hover:text-[#F8FAFC]',
            ].join(' ')}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

function Sidebar() {
  const location = useLocation();
  const haptic = useHaptic();

  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const openDateChoice = useAppStore((s) => s.openDateChoice);
  const showPeriodLockToast = useAppStore((s) => s.showPeriodLockToast);
  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);

  const type = location.pathname === '/income' ? 'income' : 'expense';
  const buttonLabel = type === 'income' ? 'ثبت درآمد' : 'ثبت مصرف';
  const isDisabled = period === 'monthly' || period === 'yearly';

  function handleClick() {
    if (isDisabled) {
      haptic.warning();
      showPeriodLockToast();
      return;
    }

    haptic.medium();

    if (period === 'daily') {
      const date = getPeriodBaseDate('daily', periodOffset);
      openTransactionSheet(type, null, date);
      return;
    }

    if (period === 'weekly') {
      openDateChoice(type);
      return;
    }

    openTransactionSheet(type);
  }

  return (
    <aside
      className="
        glass-strong fixed right-0 top-0 z-40 hidden h-dvh w-[260px] flex-col
        border-l border-white/[0.08]
        lg:flex
      "
    >
      <div className="flex items-center gap-3 px-5 py-6">
        <div className="flex h-[44px] w-[44px] items-center justify-center overflow-hidden rounded-2xl">
          <AppLogo size={44} withShadow={false} />
        </div>
        <div>
          <p className="text-[17px] font-extrabold text-[#F8FAFC]">خزانه</p>
          <p className="mt-0.5 text-[11px] text-[#64748B]">مدیریت مالی شخصی</p>
        </div>
      </div>

      <div className="mx-4 h-px bg-white/[0.08]" />

      <nav className="mt-4 flex-1 space-y-1.5 px-3">
        {items.map((item) => (
          <SidebarItem key={item.to} {...item} />
        ))}
      </nav>

      <div className="border-t border-white/[0.08] px-4 py-4">
        <button
          type="button"
          onClick={handleClick}
          aria-disabled={isDisabled}
          className={[
            'flex w-full items-center justify-center gap-2 rounded-2xl',
            'py-3 text-[13.5px] font-bold transition-all',
            isDisabled
              ? 'cursor-not-allowed border border-[#00A88A]/30 bg-[#00A88A]/50 text-white/40'
              : 'bg-[linear-gradient(155deg,#00D1A7,#00A88A)] text-white shadow-[0_6px_24px_rgba(0,209,167,0.30)] active:scale-[0.98]',
          ].join(' ')}
        >
          <Plus size={18} strokeWidth={2.4} />
          {buttonLabel}
        </button>
      </div>

      <div className="px-5 pb-5 pt-1">
        <p className="text-center text-[10.5px] leading-relaxed text-[#64748B]">
          خزانه • نسخه {APP_VERSION} • کاملاً آفلاین
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;