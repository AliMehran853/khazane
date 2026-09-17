import { ArrowDownLeft, ArrowUpRight } from 'lucide-react';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

const periodLabels = {
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

export default function BalanceHero({ summary, period = 'weekly' }) {
  return (
    <section className="mt-7 rounded-[26px] border border-white/[0.06] bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)] p-5">
      <p className="text-[12px] text-[#8FA39D]">
        موجودی {periodLabels[period] || ''}
      </p>

      <p className="mt-2 text-[32px] font-extrabold tracking-tight text-[#F2EFE9]">
        {formatNumber(summary.balance)}
      </p>

      <p className="text-[11px] text-[#5C736C]">افغانی</p>

      <div className="mt-5 h-px bg-white/[0.06]" />

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-[#4FD1BE]/[0.07] p-3">
          <div className="flex items-center gap-2">
            <ArrowDownLeft size={16} className="text-[#4FD1BE]" />
            <span className="text-[11px] text-[#8FA39D]">درآمد</span>
          </div>
          <p className="mt-2 text-[17px] font-extrabold text-[#4FD1BE]">
            {formatNumber(summary.income)}
          </p>
        </div>

        <div className="rounded-2xl bg-[#E2574C]/[0.07] p-3">
          <div className="flex items-center gap-2">
            <ArrowUpRight size={16} className="text-[#E2574C]" />
            <span className="text-[11px] text-[#8FA39D]">مصرف</span>
          </div>
          <p className="mt-2 text-[17px] font-extrabold text-[#E2574C]">
            {formatNumber(summary.expense)}
          </p>
        </div>
      </div>
    </section>
  );
}