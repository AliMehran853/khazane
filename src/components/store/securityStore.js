import { create } from 'zustand';

import { PIN_LENGTH } from '../utils/constants';

export const useSecurityStore = create((set) => ({
  locked: false,
  checking: true,
  method: 'pin',

  lockEnabled: false,
  pinEnabled: false,
  biometricEnabled: false,
  biometricAvailable: false,

  pinBuffer: '',
  pinError: '',

  setLocked: (locked) => set({ locked }),
  setChecking: (checking) => set({ checking }),
  setMethod: (method) => set({ method }),

  setLockEnabled: (lockEnabled) => set({ lockEnabled }),
  setPinEnabled: (pinEnabled) => set({ pinEnabled }),
  setBiometricEnabled: (biometricEnabled) => set({ biometricEnabled }),
  setBiometricAvailable: (biometricAvailable) => set({ biometricAvailable }),

  appendPin: (digit) =>
    set((state) => ({
      pinBuffer: (state.pinBuffer + digit).slice(0, PIN_LENGTH),
    })),
  clearPinBuffer: () => set({ pinBuffer: '' }),
  backspacePin: () =>
    set((state) => ({ pinBuffer: state.pinBuffer.slice(0, -1) })),
  setPinError: (pinError) => set({ pinError }),

  reset: () => set({ pinBuffer: '', pinError: '' }),
}));