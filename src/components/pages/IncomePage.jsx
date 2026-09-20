import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, FileText, Search } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import PeriodNavigator from '../common/PeriodNavigator';
import StatCard from '../common/StatCard';
import IncomeTrendChart from '../charts/IncomeTrendChart';
import SummaryModal from '../dashboard/SummaryModal';
import TransactionItem from '../transactions/TransactionItem';
import TransactionList from '../transactions/TransactionList';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { exportTransactionsToPDF } from '../services/exportService';
import { getPeriodRange, getPeriodOffsetLabel } from '../utils/dates';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

function IncomePage() {
  const navigate = useNavigate();

  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);
  const dataVersion = useAppStore((s) => s.dataVersion);

  const { summary, trend, comparison, loading } = useAnalytics({
    period,
    type: 'income',
    periodOffset,
  });

  const [transactions, setTransactions] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [exporting, setExporting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const range = getPeriodRange(period, periodOffset);

      const [txs, cats] = await Promise.all([
        getTransactions({
          type: 'income',
          startDate: range.start,
          endDate: range.end,
        }),
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
  }, [dataVersion, period, periodOffset]);

  async function handleExportPDF() {
    if (transactions.length === 0) return;

    setExporting(true);
    try {
      await exportTransactionsToPDF({
        transactions,
        categoriesMap,
        title: 'گزارش درآمدها',
        periodLabel: getPeriodOffsetLabel(period, periodOffset),
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

  const incomeChange = comparison
    ? {
        current: comparison.current.income,
        previous: comparison.previous.income,
      }
    : null;

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

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate('/search')}
          aria-label="جستجو"
          className="
            flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl
            border border-white/[0.06] bg-[#0F211E] text-[#8FA39D]
            transition-colors hover:text-[#E3B341]
            active:scale-95
            lg:h-10 lg:w-10
          "
        >
          <Search size={18} strokeWidth={1.9} />
        </button>

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
      </div>
    </header>
  );

  return (
    <div className="px-4 pb-6 pt-6 lg:px-0 lg:pt-8">
      {Header}

      {/* موبایل */}
      <div className="lg:hidden">
        <div className="mt-6">
          <PeriodTabs />
        </div>

        <div className="mt-3">
          <PeriodNavigator />
        </div>

        <section className="mt-4">
          <StatCard
            title={`کل درآمد ${getPeriodOffsetLabel(period, periodOffset)}`}
            value={formatNumber(summary.income)}
            icon={ArrowDownLeft}
            tone="income"
            featured
            change={incomeChange}
            onClick={() => setSummaryOpen(true)}
            clickHint="برای خلاصه‌ی همه‌ی دوره‌ها کلیک کن"
          />
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F2EFE9]">روند درآمد</h2>
            <span className="text-[11px] text-[#5C736C]">
              {getPeriodOffsetLabel(period, periodOffset)}
            </span>
          </div>

          <div className="mt-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E] py-3">
            {loading ? (
              <div className="flex h-[230px] items-center justify-center text-[12px] text-[#5C736C]">
                در حال بارگذاری...
              </div>
            ) : (
              <IncomeTrendChart
                data={trend}
                period={period}
                periodOffset={periodOffset}
              />
            )}
          </div>
        </section>

        <section className="mt-6">
          <h2 className="text-[15px] font-bold text-[#F2EFE9]">آخرین درآمدها</h2>
          <div className="mt-3">
            <TransactionList
              transactions={transactions.slice(0, 8)}
              categoriesMap={categoriesMap}
              emptyTitle="در این دوره درآمدی ثبت نشده است"
              emptyHint="از دکمه + برای ثبت درآمد استفاده کن."
            />
          </div>
        </section>
      </div>

      {/* دسکتاپ */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        <div className="flex items-stretch gap-4">
          <div className="w-[230px] shrink-0 flex flex-col gap-3">
            <PeriodTabs />
            <PeriodNavigator />
          </div>

          <div className="flex-1">
            <StatCard
              title={`کل درآمد ${getPeriodOffsetLabel(period, periodOffset)}`}
              value={formatNumber(summary.income)}
              icon={ArrowDownLeft}
              tone="income"
              featured
              fillHeight
              change={incomeChange}
              onClick={() => setSummaryOpen(true)}
              clickHint="برای خلاصه‌ی همه‌ی دوره‌ها کلیک کن"
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <div className="flex h-[480px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-[16px] font-bold text-[#F2EFE9]">
                  روند درآمد
                </h2>
                <span className="text-[12px] text-[#5C736C]">
                  {getPeriodOffsetLabel(period, periodOffset)}
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
                    periodOffset={periodOffset}
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
                        در این دوره درآمدی ثبت نشده است
                      </p>
                      <p className="mt-1 text-[11px] text-[#5C736C]">
                        از دکمه‌ی + در سایدبار استفاده کن.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {transactions.map((t, index) => (
                      <div
                        key={t.id}
                        className="tx-list-item"
                        style={{
                          contentVisibility:
                            index >= 10 ? 'auto' : 'visible',
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
        mode="income"
      />
    </div>
  );
}

export default IncomePage;