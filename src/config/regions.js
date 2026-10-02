export const REGIONS = {
  afghan: {
    id: 'afghan',
    language: 'fa',
    calendar: 'afghan',
    currency: 'AFN',
    dir: 'rtl',
    flag: '🇦🇫',
  },
  iranian: {
    id: 'iranian',
    language: 'fa',
    calendar: 'iranian',
    currency: 'IRR',
    dir: 'rtl',
    flag: '🇮🇷',
  },
  international: {
    id: 'international',
    language: 'en',
    calendar: 'gregorian',
    currency: 'USD',
    dir: 'ltr',
    flag: '🌍',
  },
};

export const REGION_ORDER = ['afghan', 'iranian', 'international'];

export const DEFAULT_REGION = 'afghan';

export function getRegion(id) {
  return REGIONS[id] || REGIONS[DEFAULT_REGION];
}