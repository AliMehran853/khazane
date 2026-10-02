// ============================================================
// Category name helper — i18n-aware
// Location: src/components/utils/categories.js
// ============================================================

import i18n from '../../i18n';

/**
 * نام دسته را بر اساس کلید ترجمه یا نام اصلی برمی‌گرداند.
 * - اگر دسته nameKey داشته باشد → از i18n می‌خواند
 * - اگر ترجمه پیدا نشد → به name اصلی برمی‌گردد (برای دسته‌های کاربر)
 */
export function getCategoryName(category) {
  if (!category) return '';
  if (category.nameKey) {
    const translated = i18n.t(category.nameKey);
    if (translated && translated !== category.nameKey) return translated;
  }
  return category.name || '';
}

/**
 * Placeholder پیش‌فرض هر دسته
 */
export function getCategoryPlaceholder(category, fallbackKey) {
  if (category?.placeholderKey) {
    const translated = i18n.t(category.placeholderKey);
    if (translated && translated !== category.placeholderKey) return translated;
  }
  if (category?.placeholder) return category.placeholder;
  return fallbackKey ? i18n.t(fallbackKey) : '';
}