// ============================================================
// پالت مشترک برای رنگ‌دهی به دسته‌بندی‌ها
// ============================================================

export const CATEGORY_PALETTE = [
  '#E2574C', // قرمز-مرجانی
  '#4FD1BE', // فیروزه‌ای
  '#E3B341', // طلایی
  '#9B7BE0', // بنفش ملایم
  '#5B9BD5', // آبی
  '#5C736C', // خاکستری برای «سایر»
];

// چند دسته‌ی برتر مستقیم نشان داده شوند
export const CATEGORY_TOP_COUNT = 5;

/**
 * دسته‌ها را برای نمایش آماده می‌کند:
 * - اگر تعداد ≤ TOP_COUNT باشد: همه با رنگ‌های متفاوت
 * - اگر بیشتر باشد: TOP_COUNT دسته‌ی اول + یک برش «سایر»
 */
export function prepareCategoryChartData(categories = []) {
  const sorted = [...categories].sort(
    (a, b) => (b.total || 0) - (a.total || 0)
  );

  if (sorted.length <= CATEGORY_TOP_COUNT) {
    return sorted.map((c, index) => ({
      id: c.id,
      name: c.name,
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
      name: c.name,
      total: c.total || 0,
      color: CATEGORY_PALETTE[index],
    })),
    {
      id: '__other__',
      name: 'سایر',
      total: otherTotal,
      color: CATEGORY_PALETTE[CATEGORY_TOP_COUNT],
    },
  ];
}