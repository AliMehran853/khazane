import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import AppLogo from '../common/AppLogo';
import BiometricButton from './BiometricButton';
import PinPad from './PinPad';

import { useSecurityStore } from '../store/securityStore';
import { useIsDesktop } from '../hooks/useIsDesktop';
import { SESSION_UNLOCK_KEY } from '../hooks/useAppLock';
import { verifyPin, verifyBiometric } from '../services/securityService';
import { PIN_LENGTH } from '../utils/constants';

function LockScreen() {
  const isDesktop = useIsDesktop();

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

  const [shake, setShake] = useState(false);
  const [unlocking, setUnlocking] = useState(false);

  const verifyingRef = useRef(false);
  const autoTriedRef = useRef(false);

  function handleUnlocked() {
    setUnlocking(true);
    sessionStorage.setItem(SESSION_UNLOCK_KEY, '1');
    setTimeout(() => setLocked(false), 380);
  }

  function triggerShake() {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  }

  useEffect(() => {
    if (isDesktop) return;
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
    }, 500);

    return () => {
      cancelled = true;
      clearTimeout(t);
    };
  }, [method, biometricEnabled, biometricAvailable, isDesktop]);

  useEffect(() => {
    if (method !== 'pin' && !isDesktop) return;
    if (pinBuffer.length !== PIN_LENGTH) return;
    if (verifyingRef.current) return;

    verifyingRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        await new Promise((r) => setTimeout(r, 130));
        if (cancelled) return;

        const ok = await verifyPin(pinBuffer);
        if (cancelled) return;

        if (ok) {
          reset();
          handleUnlocked();
        } else {
          setPinError('رمز اشتباه است.');
          triggerShake();
          clearPinBuffer();
        }
      } catch (err) {
        console.error(err);
        setPinError('خطا در بررسی رمز.');
        triggerShake();
        clearPinBuffer();
      } finally {
        verifyingRef.current = false;
      }
    })();

    return () => {
      cancelled = true;
      verifyingRef.current = false;
    };
  }, [pinBuffer, method, setPinError, clearPinBuffer, reset, isDesktop]);

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
    if (pinBuffer.length >= PIN_LENGTH || unlocking) return;
    setPinError('');
    appendPin(digit);
  }

  const showBiometric =
    !isDesktop &&
    method === 'biometric' &&
    biometricEnabled &&
    biometricAvailable;
  const showPin = !showBiometric && pinEnabled;
  const showNothing = !showBiometric && !showPin;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-6 lg:px-8">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 35%, rgba(0,209,167,0.20), transparent 55%)',
        }}
      />

      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{
          scale: unlocking ? 1.03 : 1,
          opacity: unlocking ? 0 : 1,
        }}
        transition={{
          duration: unlocking ? 0.4 : 0.35,
          ease: unlocking ? 'easeIn' : 'easeOut',
        }}
        className="relative z-10 flex w-full max-w-[340px] flex-col items-center lg:max-w-[400px] lg:glass-strong lg:rounded-3xl lg:px-7 lg:py-8"
      >
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{
            delay: 0.05,
            duration: 0.45,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <AppLogo size={isDesktop ? 64 : 84} />
        </motion.div>

        <motion.h1
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.12, duration: 0.4 }}
          className="mt-5 text-3xl font-extrabold text-fg-1 lg:mt-4 lg:text-2xl"
        >
          خزانه
        </motion.h1>

        <motion.p
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.18, duration: 0.4 }}
          className="mt-2 max-w-[260px] text-center text-sm leading-relaxed text-fg-2 lg:max-w-[300px] lg:text-base"
        >
          مدیریت درآمد و مصارف روزانه‌ات
          <br />
          ساده، دقیق و کاملاً آفلاین
        </motion.p>

        <div className="mt-10 w-full max-w-[320px] lg:mt-7">
          <AnimatePresence mode="wait">
            {showBiometric && (
              <motion.div
                key="biometric"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                <BiometricButton onPress={handleBiometric} />

                <p className="mt-5 text-base font-semibold text-fg-1">
                  ورود با اثر انگشت
                </p>
                <p className="mt-1.5 text-center text-xs leading-relaxed text-fg-3">
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
                    className="mt-10 text-sm font-semibold text-primary"
                  >
                    ورود با رمز عبور
                  </button>
                )}
              </motion.div>
            )}

            {showPin && (
              <motion.div
                key="pin"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.32, ease: 'easeOut' }}
                className="flex flex-col items-center"
              >
                <p className="text-base font-semibold text-fg-1 lg:text-md">
                  رمز عبور را وارد کنید
                </p>

                <motion.div
                  animate={
                    shake ? { x: [0, -10, 10, -8, 8, -4, 4, 0] } : { x: 0 }
                  }
                  transition={{ duration: 0.45, ease: 'easeInOut' }}
                  className="mt-4 flex items-center gap-3"
                  dir="ltr"
                >
                  {Array.from({ length: PIN_LENGTH }).map((_, i) => {
                    const filled = i < pinBuffer.length;
                    return (
                      <motion.div
                        key={i}
                        animate={{
                          scale: filled ? 1 : 0.9,
                          backgroundColor: filled
                            ? 'var(--kh-primary)'
                            : 'var(--kh-fill-3)',
                        }}
                        transition={{ duration: 0.18, ease: 'easeOut' }}
                        className="h-3.5 w-3.5 rounded-full"
                      />
                    );
                  })}
                </motion.div>

                <div className="h-5">
                  <AnimatePresence>
                    {pinError && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -4 }}
                        transition={{ duration: 0.2 }}
                        className="mt-2 text-xs text-expense"
                      >
                        {pinError}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>

                <div className="mt-4 w-full lg:mt-3">
                  <PinPad
                    onKey={handleKey}
                    onBackspace={backspacePin}
                    onClear={clearPinBuffer}
                  />
                </div>

                {!isDesktop && biometricEnabled && biometricAvailable && (
                  <button
                    type="button"
                    onClick={() => {
                      setMethod('biometric');
                      setPinError('');
                      clearPinBuffer();
                      autoTriedRef.current = false;
                    }}
                    className="mt-6 text-sm font-semibold text-primary"
                  >
                    ورود با اثر انگشت
                  </button>
                )}
              </motion.div>
            )}

            {showNothing && (
              <motion.p
                key="nothing"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.35, delay: 0.25 }}
                className="text-center text-sm text-fg-3"
              >
                در حال آماده‌سازی...
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default LockScreen;