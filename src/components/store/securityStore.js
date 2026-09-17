import { create } from 'zustand';

export const useSecurityStore = create((set) => ({
  // وضعیت قفل
  locked: false,
  checking: true,
  method: 'pin', // 'pin' یا 'biometric'

  // تنظیمات امنیتی
  lockEnabled: false,
  pinEnabled: false,
  biometricEnabled: false,
  biometricAvailable: false,

  // PIN flow
  pinBuffer: '',
  pinError: '',

  // Actions
  setLocked: (locked) => set({ locked }),
  setChecking: (checking) => set({ checking }),
  setMethod: (method) => set({ method }),

  setLockEnabled: (lockEnabled) => set({ lockEnabled }),
  setPinEnabled: (pinEnabled) => set({ pinEnabled }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  setBiometricAvailable: (biometricAvailable) => set({ biometricAvailable }),

  appendPin: (digit) =>
    set((state) => ({
      pinBuffer: (state.pinBuffer + digit).slice(0, 6),
    })),
  clearPinBuffer: () => set({ pinBuffer: '' }),
  backspacePin: () =>
    set((state) => ({ pinBuffer: state.pinBuffer.slice(0, -1) })),
  setPinError: (pinError) => set({ pinError }),

  reset: () =>
    set({
      pinBuffer: '',
      pinError: '',
    }),
}));