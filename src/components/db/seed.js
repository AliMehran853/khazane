import db from './database';
import i18n from '../../i18n';

const t = (key) => i18n.t(key);

function buildDefaultCategories() {
  const now = Date.now();

  const income = [
    {
      id: 'salary',
      nameKey: 'categories.salary',
      placeholderKey: 'categories.salaryPlaceholder',
      icon: 'WalletCards',
      color: '#4FD1BE',
      sortOrder: 1,
    },
    {
      id: 'business',
      nameKey: 'categories.business',
      placeholderKey: 'categories.businessPlaceholder',
      icon: 'BriefcaseBusiness',
      color: '#4FD1BE',
      sortOrder: 2,
    },
    {
      id: 'freelance',
      nameKey: 'categories.freelance',
      placeholderKey: 'categories.freelancePlaceholder',
      icon: 'Laptop',
      color: '#4FD1BE',
      sortOrder: 3,
    },
    {
      id: 'gift-income',
      nameKey: 'categories.giftIncome',
      placeholderKey: 'categories.giftIncomePlaceholder',
      icon: 'Gift',
      color: '#4FD1BE',
      sortOrder: 4,
    },
    {
      id: 'investment-income',
      nameKey: 'categories.investment',
      placeholderKey: 'categories.investmentPlaceholder',
      icon: 'TrendingUp',
      color: '#4FD1BE',
      sortOrder: 5,
    },
    {
      id: 'other-income',
      nameKey: 'categories.otherIncome',
      placeholderKey: 'categories.otherIncomePlaceholder',
      icon: 'CircleDollarSign',
      color: '#4FD1BE',
      sortOrder: 6,
    },
  ];

  const expense = [
    {
      id: 'food',
      nameKey: 'categories.food',
      placeholderKey: 'categories.foodPlaceholder',
      icon: 'Utensils',
      color: '#E2574C',
      sortOrder: 1,
    },
    {
      id: 'transport',
      nameKey: 'categories.transport',
      placeholderKey: 'categories.transportPlaceholder',
      icon: 'CarFront',
      color: '#E2574C',
      sortOrder: 2,
    },
    {
      id: 'housing',
      nameKey: 'categories.housing',
      placeholderKey: 'categories.housingPlaceholder',
      icon: 'House',
      color: '#E2574C',
      sortOrder: 3,
    },
    {
      id: 'bills',
      nameKey: 'categories.bills',
      placeholderKey: 'categories.billsPlaceholder',
      icon: 'ReceiptText',
      color: '#E2574C',
      sortOrder: 4,
    },
    {
      id: 'shopping',
      nameKey: 'categories.shopping',
      placeholderKey: 'categories.shoppingPlaceholder',
      icon: 'ShoppingBag',
      color: '#E2574C',
      sortOrder: 5,
    },
    {
      id: 'health',
      nameKey: 'categories.health',
      placeholderKey: 'categories.healthPlaceholder',
      icon: 'HeartPulse',
      color: '#E2574C',
      sortOrder: 6,
    },
    {
      id: 'education',
      nameKey: 'categories.education',
      placeholderKey: 'categories.educationPlaceholder',
      icon: 'GraduationCap',
      color: '#E2574C',
      sortOrder: 7,
    },
    {
      id: 'other-expense',
      nameKey: 'categories.otherExpense',
      placeholderKey: 'categories.otherExpensePlaceholder',
      icon: 'MoreHorizontal',
      color: '#E2574C',
      sortOrder: 8,
    },
  ];

  return [...income, ...expense].map((cat) => ({
    ...cat,
    memberId: 'self',
    type: cat.id.endsWith('income') || income.find((i) => i.id === cat.id)
      ? 'income'
      : 'expense',
    // name و placeholder به عنوان fallback ذخیره می‌شوند
    name: t(cat.nameKey),
    placeholder: t(cat.placeholderKey),
    isDefault: true,
    createdAt: now,
    updatedAt: now,
  }));
}

const defaultSettings = [
  { key: 'currency', value: 'AFN' },
  { key: 'currencyLabel', value: 'افغانی' },
  { key: 'currencyCode', value: 'AFN' },
  { key: 'locale', value: 'fa-AF' },
  { key: 'language', value: 'fa' },
  { key: 'calendarId', value: 'afghan' },
  { key: 'regionId', value: 'afghan' },
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
        await db.categories.bulkAdd(buildDefaultCategories());
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