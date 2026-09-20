// ============================================================
// پالت مشترک برای رنگ‌دهی به دسته‌بندی‌ها
// هماهنگ با تم فیروزه‌ای/رز اپ
// ============================================================

export const CATEGORY_PALETTE = [
  '#00D1A7', // فیروزه‌ای (اصلی)
  '#F43F5E', // رز-سرخ (مصرف)
  '#3B82F6', // آبی
  '#8B5CF6', // بنفش
  '#F59E0B', // نارنجی/انبر
  '#64748B', // خاکستری برای «سایر»
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
    (a, b) => (b.total || 0) - (a.total || 0),
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