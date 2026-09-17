import Chart from 'react-apexcharts';
import { useChartAutoScroll } from '../hooks/useChartAutoScroll';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

function getChartLayout(period, dataLength) {
  if (period === 'monthly' || period === 'weekly') {
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

export default function IncomeExpenseChart({ data = [], period = 'weekly' }) {
  const categories = data.map((item) => item.label);
  const income = data.map((item) => item.income || 0);
  const expense = data.map((item) => item.expense || 0);

  const { shouldScroll, chartWidth } = getChartLayout(period, data.length);
  const scrollRef = useChartAutoScroll(data, period, shouldScroll);

  const isMonthly = period === 'monthly';

  const options = {
    chart: {
      // فقط ماهانه bar، بقیه area
      type: isMonthly ? 'bar' : 'area',
      toolbar: { show: false },
      zoom: { enabled: false },
      background: 'transparent',
      fontFamily: 'Vazirmatn, sans-serif',
      parentHeightOffset: 0,
      redrawOnParentResize: false,
      redrawOnWindowResize: false,
    },
    colors: ['#4FD1BE', '#E2574C'],

    // استایل مخصوص area (هفتگی و سالانه)
    ...(!isMonthly && {
      stroke: { curve: 'smooth', width: 2.2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.26,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
    }),

    // استایل مخصوص bar (فقط ماهانه)
    ...(isMonthly && {
      plotOptions: {
        bar: {
          borderRadius: 2,
          columnWidth: '70%',
          borderRadiusApplication: 'end',
        },
      },
    }),

    dataLabels: { enabled: false },
    xaxis: {
      categories,
      tickAmount: data.length > 1 ? data.length - 1 : 1,
      labels: {
        rotate: isMonthly ? -60 : 0,
        rotateAlways: isMonthly,
        hideOverlappingLabels: false,
        trim: false,
        style: {
          colors: '#5C736C',
          fontSize: isMonthly ? '7px' : '10px',
          fontFamily: 'Vazirmatn, sans-serif',
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: '#5C736C',
          fontSize: '9px',
          fontFamily: 'Vazirmatn, sans-serif',
        },
        formatter: (value) => formatNumber(value),
      },
    },
    grid: {
      borderColor: 'rgba(242,239,233,0.06)',
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
      fontSize: '11px',
      labels: { colors: '#8FA39D' },
      markers: { width: 7, height: 7, radius: 10 },
      itemMargin: { horizontal: 8 },
    },
  };

  const series = [
    { name: 'درآمد', data: income },
    { name: 'مصرف', data: expense },
  ];

  const height = isMonthly ? 300 : 250;

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
            key={`${period}-${data.length}-${shouldScroll}`}
            options={options}
            series={series}
            type={isMonthly ? 'bar' : 'area'}
            height={height}
            width="100%"
          />
        </div>
      </div>
    </div>
  );
}