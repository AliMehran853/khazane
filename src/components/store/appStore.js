import { create } from 'zustand';

export const useAppStore = create((set) => ({
  period: 'daily',
  periodOffset: 0,

  transactionSheetOpen: false,
  transactionSheetType: 'expense',
  editingTransaction: null,
  prefilledDate: null,

  dateChoiceOpen: false,
  dateChoiceType: 'expense',

  // ⭐ Toast قفل دوره
  periodLockToastOpen: false,

  selectedCategoryId: null,
  dataVersion: 0,

  setPeriod: (period) =>
    set({
      period,
      periodOffset: 0,
    }),

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

  // ⭐ Toast قفل دوره
  showPeriodLockToast: () => set({ periodLockToastOpen: true }),
  hidePeriodLockToast: () => set({ periodLockToastOpen: false }),

  setSelectedCategoryId: (categoryId) =>
    set({ selectedCategoryId: categoryId }),

  refreshData: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));