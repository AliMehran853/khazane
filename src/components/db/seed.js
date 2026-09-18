import db from './database';

const defaultCategories = [
  // ---------------------------------------------------------
  // Income
  // ---------------------------------------------------------
  {
    id: 'salary',
    memberId: 'self',
    type: 'income',
    name: 'معاش',
    icon: 'WalletCards',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 1,
    placeholder: 'مثلاً معاش این ماه',
  },
  {
    id: 'business',
    memberId: 'self',
    type: 'income',
    name: 'کار و تجارت',
    icon: 'BriefcaseBusiness',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 2,
    placeholder: 'مثلاً فروش اجناس، درآمد دکان',
  },
  {
    id: 'freelance',
    memberId: 'self',
    type: 'income',
    name: 'فریلنس',
    icon: 'Laptop',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 3,
    placeholder: 'مثلاً پروژه‌ی طراحی، ترجمه، برنامه‌نویسی',
  },
  {
    id: 'gift-income',
    memberId: 'self',
    type: 'income',
    name: 'هدیه',
    icon: 'Gift',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 4,
    placeholder: 'از طرف چه کسی، به چه مناسبتی',
  },
  {
    id: 'investment-income',
    memberId: 'self',
    type: 'income',
    name: 'سود سرمایه',
    icon: 'TrendingUp',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 5,
    placeholder: 'سود بانکی، سود فروش ملک',
  },
  {
    id: 'other-income',
    memberId: 'self',
    type: 'income',
    name: 'سایر درآمدها',
    icon: 'CircleDollarSign',
    color: '#4FD1BE',
    isDefault: true,
    sortOrder: 6,
    placeholder: 'توضیح این درآمد...',
  },
  // ---------------------------------------------------------
  // Expense
  // ---------------------------------------------------------
  {
    id: 'food',
    memberId: 'self',
    type: 'expense',
    name: 'خوراک',
    icon: 'Utensils',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 1,
    placeholder: 'مثلاً نهار برنج، شام، صبحانه',
  },
  {
    id: 'transport',
    memberId: 'self',
    type: 'expense',
    name: 'کرایه موتر',
    icon: 'CarFront',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 2,
    placeholder: 'کرایه، پطرول، پارکینگ',
  },
  {
    id: 'housing',
    memberId: 'self',
    type: 'expense',
    name: 'خانه',
    icon: 'House',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 3,
    placeholder: 'کرایه خانه، تعمیرات، برق',
  },
  {
    id: 'bills',
    memberId: 'self',
    type: 'expense',
    name: 'قبض‌ها',
    icon: 'ReceiptText',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 4,
    placeholder: 'برق، آب، انترنت، موبایل',
  },
  {
    id: 'shopping',
    memberId: 'self',
    type: 'expense',
    name: 'خرید',
    icon: 'ShoppingBag',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 5,
    placeholder: 'لباس، لوازم خانه، موبایل',
  },
  {
    id: 'health',
    memberId: 'self',
    type: 'expense',
    name: 'سلامتی',
    icon: 'HeartPulse',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 6,
    placeholder: 'دوا، دکتر، آزمایش',
  },
  {
    id: 'education',
    memberId: 'self',
    type: 'expense',
    name: 'تحصیل',
    icon: 'GraduationCap',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 7,
    placeholder: 'فیس، کتاب، کورس',
  },
  {
    id: 'other-expense',
    memberId: 'self',
    type: 'expense',
    name: 'سایر مصارف',
    icon: 'MoreHorizontal',
    color: '#E2574C',
    isDefault: true,
    sortOrder: 8,
    placeholder: 'توضیح این مصرف...',
  },
];

const defaultSettings = [
  { key: 'currency', value: 'AFN' },
  { key: 'currencyLabel', value: 'افغانی' },
  { key: 'locale', value: 'fa-AF' },
  { key: 'memberId', value: 'self' },
  { key: 'userName', value: '' },
  { key: 'defaultPeriod', value: 'weekly' },
  { key: 'lockEnabled', value: false },
  { key: 'pinEnabled', value: false },
  { key: 'biometricEnabled', value: false },
  { key: 'reminderEnabled', value: false },
  { key: 'reminderTime', value: '21:00' },
  { key: 'onboardingCompleted', value: false },
];

export async function seedDatabase() {
  const now = Date.now();

  await db.transaction(
    'rw',
    db.categories,
    db.settings,
    async () => {
      const categoryCount = await db.categories.count();

      if (categoryCount === 0) {
        await db.categories.bulkAdd(
          defaultCategories.map((category) => ({
            ...category,
            createdAt: now,
            updatedAt: now,
          })),
        );
      }

      for (const setting of defaultSettings) {
        const existing = await db.settings.get(setting.key);
        if (!existing) {
          await db.settings.add({
            key: setting.key,
            value: setting.value,
            updatedAt: now,
          });
        }
      }
    },
  );
}