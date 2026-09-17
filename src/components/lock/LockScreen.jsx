import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

import AppLogo from '../common/AppLogo';
import BiometricButton from './BiometricButton';
import PinPad from './PinPad';

import { useSecurityStore } from '../store/securityStore';
import { SESSION_UNLOCK_KEY } from '../hooks/useAppLock';
import {
  verifyPin,
  verifyBiometric,
} from '../services/securityService';

const PIN_LENGTH = 4;

function LockScreen() {
  const method = useSecurityStore((s) => s.method);
  const setMethod = useSecurityStore((s) => s.setMethod);

  const pinBuffer = useSecurityStore((s) => s.pinBuffer);
  const pinError = useSecurityStore((s) => s.pinError);
  const appendPin = useSecurityStore((s) => s.appendPin);
  const clearPinBuffer = useSecurityStore((s) => s.clearPinBuffer);
  const backspacePin = useSecurityStore((s) => s.backspacePin);
  const setPinError = useSecurityStore((s) => s.setPinError);

  const setLocked = useSecurityStore((s) => s.setLocked);
  const pinEnabled = useSecurityStore((s) => s.pinEnabled);
  const biometricEnabled = useSecurityStore((s) => s.biometricEnabled);
  const biometricAvailable = useSecurityStore((s) => s.biometricAvailable);
  const reset = useSecurityStore((s) => s.reset);

  const verifyingRef = useRef(false);
  const autoTriedRef = useRef(false);

  // ⭐ هر بار موفق به باز کردن قفل شدی، این تابع را صدا بزن
  function handleUnlocked() {
    sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
    setLocked(false);
  }

  // تلاش خودکار اثر انگشت هنگام ورود
  useEffect(() => {
    if (method !== 'biometric') return;
    if (!biometricEnabled || !biometricAvailable) return;
    if (autoTriedRef.current) return;

    autoTriedRef.current = true;

    let cancelled = false;
    const t = setTimeout(async () => {
      try {
        const ok = await verifyBiometric();
        if (cancelled) return;
        if (ok) handleUnlocked();
      } catch (err) {
        console.warn('Auto biometric failed:', err);
      }
    }, 400);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [method, biometricEnabled, biometricAvailable]);

  // بررسی خودکار PIN وقتی ۴ رقم شد
  useEffect(() => {
    if (method !== 'pin') return;
    if (pinBuffer.length !== PIN_LENGTH) return;
    if (verifyingRef.current) return;

    verifyingRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const ok = await verifyPin(pinBuffer);
        if (cancelled) return;

        if (ok) {
          reset();
          handleUnlocked();
        } else {
          setPinError('رمز اشتباه است.');
          clearPinBuffer();
        }
      } catch (err) {
        console.error(err);
        setPinError('خطا در بررسی رمز.');
        clearPinBuffer();
      } finally {
        verifyingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      verifyingRef.current = false;
    };
  }, [pinBuffer, method, setPinError, clearPinBuffer, reset]);

  async function handleBiometric() {
    try {
      setPinError('');
      const ok = await verifyBiometric();
      if (ok) handleUnlocked();
    } catch (err) {
      console.error(err);
      if (pinEnabled) setMethod('pin');
    }
  }

  function handleKey(digit) {
    if (pinBuffer.length >= PIN_LENGTH) return;
    setPinError('');
    appendPin(digit);
  }

  const showBiometric =
    method === 'biometric' && biometricEnabled && biometricAvailable;
  const showPin = !showBiometric && pinEnabled;

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0A1614] px-6">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(227,179,65,0.14), transparent 55%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.35 }}
      >
        <AppLogo size={84} />
      </motion.div>

      <motion.h1
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35 }}
        className="mt-5 text-[26px] font-extrabold text-[#F2EFE9]"
      >
        خزانه
      </motion.h1>

      <motion.p
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15, duration: 0.35 }}
        className="mt-2 max-w-[260px] text-center text-[12px] leading-relaxed text-[#8FA39D]"
      >
        مدیریت درآمد و مصارف روزانه‌ات
        <br />
        ساده، دقیق و کاملاً آفلاین
      </motion.p>

      <div className="mt-12 w-full max-w-[320px]">
        {showBiometric && (
          <div className="flex flex-col items-center">
            <BiometricButton onPress={handleBiometric} />

            <p className="mt-5 text-[13px] font-semibold text-[#F2EFE9]">
              ورود با اثر انگشت
            </p>
            <p className="mt-1.5 text-center text-[11px] leading-relaxed text-[#5C736C]">
              برای باز کردن، دستت را روی سنسور نگهدار
            </p>

            {pinEnabled && (
              <button
                type="button"
                onClick={() => {
                  setMethod('pin');
                  setPinError('');
                  clearPinBuffer();
                }}
                className="mt-10 text-[12px] font-semibold text-[#E3B341]"
              >
                ورود با رمز عبور
              </button>
            )}
          </div>
        )}

        {showPin && (
          <div className="flex flex-col items-center">
            <p className="text-[13px] font-semibold text-[#F2EFE9]">
              رمز عبور را وارد کنید
            </p>

            <div className="mt-4 flex items-center gap-3" dir="ltr">
              {Array.from({ length: PIN_LENGTH }).map((_, i) => (
                <div
                  key={i}
                  className={[
                    'h-3.5 w-3.5 rounded-full transition-all duration-200',
                    i < pinBuffer.length
                      ? 'scale-100 bg-[#E3B341]'
                      : 'scale-90 bg-white/[0.12]',
                  ].join(' ')}
                />
              ))}
            </div>

            <div className="h-5">
              {pinError && (
                <p className="mt-2 text-[11px] text-[#E2574C]">{pinError}</p>
              )}
            </div>

            <div className="mt-5 w-full">
              <PinPad
                onKey={handleKey}
                onBackspace={backspacePin}
                onClear={clearPinBuffer}
              />
            </div>

            {biometricEnabled && biometricAvailable && (
              <button
                type="button"
                onClick={() => {
                  setMethod('biometric');
                  setPinError('');
                  clearPinBuffer();
                  autoTriedRef.current = false;
                }}
                className="mt-6 text-[12px] font-semibold text-[#E3B341]"
              >
                ورود با اثر انگشت
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default LockScreen;