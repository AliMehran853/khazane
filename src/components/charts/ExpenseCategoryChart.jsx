import Chart from 'react-apexcharts';
import { prepareCategoryChartData } from '../utils/categoryPalette';
import { useIsDesktop } from '../hooks/useIsDesktop';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

export default function ExpenseCategoryChart({ categories = [], fixedHeight }) {
  const isDesktop = useIsDesktop();

  const prepared = prepareCategoryChartData(categories);

  const labels = prepared.map((c) => c.name);
  const values = prepared.map((c) => c.total || 0);
  const colors = prepared.map((c) => c.color);

  const options = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: 'Vazirmatn, sans-serif',
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
      fontFamily: 'Vazirmatn, sans-serif',
      fontSize: isDesktop ? '13px' : '11px',
      labels: { colors: '#94A3B8' },
      markers: { width: 8, height: 8, radius: 10 },
      itemMargin: { horizontal: isDesktop ? 12 : 6, vertical: 2 },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      colors: ['rgba(15,23,42,0.6)'],
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
              color: '#94A3B8',
              fontFamily: 'Vazirmatn, sans-serif',
            },
            value: {
              show: true,
              fontSize: isDesktop ? '24px' : '18px',
              fontWeight: 800,
              color: '#F8FAFC',
              fontFamily: 'Vazirmatn, sans-serif',
              formatter: (val) => formatNumber(val),
            },
            total: {
              show: true,
              label: 'مجموع',
              fontSize: isDesktop ? '14px' : '12px',
              color: '#94A3B8',
              fontFamily: 'Vazirmatn, sans-serif',
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
      theme: 'dark',
      rtl: true,
      y: { formatter: (value) => `${formatNumber(value)} افغانی` },
    },
  };

  const height = fixedHeight || (isDesktop ? 360 : 260);

  return (
    <div className="w-full px-1 pt-1" dir="rtl">
      <Chart
        key={`donut-${isDesktop}-${fixedHeight || 'auto'}`}
        options={options}
        series={values}
        type="donut"
        height={height}
      />
    </div>
  );
}