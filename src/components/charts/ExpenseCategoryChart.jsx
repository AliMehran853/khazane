import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

import { prepareCategoryChartData } from '../utils/categoryPalette';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useCurrencyLabel } from '../hooks/useCurrencyLabel';
import { useAppStore } from '../store/appStore';
import { getChartTheme } from '../utils/chartTheme';
import { formatNumber } from '../utils/formatting';

export default function ExpenseCategoryChart({ categories = [], fixedHeight }) {
  const { t } = useTranslation();
  const currencyLabel = useCurrencyLabel();
  const isDesktop = useIsDesktop();
  const theme = useAppStore((s) => s.theme);

  const prepared = prepareCategoryChartData(categories);
  const tChart = getChartTheme();

  const labels = prepared.map((c) => c.name);
  const values = prepared.map((c) => c.total || 0);
  const colors = prepared.map((c) => c.color);

  const options = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: tChart.fontFamily,
      parentHeightOffset: 0,
      animations: {
        enabled: true,
        speed: 900,
        animateGradually: { enabled: false },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    labels,
    colors,
    legend: {
      show: true,
      position: 'bottom',
      horizontalAlign: 'center',
      fontFamily: tChart.fontFamily,
      fontSize: isDesktop ? '13px' : '11px',
      labels: { colors: tChart.text2 },
      markers: { width: 8, height: 8, radius: 10 },
      itemMargin: { horizontal: isDesktop ? 12 : 6, vertical: 2 },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      colors: [tChart.isLight ? 'rgba(15,23,42,0.08)' : 'rgba(15,23,42,0.6)'],
    },
    plotOptions: {
      pie: {
        donut: {
          size: '68%',
          labels: {
            show: true,
            name: {
              show: true,
              fontSize: isDesktop ? '14px' : '12px',
              color: tChart.text2,
              fontFamily: tChart.fontFamily,
            },
            value: {
              show: true,
              fontSize: isDesktop ? '24px' : '18px',
              fontWeight: 800,
              color: tChart.isLight ? '#0f172a' : '#f8fafc',
              fontFamily: tChart.fontFamily,
              formatter: (val) => formatNumber(val),
            },
            total: {
              show: true,
              label: t('charts.total'),
              fontSize: isDesktop ? '14px' : '12px',
              color: tChart.text2,
              fontFamily: tChart.fontFamily,
              formatter: (w) => {
                const sum = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                return formatNumber(sum);
              },
            },
          },
        },
      },
    },
    tooltip: {
      theme: tChart.isLight ? 'light' : 'dark',
      rtl: tChart.isRTL,
      y: {
        formatter: (value) => `${formatNumber(value)} ${currencyLabel}`,
      },
    },
  };

  const height = fixedHeight || (isDesktop ? 360 : 260);

  return (
    <div className="kh-chart-box" key={theme}>
      <Chart
        key={`donut-${isDesktop}-${fixedHeight || 'auto'}-${theme}-${currencyLabel}`}
        options={options}
        series={values}
        type="donut"
        height={height}
      />
    </div>
  );
}