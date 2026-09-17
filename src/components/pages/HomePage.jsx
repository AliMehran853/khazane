import { useEffect, useState } from 'react';
import { ArrowDownLeft, ArrowUpRight, FileText, WalletCards } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import StatCard from '../common/StatCard';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import BalanceHero from '../dashboard/BalanceHero';
import RecentTransactions from '../dashboard/RecentTransactions';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { getCategories } from '../services/categoryService';
import { getTransactions } from '../services/transactionService';
import { exportTransactionsToPDF } from '../services/exportService';
import { getRange } from '../utils/dates';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

const periodLabels = {
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

function HomePage() {
  const period = useAppStore((s) => s.period);
  const dataVersion = useAppStore((s) => s.dataVersion);

  const { summary, trend, recentTransactions, loading } = useAnalytics({ period });

  const [categoriesMap, setCategoriesMap] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      const cats = await getCategories();
      if (cancelled) return;
      const map = {};
      cats.forEach((c) => {
        map[c.id] = c;
      });
      setCategoriesMap(map);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  // ⭐ خروجی PDF ترکیبی (درآمد + مصرف) برای دوره‌ی جاری
  async function handleExportPDF() {
    setExporting(true);
    try {
      const { start, end } = getRange(period);
      const all = await getTransactions();

      const inPeriod = all.filter((t) => {
        const d = new Date(t.date);
        return d >= start && d <= end;
      });

      if (inPeriod.length === 0) {
        alert('در این دوره تراکنشی ثبت نشده است.');
        return;
      }

      await exportTransactionsToPDF({
        transactions: inPeriod,
        categoriesMap,
        title: 'گزارش کامل مالی',
        periodLabel: periodLabels[period],
        totalIncome: summary.income,
        totalExpense: summary.expense,
        currency: 'افغانی',
        showSummary: true,
        fileName: `khazane-full-${period}.pdf`,
      });
    } catch (err) {
      console.error(err);
      alert(err?.message || 'خروجی PDF ناموفق بود.');
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className="px-4 pb-6 pt-6">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[11px] font-medium text-[#5C736C]">مدیریت مالی شخصی</p>
          <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9]">خزانه</h1>
        </div>

        <div className="flex items-center gap-2">
          {/* ⭐ دکمه PDF ترکیبی */}
          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            className="
              flex h-11 shrink-0 items-center gap-2 rounded-2xl
              border border-white/[0.06] bg-[#0F211E] px-3.5
              text-[11.5px] font-semibold text-[#E3B341]
              active:scale-95 disabled:opacity-40
            "
            aria-label="خروجی PDF ترکیبی"
          >
            <FileText size={17} strokeWidth={1.9} />
            {exporting ? '...' : 'PDF'}
          </button>

          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0F211E] text-[#E3B341]">
            <WalletCards size={20} strokeWidth={1.9} />
          </div>
        </div>
      </header>

      <BalanceHero summary={summary} period={period} />

      <section className="mt-6">
        <PeriodTabs />
      </section>

      <section className="mt-4 grid grid-cols-2 gap-3">
        <StatCard
          title="کل درآمد"
          value={formatNumber(summary.income)}
          icon={ArrowDownLeft}
          tone="income"
        />
        <StatCard
          title="کل مصرف"
          value={formatNumber(summary.expense)}
          icon={ArrowUpRight}
          tone="expense"
        />
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-bold text-[#F2EFE9]">روند مالی</h2>
        <p className="mt-1 text-[10.5px] text-[#5C736C]">{periodLabels[period]}</p>
        <div className="mt-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E] py-3">
          {loading ? (
            <div className="flex h-[250px] items-center justify-center text-[12px] text-[#5C736C]">
              در حال بارگذاری...
            </div>
          ) : (
            <IncomeExpenseChart data={trend} period={period} />
          )}
        </div>
      </section>

      <RecentTransactions
        transactions={recentTransactions}
        categoriesMap={categoriesMap}
      />
    </div>
  );
}

export default HomePage;