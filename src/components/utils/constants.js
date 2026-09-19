export const APP_NAME = 'خزانه';
export const APP_VERSION = '1.1.0';
export const APP_BUILD_DATE = '1404/07';

export const CHANGELOG = [
  {
    version: '1.1.0',
    date: '1404/07',
    items: [
      'ناوبری هفته — مشاهده‌ی هفته‌های گذشته',
      'انتخاب تاریخ هنگام ثبت در هفته‌های گذشته',
      'نمایش تاریخ کامل روی هر تراکنش',
      'پنل جزئیات سریع برای هر تراکنش',
      'مقایسه‌ی فیصدی بین دوره‌ها',
      'لودینگ نرم با Skeleton',
      'انیمیشن اعداد',
      'بازخورد لمسی روی موبایل',
      'موجودی منفی با رنگ قرمز',
    ],
  },
  {
    version: '1.0.0',
    date: '1404/06',
    items: [
      'انتشار اولیه',
      'ثبت درآمد و مصارف',
      'نمودارها و دسته‌بندی‌ها',
      'قفل با رمز و اثر انگشت',
      'پشتیبان‌گیری و بازیابی',
      'یادآوری روزانه',
      'حالت آفلاین کامل',
    ],
  },
];

export const CURRENCY = {
  code: 'AFN',
  label: 'افغانی',
  symbol: '؋',
};

export const CURRENCY_OPTIONS = [
  { code: 'AFN', label: 'افغانی', symbol: '؋' },
  { code: 'USD', label: 'دالر', symbol: '$' },
  { code: 'PKR', label: 'کلدار', symbol: '₨' },
  { code: 'IRR', label: 'تومان', symbol: '﷼' },
];

export const PERIODS = ['weekly', 'monthly', 'yearly'];

export const PERIOD_LABELS = {
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

export const PERIOD_SHORT = {
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  yearly: 'سالانه',
};

export const TRANSACTION_TYPES = {
  income: 'درآمد',
  expense: 'مصرف',
};

export const MEMBER_ID = 'self';

export const PIN_LENGTH = 4;
export const MAX_PIN_ATTEMPTS = 5;

export const ROUTES = {
  home: '/',
  income: '/income',
  expenses: '/expenses',
  settings: '/settings',
  lock: '/lock',
};