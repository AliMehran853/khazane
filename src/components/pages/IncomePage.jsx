import { useEffect, useState } from 'react';
import { ArrowDownLeft, FileText } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import StatCard from '../common/StatCard';
import IncomeTrendChart from '../charts/IncomeTrendChart';
import TransactionList from '../transactions/TransactionList';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { exportTransactionsToPDF } from '../services/exportService';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

const periodLabels = {
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

function IncomePage() {
  const period = useAppStore((s) => s.period);
  const dataVersion = useAppStore((s) => s.dataVersion);

  const { summary, trend, loading } = useAnalytics({ period, type: 'income' });

  const [transactions, setTransactions] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [txs, cats] = await Promise.all([
        getTransactions({ type: 'income' }),
        getCategories('income'),
      ]);
      if (cancelled) return;

      setTransactions(txs);
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
  }, [dataVersion, period]);

  async function handleExportPDF() {
    if (transactions.length === 0) return;

    setExporting(true);
    try {
      await exportTransactionsToPDF({
        transactions,
        categoriesMap,
        title: 'گزارش درآمدها',
        periodLabel: periodLabels[period],
        totalIncome: summary.income,
        totalExpense: 0,
        currency: 'افغانی',
        showSummary: true,
        fileName: `khazane-income-${period}.pdf`,
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
          <p className="text-[11px] text-[#5C736C]">مدیریت درآمد</p>
          <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9]">درآمد</h1>
        </div>

        <button
          type="button"
          onClick={handleExportPDF}
          disabled={exporting || transactions.length === 0}
          className="
            flex h-11 shrink-0 items-center gap-2 rounded-2xl
            border border-white/[0.06] bg-[#0F211E] px-3.5
            text-[11.5px] font-semibold text-[#E3B341]
            active:scale-95 disabled:opacity-40
          "
        >
          <FileText size={17} strokeWidth={1.9} />
          {exporting ? 'صبر...' : 'PDF'}
        </button>
      </header>

      <div className="mt-6">
        <PeriodTabs />
      </div>

      <section className="mt-4">
        <StatCard
          title={`کل درآمد ${periodLabels[period]}`}
          value={formatNumber(summary.income)}
          icon={ArrowDownLeft}
          tone="income"
          featured
        />
      </section>

      <section className="mt-6">
        <div className="flex items-center justify-between">
          <h2 className="text-[15px] font-bold text-[#F2EFE9]">روند درآمد</h2>
          <span className="text-[11px] text-[#5C736C]">{periodLabels[period]}</span>
        </div>

        <div className="mt-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E] py-3">
          {loading ? (
            <div className="flex h-[230px] items-center justify-center text-[12px] text-[#5C736C]">
              در حال بارگذاری...
            </div>
          ) : (
            <IncomeTrendChart data={trend} period={period} />
          )}
        </div>
      </section>

      <section className="mt-6">
        <h2 className="text-[15px] font-bold text-[#F2EFE9]">آخرین درآمدها</h2>
        <div className="mt-3">
          <TransactionList
            transactions={transactions}
            categoriesMap={categoriesMap}
            emptyTitle="هنوز درآمدی ثبت نشده است"
            emptyHint="از دکمه + برای ثبت اولین درآمد استفاده کن."
          />
        </div>
      </section>
    </div>
  );
}

export default IncomePage;