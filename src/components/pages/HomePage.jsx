import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Moon, Search, Sun } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import PeriodNavigator from '../common/PeriodNavigator';
import IncomeExpenseChart from '../charts/IncomeExpenseChart';
import BalanceHero from '../dashboard/BalanceHero';
import RecentTransactions from '../dashboard/RecentTransactions';
import SummaryModal from '../dashboard/SummaryModal';
import TransactionItem from '../transactions/TransactionItem';
import { SkeletonChart, SkeletonList } from '../common/Skeleton';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { getCategories } from '../services/categoryService';
import { getTransactions } from '../services/transactionService';
import { exportTransactionsToPDF } from '../services/exportService';
import { getPeriodRange, getPeriodOffsetLabel } from '../utils/dates';
import { formatNumber } from '../utils/formatting';
import { ROUTES } from '../utils/constants';

function HomePage() {
  const navigate = useNavigate();

  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);
  const dataVersion = useAppStore((s) => s.dataVersion);
  const theme = useAppStore((s) => s.theme);
  const toggleTheme = useAppStore((s) => s.toggleTheme);

  const { summary, trend, recentTransactions, comparison, loading } =
    useAnalytics({ period, periodOffset });

  const [categoriesMap, setCategoriesMap] = useState({});
  const [exporting, setExporting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

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
      const { start, end } = getPeriodRange(period, periodOffset);
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
        periodLabel: getPeriodOffsetLabel(period, periodOffset),
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
    <div className="px-4 pb-6 pt-6 lg:px-0 lg:pt-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="kh-page-subtitle">مدیریت مالی شخصی</p>
          <h1 className="kh-page-title">خزانه</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.search)}
            aria-label="جستجو"
            className="glass kh-header-icon-btn"
          >
            <Search size={18} strokeWidth={1.9} />
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting}
            aria-label="خروجی PDF ترکیبی"
            className="glass flex h-11 shrink-0 items-center gap-2 rounded-2xl px-3.5 text-xs font-semibold text-primary transition-all hover:border-primary/30 active:scale-95 disabled:opacity-40 lg:h-10 lg:text-sm"
          >
            <FileText size={17} strokeWidth={1.9} />
            {exporting ? '...' : 'PDF'}
          </button>

          <button
            type="button"
            onClick={toggleTheme}
            aria-label={theme === 'dark' ? 'حالت روشن' : 'حالت تاریک'}
            className="glass kh-header-icon-btn text-primary"
          >
            {theme === 'dark' ? (
              <Sun size={18} strokeWidth={1.9} />
            ) : (
              <Moon size={18} strokeWidth={1.9} />
            )}
          </button>
        </div>
      </header>

      {/* Mobile */}
      <div className="lg:hidden">
        <section className="mt-6">
          <PeriodTabs />
        </section>

        <section className="mt-3">
          <PeriodNavigator />
        </section>

        <BalanceHero
          summary={summary}
          period={period}
          periodOffset={periodOffset}
          comparison={comparison}
          onOpenSummary={() => setSummaryOpen(true)}
        />

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-fg-1">روند مالی</h2>
            <span className="text-2xs text-fg-3">
              {getPeriodOffsetLabel(period, periodOffset)}
            </span>
          </div>
          <div className="glass mt-3 overflow-hidden rounded-3xl py-3">
            {loading ? (
              <SkeletonChart height={250} />
            ) : (
              <IncomeExpenseChart
                data={trend}
                period={period}
                periodOffset={periodOffset}
              />
            )}
          </div>
        </section>

        {loading ? (
          <section className="mt-6">
            <h2 className="mb-3 text-lg font-bold text-fg-1">
              تراکنش‌های اخیر
            </h2>
            <SkeletonList rows={4} />
          </section>
        ) : (
          <RecentTransactions
            transactions={recentTransactions}
            categoriesMap={categoriesMap}
            limit={5}
            showNavigateButton={false}
          />
        )}
      </div>

      {/* Desktop */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        <div className="grid grid-cols-12 items-stretch gap-4">
          <div className="col-span-4 flex flex-col gap-3">
            <PeriodTabs forceTabs />
            <PeriodNavigator />
          </div>

          <div className="col-span-4">
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="glass flex h-full w-full flex-col justify-center rounded-3xl p-5 text-right transition-all hover:border-primary/30 active:scale-[0.99] lg:p-6"
            >
              <p className="text-xs font-medium text-fg-3 lg:text-sm">
                خلاصه‌ی همه‌ی دوره‌ها
              </p>
              <p className="mt-2 text-lg font-extrabold text-primary lg:text-xl">
                امروز، هفته، ماه، سال، همه
              </p>
              <p className="mt-1 text-2xs text-fg-3">
                برای مشاهده کلیک کنید
              </p>
            </button>
          </div>

          <div className="col-span-4">
            <button
              type="button"
              onClick={() => setSummaryOpen(true)}
              className="glass-strong flex h-full w-full flex-col justify-center rounded-3xl border-primary/20 p-5 text-right transition-all active:scale-[0.99] lg:p-6"
            >
              <p className="text-xs font-medium text-fg-2 lg:text-sm">
                موجودی از ابتدا
              </p>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-fg-1 lg:text-3xl">
                {formatNumber(summary.balance)}
              </p>
              <p className="mt-1 text-2xs text-fg-3">افغانی</p>
            </button>
          </div>
        </div>

        <BalanceHero
          summary={summary}
          period={period}
          periodOffset={periodOffset}
          comparison={comparison}
          variant="desktop"
        />

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <div className="glass flex h-[480px] flex-col overflow-hidden rounded-3xl">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-xl font-bold text-fg-1">روند مالی</h2>
                <span className="text-sm text-fg-3">
                  {getPeriodOffsetLabel(period, periodOffset)}
                </span>
              </div>

              <div className="min-h-0 flex-1 px-2 pb-2">
                {loading ? (
                  <SkeletonChart height={400} />
                ) : (
                  <IncomeExpenseChart
                    data={trend}
                    period={period}
                    periodOffset={periodOffset}
                    fixedHeight={400}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-4">
            <div className="glass flex h-[480px] flex-col overflow-hidden rounded-3xl">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-lg font-bold text-fg-1">
                  تراکنش‌های اخیر
                </h2>
                <span className="text-xs text-fg-3">
                  {formatNumber(recentTransactions.length)} تراکنش
                </span>
              </div>

              <div className="mx-5 h-px shrink-0 bg-border-1" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                {loading ? (
                  <SkeletonList rows={6} />
                ) : recentTransactions.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <p className="text-base font-semibold text-fg-2">
                        هنوز تراکنشی ثبت نشده است
                      </p>
                      <p className="mt-1 text-xs text-fg-3">
                        از دکمه‌ی + در سایدبار استفاده کن.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {recentTransactions.slice(0, 10).map((t, index) => (
                      <div
                        key={t.id}
                        className="tx-list-item"
                        style={{
                          contentVisibility: index >= 8 ? 'auto' : 'visible',
                        }}
                      >
                        <TransactionItem
                          transaction={t}
                          category={categoriesMap[t.categoryId]}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <SummaryModal
        open={summaryOpen}
        onClose={() => setSummaryOpen(false)}
      />
    </div>
  );
}

export default HomePage;