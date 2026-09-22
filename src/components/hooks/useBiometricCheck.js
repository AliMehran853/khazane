import { useEffect, useState } from 'react';

import {
  isWebAuthnSupported,
  isBiometricAvailable,
} from '../services/securityService';

export function useBiometricCheck() {
  const [available, setAvailable] = useState(null);
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      const sup = isWebAuthnSupported();
      if (cancelled) return;
      setSupported(sup);

      if (!sup) {
        setAvailable(false);
        return;
      }

      try {
        const avail = await isBiometricAvailable();
        if (!cancelled) setAvailable(avail);
      } catch (err) {
        console.warn('Biometric check failed:', err);
        if (!cancelled) setAvailable(false);
      }
    }

    check();

    return () => {
      cancelled = true;
    };
  }, []);

  return { available, supported, checking: available === null };
}