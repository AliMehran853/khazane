import { NavLink } from 'react-router-dom';
import { Home, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';

import { useHaptic } from '../hooks/useHaptic';

const leftItems = [
  { label: 'خانه', to: '/', icon: Home, end: true },
  { label: 'درآمد', to: '/income', icon: ArrowDownLeft },
];
const rightItems = [
  { label: 'مصارف', to: '/expenses', icon: ArrowUpRight },
  { label: 'تنظیمات', to: '/settings', icon: Settings },
];

function NavItem({ label, to, icon: Icon, end = false }) {
  const haptic = useHaptic();

  return (
    <NavLink
      to={to}
      end={end}
      className="flex h-full items-center justify-center"
      onClick={() => haptic.tap()}
    >
      {({ isActive }) => (
        <div
          className={[
            'flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl px-1',
            'transition-all duration-200 active:scale-[0.94]',
            isActive ? 'text-[#00D1A7]' : 'text-[#94A3B8]',
          ].join(' ')}
        >
          <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
          <span
            className={[
              'mt-1 text-[10px] font-semibold leading-none',
              isActive ? 'text-[#00D1A7]' : 'text-[#94A3B8]',
            ].join(' ')}
          >
            {label}
          </span>
        </div>
      )}
    </NavLink>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="glass-strong relative mb-2 flex h-[64px] items-center justify-between rounded-[23px] px-2">
        <div className="flex h-full flex-1 items-center justify-between pl-3">
          {leftItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
        <div className="w-[60px] shrink-0" />
        <div className="flex h-full flex-1 items-center justify-between pr-4">
          {rightItems.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;