import Chart from 'react-apexcharts';
import { useChartAutoScroll } from '../hooks/useChartAutoScroll';
import { useIsDesktop } from '../hooks/useIsDesktop';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

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

const INCOME_COLOR = '#00D1A7';
const INCOME_DIM = 'rgba(0, 209, 167, 0.30)';
const EXPENSE_COLOR = '#F43F5E';
const EXPENSE_DIM = 'rgba(244, 63, 94, 0.30)';

export default function IncomeExpenseChart({
  data = [],
  period = 'weekly',
  periodOffset = 0,
  fixedHeight,
}) {
  const isDesktop = useIsDesktop();

  const categories = data.map((item) => item.label);

  const isDaily = period === 'daily';
  const isMonthly = period === 'monthly';
  const isBar = isDaily || isMonthly;

  const { shouldScroll, chartWidth } = getChartLayout(period, data.length);
  const scrollRef = useChartAutoScroll(data, period, shouldScroll);

  let series;
  if (isDaily) {
    series = [
      {
        name: 'درآمد',
        data: data.map((item) => ({
          x: item.label,
          y: item.income || 0,
          fillColor: item.isCurrent ? INCOME_COLOR : INCOME_DIM,
        })),
      },
      {
        name: 'مصرف',
        data: data.map((item) => ({
          x: item.label,
          y: item.expense || 0,
          fillColor: item.isCurrent ? EXPENSE_COLOR : EXPENSE_DIM,
        })),
      },
    ];
  } else {
    series = [
      { name: 'درآمد', data: data.map((item) => item.income || 0) },
      { name: 'مصرف', data: data.map((item) => item.expense || 0) },
    ];
  }

  const options = {
    chart: {
      type: isBar ? 'bar' : 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      fontFamily: 'Vazirmatn, sans-serif',
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
    colors: [INCOME_COLOR, EXPENSE_COLOR],

    ...(!isBar && {
      stroke: { curve: 'smooth', width: 2.2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.28,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
    }),

    ...(isBar && {
      plotOptions: {
        bar: {
          borderRadius: 3,
          columnWidth: isDaily ? '65%' : '70%',
          borderRadiusApplication: 'end',
        },
      },
    }),

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
          colors: '#64748B',
          fontSize: isMonthly
            ? isDesktop
              ? '10px'
              : '7px'
            : isDaily
              ? isDesktop
                ? '11px'
                : '9px'
              : isDesktop
                ? '12px'
                : '10px',
          fontFamily: 'Vazirmatn, sans-serif',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#64748B',
          fontSize: isDesktop ? '11px' : '9px',
          fontFamily: 'Vazirmatn, sans-serif',
        },
        formatter: (value) => formatNumber(value),
      },
    },
    grid: {
      borderColor: 'rgba(248,250,252,0.08)',
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 2, right: 2 },
    },
    tooltip: {
      theme: 'dark',
      rtl: true,
      y: { formatter: (value) => `${formatNumber(value)} افغانی` },
    },
    legend: {
      show: true,
      position: 'top',
      horizontalAlign: 'right',
      fontFamily: 'Vazirmatn, sans-serif',
      fontSize: isDesktop ? '13px' : '11px',
      labels: { colors: '#94A3B8' },
      markers: { width: 7, height: 7, radius: 10 },
      itemMargin: { horizontal: 8 },
    },
  };

  const height =
    fixedHeight ||
    (isDesktop
      ? isBar
        ? 400
        : 340
      : isBar
        ? 300
        : 250);

  return (
    <div className="w-full px-1 pt-1" dir="rtl">
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
            key={`${period}-${periodOffset}-${data.length}-${shouldScroll}-${isDesktop}-${fixedHeight || 'auto'}`}
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