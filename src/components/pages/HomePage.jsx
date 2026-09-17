import { useEffect, useState } from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  FileText,
  WalletCards,
} from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import StatCard from '../common/StatCard';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import BalanceHero from '../dashboard/BalanceHero';
import RecentTransactions from '../dashboard/RecentTransactions';
import TransactionItem from '../transactions/TransactionItem';

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

  const { summary, trend, recentTransactions, loading } = useAnalytics({
    period,
  });

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

  const Header = (
    <header className="flex items-start justify-between gap-3">
      <div>
        <p className="text-[11px] font-medium text-[#5C736C] lg:text-[12px]">
          مدیریت مالی شخصی
        </p>
        <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9] lg:text-[26px]">
          خزانه
        </h1>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={handleExportPDF}
          disabled={exporting}
          className="
            flex h-11 shrink-0 items-center gap-2 rounded-2xl
            border border-white/[0.06] bg-[#0F211E] px-3.5
            text-[11.5px] font-semibold text-[#E3B341]
            active:scale-95 disabled:opacity-40
            lg:h-10 lg:text-[12px]
          "
          aria-label="خروجی PDF ترکیبی"
        >
          <FileText size={17} strokeWidth={1.9} />
          {exporting ? '...' : 'PDF'}
        </button>

        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-[#0F211E] text-[#E3B341] lg:h-10 lg:w-10">
          <WalletCards size={20} strokeWidth={1.9} />
        </div>
      </div>
    </header>
  );

  return (
    <div className="px-4 pb-6 pt-6 lg:px-0 lg:pt-8">
      {Header}

      {/* ============================================ */}
      {/* موبایل — تک‌ستونی، دست‌نخورده               */}
      {/* ============================================ */}
      <div className="lg:hidden">
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
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F2EFE9]">روند مالی</h2>
            <span className="text-[10.5px] text-[#5C736C]">
              {periodLabels[period]}
            </span>
          </div>
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
          limit={5}
        />
      </div>

      {/* ============================================ */}
      {/* دسکتاپ — چیدمان حرفه‌ای                      */}
      {/* ============================================ */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        {/* ⭐ ردیف بالا: 1/4 راست (Stats + Tabs) + 3/4 چپ (BalanceHero) */}
        <div className="grid grid-cols-12 items-stretch gap-4">
          {/* راست 1/4 — کارت‌های آماری + تب‌ها */}
          <div className="col-span-4 flex flex-col gap-3">
            <div className="grid flex-1 grid-cols-2 gap-3">
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
            </div>

            <PeriodTabs forceTabs />
          </div>

          {/* چپ 3/4 — کارت موجودی */}
          <div className="col-span-8">
            <BalanceHero
              summary={summary}
              period={period}
              variant="desktop"
            />
          </div>
        </div>

        {/* ⭐ ردیف پایین: گراف (راست) + تراکنش‌ها (چپ) */}
        <div className="grid grid-cols-12 gap-4">
          {/* گراف */}
          <div className="col-span-8">
            <div className="flex h-[480px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-[16px] font-bold text-[#F2EFE9]">
                  روند مالی
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
                  <IncomeExpenseChart
                    data={trend}
                    period={period}
                    fixedHeight={400}
                  />
                )}
              </div>
            </div>
          </div>

          {/* تراکنش‌های اخیر */}
          <div className="col-span-4">
            <div className="flex h-[480px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-[15px] font-bold text-[#F2EFE9]">
                  تراکنش‌های اخیر
                </h2>
                <span className="text-[11px] text-[#5C736C]">
                  {formatNumber(recentTransactions.length)} تراکنش
                </span>
              </div>

              <div className="mx-5 h-px shrink-0 bg-white/[0.06]" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                {recentTransactions.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <p className="text-[13px] font-semibold text-[#8FA39D]">
                        هنوز تراکنشی ثبت نشده است
                      </p>
                      <p className="mt-1 text-[11px] text-[#5C736C]">
                        از دکمه‌ی + در سایدبار یا گوشه استفاده کن.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {recentTransactions.map((t) => (
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

export default HomePage;