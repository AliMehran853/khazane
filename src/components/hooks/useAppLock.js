import { useEffect } from 'react';

import {
  isLockEnabled,
  isPinEnabled,
  isBiometricEnabled,
  isBiometricAvailable,
  hasPin,
} from '../services/securityService';
import { useSecurityStore } from '../store/securityStore';
import { STORAGE_KEYS } from '../utils/constants';

export const SESSION_UNLOCK_KEY = STORAGE_KEYS.sessionUnlock;

export function useAppLock() {
  const locked = useSecurityStore((s) => s.locked);
  const checking = useSecurityStore((s) => s.checking);

  const setLocked = useSecurityStore((s) => s.setLocked);
  const setChecking = useSecurityStore((s) => s.setChecking);
  const setLockEnabled = useSecurityStore((s) => s.setLockEnabled);
  const setPinEnabled = useSecurityStore((s) => s.setPinEnabled);
  const setBiometricEnabled = useSecurityStore((s) => s.setBiometricEnabled);
  const setBiometricAvailable = useSecurityStore((s) => s.setBiometricAvailable);
  const setMethod = useSecurityStore((s) => s.setMethod);

  useEffect(() => {
    let cancelled = false;

    const safetyTimer = setTimeout(() => {
      if (!cancelled) {
        console.warn('Lock init timeout');
        setChecking(false);
      }
    }, 5000);

    async function init() {
      try {
        const lockOn = await isLockEnabled();
        if (cancelled) return;

        setLockEnabled(lockOn);

        if (!lockOn) {
          setLocked(false);
          setChecking(false);
          clearTimeout(safetyTimer);
          return;
        }

        const unlockedThisSession =
          sessionStorage.getItem(SESSION_UNLOCK_KEY) === '1';

        if (unlockedThisSession) {
          setLocked(false);
          setChecking(false);
          clearTimeout(safetyTimer);
          return;
        }

        const [pinOn, bioOn, pinExists] = await Promise.all([
          isPinEnabled(),
          isBiometricEnabled(),
          hasPin(),
        ]);
        if (cancelled) return;

        setPinEnabled(pinOn);
        setBiometricEnabled(bioOn);

        if (pinOn && !pinExists) {
          console.warn('PIN enabled but no hash found - unlocking');
          setLocked(false);
          setChecking(false);
          clearTimeout(safetyTimer);
          return;
        }

        if (pinOn || bioOn) {
          setLocked(true);
          setMethod('pin');
        } else {
          setLocked(false);
        }

        setChecking(false);
        clearTimeout(safetyTimer);

        if (bioOn) {
          isBiometricAvailable()
            .then((avail) => {
              if (cancelled) return;
              setBiometricAvailable(avail);
              if (avail) setMethod('biometric');
            })
            .catch(() => {
              if (cancelled) return;
              setBiometricAvailable(false);
            });
        }
      } catch (err) {
        console.error('Lock init failed:', err);
        if (!cancelled) {
          setLocked(false);
          setChecking(false);
          clearTimeout(safetyTimer);
        }
      }
    }

    init();

    return () => {
      cancelled = true;
      clearTimeout(safetyTimer);
    };
  }, [
    setLocked,
    setChecking,
    setLockEnabled,
    setPinEnabled,
    setBiometricEnabled,
    setBiometricAvailable,
    setMethod,
  ]);

  return { locked, checking };
}