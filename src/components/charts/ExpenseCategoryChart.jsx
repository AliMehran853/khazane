import Chart from 'react-apexcharts';

import { prepareCategoryChartData } from '../utils/categoryPalette';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { useAppStore } from '../store/appStore';
import { getChartTheme } from '../utils/chartTheme';
import { formatNumber } from '../utils/formatting';

export default function ExpenseCategoryChart({ categories = [], fixedHeight }) {
  const isDesktop = useIsDesktop();
  const theme = useAppStore((s) => s.theme);

  const prepared = prepareCategoryChartData(categories);
  const t = getChartTheme();

  const labels = prepared.map((c) => c.name);
  const values = prepared.map((c) => c.total || 0);
  const colors = prepared.map((c) => c.color);

  const options = {
    chart: {
      type: 'donut',
      background: 'transparent',
      fontFamily: t.fontFamily,
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
      fontFamily: t.fontFamily,
      fontSize: isDesktop ? '13px' : '11px',
      labels: { colors: t.text2 },
      markers: { width: 8, height: 8, radius: 10 },
      itemMargin: { horizontal: isDesktop ? 12 : 6, vertical: 2 },
    },
    dataLabels: { enabled: false },
    stroke: {
      width: 2,
      colors: [t.isLight ? 'rgba(15,23,42,0.08)' : 'rgba(15,23,42,0.6)'],
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
              color: t.text2,
              fontFamily: t.fontFamily,
            },
            value: {
              show: true,
              fontSize: isDesktop ? '24px' : '18px',
              fontWeight: 800,
              color: t.isLight ? '#0f172a' : '#f8fafc',
              fontFamily: t.fontFamily,
              formatter: (val) => formatNumber(val),
            },
            total: {
              show: true,
              label: 'مجموع',
              fontSize: isDesktop ? '14px' : '12px',
              color: t.text2,
              fontFamily: t.fontFamily,
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
      theme: t.isLight ? 'light' : 'dark',
      rtl: true,
      y: { formatter: (value) => `${formatNumber(value)} افغانی` },
    },
  };

  const height = fixedHeight || (isDesktop ? 360 : 260);

  return (
    <div className="kh-chart-box" key={theme}>
      <Chart
        key={`donut-${isDesktop}-${fixedHeight || 'auto'}-${theme}`}
        options={options}
        series={values}
        type="donut"
        height={height}
      />
    </div>
  );
}