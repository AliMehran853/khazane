// ============================================================
// App constants — single source of truth
// ============================================================

export const APP_NAME = 'خزانه';
export const APP_VERSION = '1.1.0';
export const APP_BUILD_DATE = '1405/06';

export const MEMBER_ID = 'self';

/* ---------- Periods ---------- */

export const PERIODS = ['daily', 'weekly', 'monthly', 'yearly'];

export const PERIOD_LABELS = {
  daily: 'امروز',
  weekly: 'این هفته',
  monthly: 'این ماه',
  yearly: 'امسال',
};

export const PERIOD_SHORT = {
  daily: 'روزانه',
  weekly: 'هفتگی',
  monthly: 'ماهانه',
  yearly: 'سالانه',
};

/* ---------- Transaction types ---------- */

export const TRANSACTION_TYPES = {
  income: 'درآمد',
  expense: 'مصرف',
};

/* ---------- Security ---------- */

export const PIN_LENGTH = 4;
export const MAX_PIN_ATTEMPTS = 5;

/* ---------- Currency ---------- */

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

/* ---------- Routes ---------- */

export const ROUTES = {
  home: '/',
  income: '/income',
  expenses: '/expenses',
  settings: '/settings',
  search: '/search',
};

/* ---------- Limits ---------- */

export const NOTE_MAX_LENGTH = 200;
export const NOTE_WARN_THRESHOLD = 140;
export const NOTE_DANGER_THRESHOLD = 180;

export const RECENT_TX_LIMIT = 8;
export const RECENT_TX_EXPANDED_LIMIT = 20;

export const REMINDER_HOURS_MS = 24 * 60 * 60 * 1000;
export const REMINDER_CHECK_DELAY = 1200;

export const GREETING_CHECK_DELAY = 1400;
export const GREETING_TOAST_DURATION = 7000;
export const PERIOD_LOCK_TOAST_DURATION = 4500;

/* ---------- Storage keys ---------- */

export const STORAGE_KEYS = {
  theme: 'khazane_theme',
  sessionUnlock: 'khazane_unlocked',
  greetingsShown: 'khazane_greetings_shown',
  greetingsCounter: 'khazane_greetings_counter',
  installDismissed: 'khazane_install_dismissed_at',
};

/* ---------- Changelog ---------- */

export const CHANGELOG = [
  {
    version: '1.1.0',
    date: '1405/06/25',
    items: [
      'طراحی کامل شیشه‌ای با تم سبز',
      'پالت رنگی تازه با رنگ سبز',
      'بهبود سایه‌ها و عمق کارت‌ها',
      'پشتیبانی از حالت روشن و تاریک',
      'آیکون‌های جدید اپ',
      'بهبود خوانایی متن‌ها',
      'ناوبری هفته — مشاهده‌ی هفته‌های گذشته',
      'انتخاب تاریخ هنگام ثبت در هفته‌های گذشته',
      'نمایش تاریخ کامل روی هر تراکنش',
      'پنل جزئیات سریع برای هر تراکنش',
      'مقایسه‌ی عددی بین دوره‌ها',
      'لودینگ نرم با Skeleton',
      'انیمیشن اعداد',
      'بازخورد لمسی روی موبایل',
      'موجودی منفی با رنگ قرمز',
    ],
  },
  {
    version: '1.0.0',
    date: '1405/06/01',
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