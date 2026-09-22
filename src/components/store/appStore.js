import { create } from 'zustand';

import { STORAGE_KEYS } from '../utils/constants';

function loadTheme() {
  try {
    const saved = localStorage.getItem(STORAGE_KEYS.theme);
    if (saved === 'light' || saved === 'dark') return saved;
  } catch {
    /* ignore */
  }
  return 'dark';
}

export const useAppStore = create((set) => ({
  theme: loadTheme(),

  period: 'daily',
  periodOffset: 0,

  transactionSheetOpen: false,
  transactionSheetType: 'expense',
  editingTransaction: null,
  prefilledDate: null,

  dateChoiceOpen: false,
  dateChoiceType: 'expense',

  periodLockToastOpen: false,

  dataVersion: 0,

  setTheme: (theme) => {
    try {
      localStorage.setItem(STORAGE_KEYS.theme, theme);
    } catch {
      /* ignore */
    }
    set({ theme });
  },

  toggleTheme: () =>
    set((state) => {
      const next = state.theme === 'dark' ? 'light' : 'dark';
      try {
        localStorage.setItem(STORAGE_KEYS.theme, next);
      } catch {
        /* ignore */
      }
      return { theme: next };
    }),

  setPeriod: (period) => set({ period, periodOffset: 0 }),

  setPeriodOffset: (n) => set({ periodOffset: n }),
  resetPeriodOffset: () => set({ periodOffset: 0 }),

  openTransactionSheet: (type = 'expense', transaction = null, date = null) =>
    set({
      transactionSheetOpen: true,
      transactionSheetType: type,
      editingTransaction: transaction,
      prefilledDate: date,
    }),

  closeTransactionSheet: () =>
    set({
      transactionSheetOpen: false,
      editingTransaction: null,
      prefilledDate: null,
    }),

  openDateChoice: (type = 'expense') =>
    set({ dateChoiceOpen: true, dateChoiceType: type }),

  closeDateChoice: () => set({ dateChoiceOpen: false }),

  showPeriodLockToast: () => set({ periodLockToastOpen: true }),
  hidePeriodLockToast: () => set({ periodLockToastOpen: false }),

  refreshData: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));