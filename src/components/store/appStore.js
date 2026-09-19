import { create } from 'zustand';

export const useAppStore = create((set) => ({
  period: 'weekly',
  weekOffset: 0, // 0 = این هفته، -1 = گذشته، تا -52

  transactionSheetOpen: false,
  transactionSheetType: 'expense',
  editingTransaction: null,
  prefilledDate: null, // ⭐ تاریخ پیش‌فرض برای ثبت جدید

  dateChoiceOpen: false,
  dateChoiceType: 'expense',

  selectedCategoryId: null,
  dataVersion: 0,

  setPeriod: (period) => set({ period }),

  setWeekOffset: (n) => {
    const clamped = Math.max(-52, Math.min(0, n));
    set({ weekOffset: clamped });
  },

  resetWeekOffset: () => set({ weekOffset: 0 }),

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

  setSelectedCategoryId: (categoryId) =>
    set({ selectedCategoryId: categoryId }),

  refreshData: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));