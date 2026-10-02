import i18n from '../../i18n';
import { getCategoryName } from './categories';

export const CATEGORY_PALETTE = [
  '#00D1A7',
  '#F43F5E',
  '#3B82F6',
  '#8B5CF6',
  '#F59E0B',
  '#64748B',
];

export const CATEGORY_TOP_COUNT = 5;

export function prepareCategoryChartData(categories = []) {
  const sorted = [...categories].sort(
    (a, b) => (b.total || 0) - (a.total || 0),
  );

  if (sorted.length <= CATEGORY_TOP_COUNT) {
    return sorted.map((c, index) => ({
      id: c.id,
      name: getCategoryName(c) || c.name,
      total: c.total || 0,
      color: CATEGORY_PALETTE[index % CATEGORY_PALETTE.length],
    }));
  }

  const top = sorted.slice(0, CATEGORY_TOP_COUNT);
  const rest = sorted.slice(CATEGORY_TOP_COUNT);
  const otherTotal = rest.reduce((sum, c) => sum + (c.total || 0), 0);

  return [
    ...top.map((c, index) => ({
      id: c.id,
      name: getCategoryName(c) || c.name,
      total: c.total || 0,
      color: CATEGORY_PALETTE[index],
    })),
    {
      id: '__other__',
      name: i18n.t('charts.other'),
      total: otherTotal,
      color: CATEGORY_PALETTE[CATEGORY_TOP_COUNT],
    },
  ];
}