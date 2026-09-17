import { useEffect, useState } from 'react';
import { ArrowDownLeft, FileText } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import StatCard from '../common/StatCard';
import IncomeTrendChart from '../charts/IncomeTrendChart';
import TransactionItem from '../transactions/TransactionItem';
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

  const Header = (
    <header className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] text-[#5C736C] lg:text-[12px]">
          مدیریت درآمد
        </p>
        <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9] lg:text-[26px]">
          درآمد
        </h1>
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
          lg:h-10 lg:text-[12px]
        "
      >
        <FileText size={17} strokeWidth={1.9} />
        {exporting ? 'صبر...' : 'PDF'}
      </button>
    </header>
  );

  return (
    <div className="px-4 pb-6 pt-6 lg:px-0 lg:pt-8">
      {Header}

      {/* ============================================ */}
      {/* موبایل — تک‌ستونی، دست‌نخورده               */}
      {/* ============================================ */}
      <div className="lg:hidden">
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
            <span className="text-[11px] text-[#5C736C]">
              {periodLabels[period]}
            </span>
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

      {/* ============================================ */}
      {/* دسکتاپ — چیدمان حرفه‌ای                      */}
      {/* ============================================ */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        {/* ⭐ ردیف: فیلتر (راست) + کارت کل درآمد (چپ) */}
        <div className="flex items-stretch gap-4">
          <div className="w-[230px] shrink-0">
            <PeriodTabs />
          </div>

          <div className="flex-1">
            <StatCard
              title={`کل درآمد ${periodLabels[period]}`}
              value={formatNumber(summary.income)}
              icon={ArrowDownLeft}
              tone="income"
              featured
            />
          </div>
        </div>

        {/* ⭐ ردیف پایین: گراف (راست) + تراکنش‌ها (چپ) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <div className="flex h-[480px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-[16px] font-bold text-[#F2EFE9]">
                  روند درآمد
                </h2>
                <span className="text-[12px] text-[#5C736C]">
                  {periodLabels[period]}
                </span>
              </div>

              <div className="min-h-0 flex-1 px-2 pb-2">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-[13px] text-[#5C736C]">
                    در حال بارگذاری...
                  </div>
                ) : (
                  <IncomeTrendChart
                    data={trend}
                    period={period}
                    fixedHeight={400}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="flex h-[480px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-[15px] font-bold text-[#F2EFE9]">
                  آخرین درآمدها
                </h2>
                <span className="text-[11px] text-[#5C736C]">
                  {formatNumber(transactions.length)} مورد
                </span>
              </div>

              <div className="mx-5 h-px shrink-0 bg-white/[0.06]" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <p className="text-[13px] font-semibold text-[#8FA39D]">
                        هنوز درآمدی ثبت نشده است
                      </p>
                      <p className="mt-1 text-[11px] text-[#5C736C]">
                        از دکمه‌ی + در سایدبار یا گوشه استفاده کن.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {transactions.map((t) => (
                      <TransactionItem
                        key={t.id}
                        transaction={t}
                        category={categoriesMap[t.categoryId]}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default IncomePage;