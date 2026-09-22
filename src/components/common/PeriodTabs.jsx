import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { PERIODS, PERIOD_SHORT } from '../utils/constants';

const ITEMS = PERIODS.map((id) => ({ id, label: PERIOD_SHORT[id] }));

function MobileTabs() {
  const period = useAppStore((s) => s.period);
  const setPeriod = useAppStore((s) => s.setPeriod);

  return (
    <div className="kh-tab-bar">
      {ITEMS.map((item) => {
        const isActive = period === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            data-active={isActive}
            className="kh-tab-btn"
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

function DesktopDropdown() {
  const period = useAppStore((s) => s.period);
  const setPeriod = useAppStore((s) => s.setPeriod);
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  const current = ITEMS.find((p) => p.id === period) || ITEMS[0];

  useEffect(() => {
    if (!open) return;
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative h-full w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="glass flex h-full w-full items-center justify-between gap-3 rounded-3xl px-5 py-4 transition-all duration-200 hover:border-primary/30 active:scale-[0.98]"
      >
        <span className="flex min-w-0 flex-col items-start">
          <span className="text-2xs font-medium text-fg-3">دوره‌ی نمایش</span>
          <span className="mt-1 text-lg font-extrabold text-primary">
            {current.label}
          </span>
        </span>

        <ChevronDown
          size={18}
          strokeWidth={2}
          className={[
            'shrink-0 text-primary transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div className="glass-strong absolute right-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl">
          {ITEMS.map((item) => {
            const isActive = period === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setPeriod(item.id);
                  setOpen(false);
                }}
                className={[
                  'flex w-full items-center justify-between gap-3 px-4 py-3 text-right text-base font-semibold transition-colors',
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-fg-2 hover:bg-fill-1 hover:text-fg-1',
                ].join(' ')}
              >
                <span>{item.label}</span>
                {isActive && <Check size={16} strokeWidth={2.5} />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function PeriodTabs({ forceTabs = false }) {
  const isDesktop = useIsDesktop();
  if (forceTabs) return <MobileTabs />;
  return isDesktop ? <DesktopDropdown /> : <MobileTabs />;
}