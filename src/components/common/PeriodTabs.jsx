import { useAppStore } from '../store/appStore';

const periods = [
  { id: 'weekly', label: 'هفتگی' },
  { id: 'monthly', label: 'ماهانه' },
  { id: 'yearly', label: 'سالانه' },
];

function PeriodTabs() {
  const period = useAppStore((state) => state.period);
  const setPeriod = useAppStore((state) => state.setPeriod);

  return (
    <div className="flex w-full rounded-2xl border border-white/[0.06] bg-[#0F211E] p-1">
      {periods.map((item) => {
        const isActive = period === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => setPeriod(item.id)}
            className={[
              'flex min-h-11 flex-1 items-center justify-center rounded-xl',
              'text-[12px] font-semibold',
              'transition-all duration-200',
              'active:scale-[0.97]',
              isActive
                ? 'bg-[#1B3A32] text-[#E3B341] shadow-[0_2px_10px_rgba(0,0,0,0.12)]'
                : 'text-[#5C736C]',
            ].join(' ')}
          >
            {item.label}
          </button>
        );
      })}
    </div>
  );
}

export default PeriodTabs;