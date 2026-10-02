import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowDownLeft, FileText, Search } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import PeriodTabs from '../common/PeriodTabs';
import PeriodNavigator from '../common/PeriodNavigator';
import StatCard from '../common/StatCard';
import IncomeTrendChart from '../charts/IncomeTrendChart';
import SummaryModal from '../dashboard/SummaryModal';
import TransactionItem from '../transactions/TransactionItem';
import TransactionList from '../transactions/TransactionList';

import { useAppStore } from '../store/appStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePageData } from '../hooks/usePageData';
import { useCurrencyLabel } from '../hooks/useCurrencyLabel';
import { exportTransactionsToPDF } from '../services/exportService';
import { getPeriodOffsetLabel } from '../utils/dates';
import { formatNumber } from '../utils/formatting';
import { ROUTES } from '../utils/constants';

function IncomePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const currencyLabel = useCurrencyLabel();

  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);

  const { summary, trend, comparison, loading } = useAnalytics({
    period,
    type: 'income',
    periodOffset,
  });

  const { transactions, categoriesMap } = usePageData({
    type: 'income',
    period,
    periodOffset,
  });

  const [exporting, setExporting] = useState(false);
  const [summaryOpen, setSummaryOpen] = useState(false);

  async function handleExportPDF() {
    if (transactions.length === 0) return;
    setExporting(true);
    try {
      await exportTransactionsToPDF({
        transactions,
        categoriesMap,
        title: t('pdf.incomeReport'),
        periodLabel: getPeriodOffsetLabel(period, periodOffset),
        totalIncome: summary.income,
        totalExpense: 0,
        currencyLabel,
        showSummary: true,
        fileName: `khazane-income-${period}.pdf`,
      });
    } catch (err) {
      console.error(err);
      alert(err?.message || t('errors.exportPdfFailed'));
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

  return (
    <div className="px-4 pb-6 pt-6 lg:px-0 lg:pt-8">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="kh-page-subtitle">{t('nav.income')}</p>
          <h1 className="kh-page-title">{t('nav.income')}</h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate(ROUTES.search)}
            aria-label={t('common.search')}
            className="glass kh-header-icon-btn"
          >
            <Search size={18} strokeWidth={1.9} />
          </button>

          <button
            type="button"
            onClick={handleExportPDF}
            disabled={exporting || transactions.length === 0}
            className="glass flex h-11 shrink-0 items-center gap-2 rounded-2xl px-3.5 text-xs font-semibold text-primary transition-all hover:border-primary/30 active:scale-95 disabled:opacity-40 lg:h-10 lg:text-sm"
          >
            <FileText size={17} strokeWidth={1.9} />
            {exporting ? '...' : 'PDF'}
          </button>
        </div>
      </header>

      <div className="lg:hidden">
        <div className="mt-6">
          <PeriodTabs />
        </div>
        <div className="mt-3">
          <PeriodNavigator />
        </div>

        <section className="mt-4">
          <StatCard
            title={t('balance.balanceOf', {
              period: getPeriodOffsetLabel(period, periodOffset),
            })}
            value={formatNumber(summary.income)}
            icon={ArrowDownLeft}
            tone="income"
            featured
            change={incomeChange}
            onClick={() => setSummaryOpen(true)}
            clickHint={t('balance.clickForSummary')}
          />
        </section>

        <section className="mt-6">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-fg-1">
              {t('charts.incomeTrend')}
            </h2>
            <span className="text-xs text-fg-3">
              {getPeriodOffsetLabel(period, periodOffset)}
            </span>
          </div>
          <div className="glass mt-3 overflow-hidden rounded-3xl py-3">
            {loading ? (
              <div className="flex h-[230px] items-center justify-center text-sm text-fg-3">
                {t('common.loading')}
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
          <h2 className="text-lg font-bold text-fg-1">
            {t('transaction.recent')}
          </h2>
          <div className="mt-3">
            <TransactionList
              transactions={transactions.slice(0, 8)}
              categoriesMap={categoriesMap}
              emptyTitle={t('transaction.noIncomeInPeriod')}
              emptyHint={t('transaction.noIncomeHint')}
            />
          </div>
        </section>
      </div>

      {/* Desktop */}
      <div className="hidden lg:mt-6 lg:block lg:space-y-4">
        <div className="flex items-stretch gap-4">
          <div className="w-[230px] shrink-0 flex flex-col gap-3">
            <PeriodTabs />
            <PeriodNavigator />
          </div>

          <div className="flex-1">
            <StatCard
              title={t('balance.balanceOf', {
                period: getPeriodOffsetLabel(period, periodOffset),
              })}
              value={formatNumber(summary.income)}
              icon={ArrowDownLeft}
              tone="income"
              featured
              fillHeight
              change={incomeChange}
              onClick={() => setSummaryOpen(true)}
              clickHint={t('balance.clickForSummary')}
            />
          </div>
        </div>

        <div className="grid grid-cols-12 gap-4">
          <div className="col-span-8">
            <div className="glass flex h-[480px] flex-col overflow-hidden rounded-3xl">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-2">
                <h2 className="text-xl font-bold text-fg-1">
                  {t('charts.incomeTrend')}
                </h2>
                <span className="text-sm text-fg-3">
                  {getPeriodOffsetLabel(period, periodOffset)}
                </span>
              </div>

              <div className="min-h-0 flex-1 px-2 pb-2">
                {loading ? (
                  <div className="flex h-full items-center justify-center text-base text-fg-3">
                    {t('common.loading')}
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
            <div className="glass flex h-[480px] flex-col overflow-hidden rounded-3xl">
              <div className="flex shrink-0 items-center justify-between px-5 pt-4 pb-3">
                <h2 className="text-lg font-bold text-fg-1">
                  {t('transaction.recent')}
                </h2>
                <span className="text-xs text-fg-3">
                  {t('transaction.itemCount', {
                    count: formatNumber(transactions.length),
                  })}
                </span>
              </div>

              <div className="mx-5 h-px shrink-0 bg-border-1" />

              <div className="min-h-0 flex-1 overflow-y-auto">
                {transactions.length === 0 ? (
                  <div className="flex h-full items-center justify-center px-4 text-center">
                    <div>
                      <p className="text-base font-semibold text-fg-2">
                        {t('transaction.noIncomeInPeriod')}
                      </p>
                      <p className="mt-1 text-xs text-fg-3">
                        {t('transaction.sidebarHint')}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div>
                    {transactions.map((tx, index) => (
                      <div
                        key={tx.id}
                        className="tx-list-item"
                        style={{
                          contentVisibility: index >= 10 ? 'auto' : 'visible',
                        }}
                      >
                        <TransactionItem
                          transaction={tx}
                          category={categoriesMap[tx.categoryId]}
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