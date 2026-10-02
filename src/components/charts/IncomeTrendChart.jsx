import Chart from 'react-apexcharts';
import { useTranslation } from 'react-i18next';

import { useChartAutoScroll } from '../hooks/useChartAutoScroll';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useCurrencyLabel } from '../hooks/useCurrencyLabel';
import { useAppStore } from '../store/appStore';
import { getChartTheme, alpha } from '../utils/chartTheme';
import { formatNumber } from '../utils/formatting';

function getChartLayout(period, dataLength) {
  if (period === 'daily' || period === 'monthly' || period === 'weekly') {
    return { shouldScroll: false, chartWidth: null };
  }
  const columnWidth = 72;
  const visibleCount = 5;
  const shouldScroll = dataLength > visibleCount;
  return {
    shouldScroll,
    chartWidth: shouldScroll ? dataLength * columnWidth : null,
  };
}

function getAxisLabel(label, isDesktop) {
  if (isDesktop || !label) return label;
  if (/^[A-Za-z]/.test(label) && label.length > 3) {
    return label.slice(0, 3);
  }
  return label;
}

export default function IncomeTrendChart({
  data = [],
  period = 'weekly',
  periodOffset = 0,
  fixedHeight,
}) {
  const { t } = useTranslation();
  const currencyLabel = useCurrencyLabel();
  const isDesktop = useIsDesktop();
  const theme = useAppStore((s) => s.theme);
  const tChart = getChartTheme();

  const categories = data.map((item) => getAxisLabel(item.label, isDesktop));
  const isDaily = period === 'daily';
  const isMonthly = period === 'monthly';
  const isBar = isDaily || isMonthly;

  const { shouldScroll, chartWidth } = getChartLayout(period, data.length);
  const scrollRef = useChartAutoScroll(data, period, shouldScroll);

  const incomeDim = alpha(tChart.income, 0.3);
  const incomeLabel = t('charts.income');

  const series = [
    {
      name: incomeLabel,
      data: isDaily
        ? data.map((item) => ({
            x: getAxisLabel(item.label, isDesktop),
            y: item.income || 0,
            fillColor: item.isCurrent ? tChart.income : incomeDim,
          }))
        : data.map((item) => item.income || 0),
    },
  ];

  const options = {
    chart: {
      type: isBar ? 'bar' : 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      fontFamily: tChart.fontFamily,
      parentHeightOffset: 0,
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
      animations: {
        enabled: true,
        speed: 900,
        animateGradually: { enabled: false },
        dynamicAnimation: { enabled: true, speed: 350 },
      },
    },
    colors: [tChart.income],

    ...(!isBar && {
      stroke: { curve: 'smooth', width: 2.2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.35,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
    }),

    ...(isBar && {
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: isDaily ? '55%' : '80%',
          borderRadiusApplication: 'end',
        },
      },
    }),

    legend: { show: false },
    dataLabels: { enabled: false },
    xaxis: {
      ...(isDaily ? { type: 'category' } : { categories }),
      tickAmount: data.length > 1 ? data.length - 1 : 1,
      labels: {
        rotate: isMonthly ? -60 : 0,
        rotateAlways: isMonthly,
        hideOverlappingLabels: false,
        trim: false,
        style: {
          colors: tChart.text3,
          fontSize: isMonthly
            ? isDesktop
              ? '10px'
              : '8px'
            : isDaily
              ? isDesktop
                ? '11px'
                : '9px'
              : isDesktop
                ? '12px'
                : '10px',
          fontFamily: tChart.fontFamily,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: tChart.text3,
          fontSize: isDesktop ? '11px' : '9px',
          fontFamily: tChart.fontFamily,
        },
        formatter: (value) => formatNumber(value),
      },
    },
    grid: {
      borderColor: tChart.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 2, right: 2 },
    },
    tooltip: {
      theme: tChart.isLight ? 'light' : 'dark',
      rtl: tChart.isRTL,
      y: { formatter: (value) => `${formatNumber(value)} ${currencyLabel}` },
    },
  };

  const height =
    fixedHeight ||
    (isDesktop ? (isBar ? 400 : 320) : isBar ? 280 : 230);

  return (
    <div className="kh-chart-box">
      <div
        ref={scrollRef}
        className={shouldScroll ? 'overflow-x-auto overflow-y-hidden pb-1' : ''}
        style={shouldScroll ? { WebkitOverflowScrolling: 'touch' } : undefined}
      >
        <div
          style={
            shouldScroll
              ? { width: `${chartWidth}px`, minWidth: `${chartWidth}px` }
              : { width: '100%' }
          }
        >
          <Chart
            key={`inc-${period}-${periodOffset}-${data.length}-${shouldScroll}-${isDesktop}-${fixedHeight || 'auto'}-${theme}-${currencyLabel}`}
            options={options}
            series={series}
            type={isBar ? 'bar' : 'area'}
            height={height}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}