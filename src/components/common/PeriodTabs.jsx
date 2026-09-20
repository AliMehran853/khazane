import { useState, useRef, useEffect } from 'react';
import { Check, ChevronDown } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import { useIsDesktop } from '../hooks/useIsDesktop';

const periods = [
  { id: 'daily', label: 'روزانه' },
  { id: 'weekly', label: 'هفتگی' },
  { id: 'monthly', label: 'ماهانه' },
  { id: 'yearly', label: 'سالانه' },
];

function MobileTabs() {
  const period = useAppStore((s) => s.period);
  const setPeriod = useAppStore((s) => s.setPeriod);

  return (
    <div className="glass-inner flex w-full rounded-2xl p-1">
      {periods.map((item) => {
        const isActive = period === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={[
              'flex min-h-11 flex-1 items-center justify-center rounded-xl',
              'text-[11.5px] font-semibold',
              'transition-all duration-200',
              'active:scale-[0.97]',
              isActive
                ? 'bg-[#00D1A7]/[0.18] text-[#00D1A7] shadow-[0_2px_10px_rgba(0,209,167,0.15)] border border-[#00D1A7]/25'
                : 'text-[#94A3B8] border border-transparent',
            ].join(' ')}
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

  const current = periods.find((p) => p.id === period) || periods[0];

  useEffect(() => {
    function onDocClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    function onEsc(e) {
      if (e.key === 'Escape') setOpen(false);
    }
    if (open) {
      document.addEventListener('mousedown', onDocClick);
      document.addEventListener('keydown', onEsc);
      return () => {
        document.removeEventListener('mousedown', onDocClick);
        document.removeEventListener('keydown', onEsc);
      };
    }
  }, [open]);

  return (
    <div ref={ref} className="relative h-full w-full">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="
          glass flex h-full w-full items-center justify-between gap-3
          rounded-[22px] px-5 py-4
          transition-all duration-200
          hover:border-[#00D1A7]/30 active:scale-[0.98]
        "
      >
        <span className="flex min-w-0 flex-col items-start">
          <span className="text-[10.5px] font-medium text-[#64748B]">
            دوره‌ی نمایش
          </span>
          <span className="mt-1 text-[15px] font-extrabold text-[#00D1A7]">
            {current.label}
          </span>
        </span>

        <ChevronDown
          size={18}
          strokeWidth={2}
          className={[
            'shrink-0 text-[#00D1A7] transition-transform duration-200',
            open ? 'rotate-180' : '',
          ].join(' ')}
        />
      </button>

      {open && (
        <div
          className="
            glass-strong absolute right-0 top-[calc(100%+8px)] z-50 w-full
            overflow-hidden rounded-2xl
          "
          style={{ minWidth: '180px' }}
        >
          {periods.map((item) => {
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
                  'flex w-full items-center justify-between gap-3 px-4 py-3 text-right',
                  'text-[13.5px] font-semibold transition-colors',
                  isActive
                    ? 'bg-[#00D1A7]/[0.12] text-[#00D1A7]'
                    : 'text-[#94A3B8] hover:bg-white/[0.04] hover:text-[#F8FAFC]',
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