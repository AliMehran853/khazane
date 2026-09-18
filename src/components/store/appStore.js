import { create } from 'zustand';

export const useAppStore = create((set) => ({
  period: 'weekly',

  transactionSheetOpen: false,
  transactionSheetType: 'expense',
  editingTransaction: null, // ⭐ تراکنش در حال ویرایش (یا null)

  selectedCategoryId: null,

  dataVersion: 0,

  setPeriod: (period) => set({ period }),

  openTransactionSheet: (type = 'expense', transaction = null) =>
    set({
      transactionSheetOpen: true,
      transactionSheetType: type,
      editingTransaction: transaction,
    }),

  closeTransactionSheet: () =>
    set({
      transactionSheetOpen: false,
      editingTransaction: null,
    }),

  setSelectedCategoryId: (categoryId) =>
    set({ selectedCategoryId: categoryId }),

  refreshData: () =>
    set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));