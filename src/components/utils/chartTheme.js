// ============================================================
// Chart theme — reads CSS tokens so ApexCharts respects theme
// ============================================================

const FALLBACK = {
  income: '#00d1a7',
  expense: '#f43f5e',
  text2: '#94a3b8',
  text3: '#64748b',
  grid: 'rgba(248,250,252,0.08)',
  tooltipBg: '#113035',
  tooltipText: '#f8fafc',
  fontFamily: 'Vazirmatn, sans-serif',
  isLight: false,
};

export function getChartTheme() {
  if (typeof document === 'undefined') return FALLBACK;

  const root = getComputedStyle(document.documentElement);
  const get = (name) => root.getPropertyValue(name).trim();

  return {
    income: get('--kh-primary') || FALLBACK.income,
    expense: get('--kh-expense') || FALLBACK.expense,
    text2: get('--kh-text-2') || FALLBACK.text2,
    text3: get('--kh-text-3') || FALLBACK.text3,
    grid: get('--kh-chart-grid') || FALLBACK.grid,
    tooltipBg: get('--kh-chart-tooltip-bg') || FALLBACK.tooltipBg,
    tooltipText: get('--kh-chart-tooltip-text') || FALLBACK.tooltipText,
    fontFamily: 'Vazirmatn, sans-serif',
    isLight: document.documentElement.getAttribute('data-theme') === 'light',
  };
}

export function alpha(color, a) {
  return `color-mix(in oklab, ${color} ${Math.round(a * 100)}%, transparent)`;
}