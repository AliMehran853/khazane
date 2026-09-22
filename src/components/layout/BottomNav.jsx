import { NavLink } from 'react-router-dom';
import { Home, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';

import { useHaptic } from '../hooks/useHaptic';
import { ROUTES } from '../utils/constants';

const LEFT_ITEMS = [
  { label: 'خانه', to: ROUTES.home, icon: Home, end: true },
  { label: 'درآمد', to: ROUTES.income, icon: ArrowDownLeft },
];

const RIGHT_ITEMS = [
  { label: 'مصارف', to: ROUTES.expenses, icon: ArrowUpRight },
  { label: 'تنظیمات', to: ROUTES.settings, icon: Settings },
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
        <div className="kh-nav-item" data-active={isActive}>
          <Icon size={19} strokeWidth={isActive ? 2.4 : 1.8} />
          <span className="kh-nav-item-label">{label}</span>
        </div>
      )}
    </NavLink>
  );
}

function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 px-3 pb-[env(safe-area-inset-bottom)] lg:hidden">
      <div className="kh-nav-bar mb-2">
        <div className="flex h-full flex-1 items-center justify-between pl-3">
          {LEFT_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
        <div className="w-[60px] shrink-0" />
        <div className="flex h-full flex-1 items-center justify-between pr-4">
          {RIGHT_ITEMS.map((item) => (
            <NavItem key={item.to} {...item} />
          ))}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;