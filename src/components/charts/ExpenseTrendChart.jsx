import Chart from 'react-apexcharts';
import { useChartAutoScroll } from '../hooks/useChartAutoScroll';
import { useIsDesktop } from '../hooks/useIsDesktop';

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

export default function ExpenseTrendChart({
  data = [],
  period = 'weekly',
  fixedHeight,
}) {
  const isDesktop = useIsDesktop();

  const categories = data.map((item) => item.label);
  const expense = data.map((item) => item.expense || 0);

  const { shouldScroll, chartWidth } = getChartLayout(period, data.length);
  const scrollRef = useChartAutoScroll(data, period, shouldScroll);

  const isMonthly = period === 'monthly';

  const options = {
    chart: {
      type: isMonthly ? 'bar' : 'area',
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
    colors: ['#E2574C'],

    ...(!isMonthly && {
      stroke: { curve: 'smooth', width: 2.2 },
      fill: {
        type: 'gradient',
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.32,
          opacityTo: 0.02,
          stops: [0, 90, 100],
        },
      },
    }),

    ...(isMonthly && {
      plotOptions: {
        bar: {
          borderRadius: 2,
          columnWidth: '80%',
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
          fontSize: isMonthly
            ? isDesktop
              ? '10px'
              : '7px'
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
          colors: '#5C736C',
          fontSize: isDesktop ? '11px' : '9px',
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
  };

  const series = [{ name: 'مصرف', data: expense }];

  const height =
    fixedHeight ||
    (isDesktop
      ? isMonthly
        ? 400
        : 320
      : isMonthly
        ? 300
        : 230);

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
            key={`${period}-${data.length}-${shouldScroll}-${isDesktop}-${fixedHeight || 'auto'}`}
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