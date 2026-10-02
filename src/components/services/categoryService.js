// ============================================================
// Category Service — i18n-aware
// ============================================================

import db from '../db/database';
import i18n from '../../i18n';
import { MEMBER_ID } from '../utils/constants';

const t = (key, opts = {}) => i18n.t(key, opts);

export async function getCategories(type) {
  let categories = await db.categories.toArray();

  if (type) {
    categories = categories.filter((category) => category.type === type);
  }

  return categories.sort(
    (a, b) => (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0),
  );
}

export async function getCategoryById(id) {
  if (!id) return null;
  return db.categories.get(id);
}

export async function createCategory({
  name,
  type,
  icon = 'Circle',
  color,
  memberId = MEMBER_ID,
}) {
  const cleanName = name?.trim();

  if (!cleanName) {
    throw new Error(t('errors.categoryNameEmpty'));
  }
  if (!['income', 'expense'].includes(type)) {
    throw new Error(t('errors.categoryTypeInvalid'));
  }

  const categories = await getCategories(type);

  const existing = categories.find(
    (category) =>
      category.memberId === memberId &&
      category.name.trim().toLowerCase() === cleanName.toLowerCase(),
  );
  if (existing) throw new Error(t('errors.categoryNameExists'));

  const maxSortOrder = categories.reduce(
    (max, category) => Math.max(max, Number(category.sortOrder) || 0),
    0,
  );

  const now = Date.now();

  const category = {
    id: `${type}-${crypto.randomUUID()}`,
    memberId,
    type,
    name: cleanName,
    icon,
    color: color || (type === 'income' ? '#00D1A7' : '#F43F5E'),
    isDefault: false,
    sortOrder: maxSortOrder + 1,
    placeholder:
      type === 'income'
        ? 'توضیح این درآمد...'
        : 'توضیح این مصرف...',
    createdAt: now,
    updatedAt: now,
  };

  await db.categories.add(category);
  return category;
}

export async function deleteCategory(id) {
  const category = await db.categories.get(id);

  if (!category) throw new Error(t('errors.categoryNotFound'));
  if (category.isDefault) throw new Error(t('errors.categoryDefaultNotDeletable'));

  const count = await db.transactions.where('categoryId').equals(id).count();

  if (count > 0) {
    throw new Error(t('errors.categoryInUse', { count }));
  }

  await db.categories.delete(id);
  return true;
}