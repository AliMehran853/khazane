import { useEffect, useState } from 'react';
import { ArrowUpRight, FileText } from 'lucide-react';

import PeriodTabs from '../common/PeriodTabs';
import StatCard from '../common/StatCard';
import ExpenseTrendChart from '../charts/ExpenseTrendChart';
import ExpenseCategoryChart from '../charts/ExpenseCategoryChart';
import TransactionItem from '../transactions/TransactionItem';
import TransactionList from '../transactions/TransactionList';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { prepareCategoryChartData } from '../utils/categoryPalette';
import { exportTransactionsToPDF } from '../services/exportService';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

const periodLabels = {
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

function ExpensesPage() {
  const period = useAppStore((s) => s.period);
  const dataVersion = useAppStore((s) => s.dataVersion);

  const {
    summary,
    trend,
    categories: categorySummary,
    loading,
  } = useAnalytics({ period, type: 'expense' });

  const [transactions, setTransactions] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      const [txs, cats] = await Promise.all([
        getTransactions({ type: 'expense' }),
        getCategories('expense'),
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

  const preparedCategories = prepareCategoryChartData(categorySummary);
  const maxTotal = Math.max(...preparedCategories.map((c) => c.total || 0), 1);

  async function handleExportPDF() {
    if (transactions.length === 0) return;

    setExporting(true);
    try {
      await exportTransactionsToPDF({
        transactions,
        categoriesMap,
        title: 'گزارش مصارف',
        periodLabel: periodLabels[period],
        totalIncome: 0,
        totalExpense: summary.expense,
        currency: 'افغانی',
        showSummary: true,
        fileName: `khazane-expenses-${period}.pdf`,
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
          مدیریت هزینه‌ها
        </p>
        <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9] lg:text-[26px]">
          مصارف
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
            title={`کل مصارف ${periodLabels[period]}`}
            value={formatNumber(summary.expense)}
            icon={ArrowUpRight}
            tone="expense"
            featured
          />
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F2EFE9]">روند مصارف</h2>
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
              <ExpenseTrendChart data={trend} period={period} />
            )}
          </div>
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[15px] font-bold text-[#F2EFE9]">
              دسته‌بندی مصارف
            </h2>
            <span className="text-[11px] text-[#5C736C]">
              {periodLabels[period]}
            </span>
          </div>
          <div className="mt-3 overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E] py-3">
            {loading ? (
              <div className="flex h-[260px] items-center justify-center text-[12px] text-[#5C736C]">
                در حال بارگذاری...
              </div>
            ) : categorySummary.length === 0 ? (
              <div className="flex h-[220px] items-center justify-center text-center">
                <div>
                  <p className="text-[13px] font-semibold text-[#8FA39D]">
                    هنوز مصرفی ثبت نشده است
                  </p>
                  <p className="mt-1 text-[11px] text-[#5C736C]">
                    نمودار دسته‌بندی بعد از ثبت مصارف نمایش داده می‌شود.
                  </p>
                </div>
              </div>
            ) : (
              <ExpenseCategoryChart categories={categorySummary} />
            )}
          </div>
        </section>

        {preparedCategories.length > 0 && (
          <section className="mt-6">
            <h2 className="text-[15px] font-bold text-[#F2EFE9]">دسته‌ها</h2>

            <div className="mt-3 space-y-3 rounded-[24px] border border-white/[0.06] bg-[#0F211E] p-4">
              {preparedCategories.map((cat) => {
                const percent = maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
                return (
                  <div key={cat.id}>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[12px] font-semibold text-[#F2EFE9]">
                        {cat.name}
                      </span>
                      <span
                        className="text-[11px] font-bold"
                        style={{ color: cat.color }}
                      >
                        {formatNumber(cat.total)}
                      </span>
                    </div>

                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${percent}%`,
                          background: cat.color,
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        <section className="mt-6">
          <h2 className="text-[15px] font-bold text-[#F2EFE9]">آخرین مصارف</h2>
          <div className="mt-3">
            <TransactionList
              transactions={transactions}
              categoriesMap={categoriesMap}
              emptyTitle="هنوز مصرفی ثبت نشده است"
              emptyHint="از دکمه + برای ثبت اولین مصرف استفاده کن."
            />
          </div>
        </section>
      </div>

      {/* ============================================ */}
      {/* دسکتاپ — چیدمان حرفه‌ای                      */}
      {/* ============================================ */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        {/* ⭐ ردیف بالا: فیلتر (راست) + کارت کل مصارف (چپ) */}
        <div className="flex items-stretch gap-4">
          <div className="w-[230px] shrink-0">
            <PeriodTabs />
          </div>

          <div className="flex-1">
            <StatCard
              title={`کل مصارف ${periodLabels[period]}`}
              value={formatNumber(summary.expense)}
              icon={ArrowUpRight}
              tone="expense"
              featured
            />
          </div>
        </div>

        {/* ⭐ ردیف وسط: روند (راست) + دونات (چپ) */}
        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-7">
            <div className="flex h-[440px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-[16px] font-bold text-[#F2EFE9]">
                  روند مصارف
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
                  <ExpenseTrendChart
                    data={trend}
                    period={period}
                    fixedHeight={360}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="col-span-5">
            <div className="flex h-[440px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-[16px] font-bold text-[#F2EFE9]">
                  دسته‌بندی مصارف
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
                ) : categorySummary.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <p className="text-[13px] font-semibold text-[#8FA39D]">
                        هنوز مصرفی ثبت نشده است
                      </p>
                      <p className="mt-1 text-[11px] text-[#5C736C]">
                        نمودار دسته‌بندی بعد از ثبت مصارف نمایش داده می‌شود.
                      </p>
                    </div>
                  </div>
                ) : (
                  <ExpenseCategoryChart
                    categories={categorySummary}
                    fixedHeight={360}
                  />
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ⭐ ردیف پایین: دسته‌ها (راست) + تراکنش‌ها (چپ) */}
        <div className="grid grid-cols-12 gap-4">
          {preparedCategories.length > 0 && (
            <div className="col-span-5">
              <div className="flex h-[440px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
                <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                  <h2 className="text-[15px] font-bold text-[#F2EFE9]">
                    دسته‌ها
                  </h2>
                  <span className="text-[11px] text-[#5C736C]">
                    {formatNumber(preparedCategories.length)} دسته
                  </span>
                </div>

                <div className="mx-5 h-px shrink-0 bg-white/[0.06]" />

                <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
                  <div className="space-y-3.5">
                    {preparedCategories.map((cat) => {
                      const percent =
                        maxTotal > 0 ? (cat.total / maxTotal) * 100 : 0;
                      return (
                        <div key={cat.id}>
                          <div className="mb-1.5 flex items-center justify-between">
                            <span className="text-[12.5px] font-semibold text-[#F2EFE9]">
                              {cat.name}
                            </span>
                            <span
                              className="text-[11.5px] font-bold"
                              style={{ color: cat.color }}
                            >
                              {formatNumber(cat.total)}
                            </span>
                          </div>

                          <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/[0.06]">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${percent}%`,
                                background: cat.color,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div
            className={
              preparedCategories.length > 0 ? 'col-span-7' : 'col-span-12'
            }
          >
            <div className="flex h-[440px] flex-col overflow-hidden rounded-[24px] border border-white/[0.06] bg-[#0F211E]">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-[15px] font-bold text-[#F2EFE9]">
                  آخرین مصارف
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
                        هنوز مصرفی ثبت نشده است
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

export default ExpensesPage;