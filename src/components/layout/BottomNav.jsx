import { NavLink } from 'react-router-dom';
import { Home, ArrowDownLeft, ArrowUpRight, Settings } from 'lucide-react';

const leftItems = [
  { label: 'خانه', to: '/', icon: Home, end: true },
  { label: 'درآمد', to: '/income', icon: ArrowDownLeft },
];
const rightItems = [
  { label: 'مصارف', to: '/expenses', icon: ArrowUpRight },
  { label: 'تنظیمات', to: '/settings', icon: Settings },
];

function NavItem({ label, to, icon: Icon, end = false }) {
  return (
    <NavLink to={to} end={end} className="flex h-full items-center justify-center">
      {({ isActive }) => (
        <div
          className={[
            'flex min-h-[48px] min-w-[48px] flex-col items-center justify-center rounded-2xl px-1',
            'transition-all duration-200 active:scale-[0.94]',
            isActive ? 'text-[#E3B341]' : 'text-[#5C736C]',
          ].join(' ')}
        >
          <Icon size={19} strokeWidth={isActive ? 2.2 : 1.8} />
          <span
            className={[
              'mt-1 text-[10px] font-semibold leading-none',
              isActive ? 'text-[#E3B341]' : 'text-[#5C736C]',
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
    <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[420px] -translate-x-1/2 px-3 pb-[env(safe-area-inset-bottom)]">
      <div className="relative mb-2 flex h-[64px] items-center justify-between rounded-[23px] border border-white/[0.07] bg-[#0F211E]/95 px-2 shadow-[0_-8px_30px_rgba(0,0,0,0.18)] backdrop-blur-xl">
        <div className="flex h-full flex-1 items-center justify-between pl-3">
          {leftItems.map((item) => <NavItem key={item.to} {...item} />)}
        </div>
        <div className="w-[60px] shrink-0" />
        <div className="flex h-full flex-1 items-center justify-between pr-4">
          {rightItems.map((item) => <NavItem key={item.to} {...item} />)}
        </div>
      </div>
    </nav>
  );
}

export default BottomNav;