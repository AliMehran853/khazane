import db from '../db/database';

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
  memberId = 'self',
}) {
  const cleanName = name?.trim();

  if (!cleanName) {
    throw new Error('نام دسته‌بندی الزامی است.');
  }

  if (!['income', 'expense'].includes(type)) {
    throw new Error('نوع دسته‌بندی نامعتبر است.');
  }

  const categories = await getCategories(type);

  const existing = categories.find(
    (category) =>
      category.memberId === memberId &&
      category.name.trim().toLowerCase() === cleanName.toLowerCase(),
  );

  if (existing) {
    throw new Error('این دسته‌بندی از قبل وجود دارد.');
  }

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
    color: color || (type === 'income' ? '#4FD1BE' : '#E2574C'),
    isDefault: false,
    sortOrder: maxSortOrder + 1,
    // ⭐ placeholder پیش‌فرض برای دسته‌های ساخت کاربر
    placeholder:
      type === 'income' ? 'توضیح این درآمد...' : 'توضیح این مصرف...',
    createdAt: now,
    updatedAt: now,
  };

  await db.categories.add(category);

  return category;
}

export async function deleteCategory(id) {
  const category = await db.categories.get(id);

  if (!category) {
    throw new Error('دسته پیدا نشد.');
  }

  if (category.isDefault) {
    throw new Error('دسته‌های پیش‌فرض قابل حذف نیستند.');
  }

  const count = await db.transactions
    .where('categoryId')
    .equals(id)
    .count();

  if (count > 0) {
    throw new Error(
      `این دسته در ${count} تراکنش استفاده شده و قابل حذف نیست.`,
    );
  }

  await db.categories.delete(id);
  return true;
}