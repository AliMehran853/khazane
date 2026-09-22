import Chart from 'react-apexcharts';

import { useChartAutoScroll } from '../hooks/useChartAutoScroll';
import { useIsDesktop } from '../hooks/useIsDesktop';
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

export default function IncomeTrendChart({
  data = [],
  period = 'weekly',
  periodOffset = 0,
  fixedHeight,
}) {
  const isDesktop = useIsDesktop();
  const theme = useAppStore((s) => s.theme);
  const t = getChartTheme();

  const categories = data.map((item) => item.label);
  const isDaily = period === 'daily';
  const isMonthly = period === 'monthly';
  const isBar = isDaily || isMonthly;

  const { shouldScroll, chartWidth } = getChartLayout(period, data.length);
  const scrollRef = useChartAutoScroll(data, period, shouldScroll);

  const incomeDim = alpha(t.income, 0.3);

  const series = [
    {
      name: 'درآمد',
      data: isDaily
        ? data.map((item) => ({
            x: item.label,
            y: item.income || 0,
            fillColor: item.isCurrent ? t.income : incomeDim,
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
      fontFamily: t.fontFamily,
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
    colors: [t.income],

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
          colors: t.text3,
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
          fontFamily: t.fontFamily,
        },
      },
      axisBorder: { show: false },
      axisTicks: { show: false },
    },
    yaxis: {
      labels: {
        style: {
          colors: t.text3,
          fontSize: isDesktop ? '11px' : '9px',
          fontFamily: t.fontFamily,
        },
        formatter: (value) => formatNumber(value),
      },
    },
    grid: {
      borderColor: t.grid,
      strokeDashArray: 4,
      xaxis: { lines: { show: false } },
      padding: { left: 2, right: 2 },
    },
    tooltip: {
      theme: t.isLight ? 'light' : 'dark',
      rtl: true,
      y: { formatter: (value) => `${formatNumber(value)} افغانی` },
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
            key={`inc-${period}-${periodOffset}-${data.length}-${shouldScroll}-${isDesktop}-${fixedHeight || 'auto'}-${theme}`}
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