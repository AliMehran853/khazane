export const APP_NAME = 'خزانه';
export const APP_VERSION = '1.0.0';

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