import { create } from 'zustand';

export const useAppStore = create((set) => ({
  period: 'weekly',
  transactionSheetOpen: false,
  transactionSheetType: 'expense',
  selectedCategoryId: null,
  dataVersion: 0,

  setPeriod: (period) => set({ period }),
  openTransactionSheet: (type = 'expense') =>
    set({ transactionSheetOpen: true, transactionSheetType: type }),
  closeTransactionSheet: () => set({ transactionSheetOpen: false }),
  setSelectedCategoryId: (categoryId) => set({ selectedCategoryId: categoryId }),
  refreshData: () => set((state) => ({ dataVersion: state.dataVersion + 1 })),
}));