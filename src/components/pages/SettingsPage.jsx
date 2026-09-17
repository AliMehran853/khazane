import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Clock,
  Coins,
  Database,
  Fingerprint,
  LogOut,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';

import {
  SettingsGroup,
  SettingsButtonRow,
  SettingsToggleRow,
  SettingsProfileCard,
  StatusBadge,
} from '../settings/SettingsSections';

import InstallCard from '../settings/InstallCard';
import PinPad from '../lock/PinPad';

import { useAppStore } from '../store/appStore';
import { useSecurityStore } from '../store/securityStore';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useBiometricCheck } from '../hooks/useBiometricCheck';
import { SESSION_UNLOCK_KEY } from '../hooks/useAppLock';

import {
  getUserName,
  setUserName,
  getCurrencyLabel,
  setCurrencyLabel,
  isReminderEnabled,
  setReminderEnabled,
  getReminderTime,
  setReminderTime,
  exportAllData,
  importAllData,
  clearAllData,
} from '../services/settingsService';

import {
  isLockEnabled,
  setLockEnabled,
  isPinEnabled,
  isBiometricEnabled,
  hasPin,
  setPin as savePinToStorage,
  clearPin,
  registerBiometric,
  clearBiometric,
} from '../services/securityService';

import { CURRENCY_OPTIONS } from '../utils/constants';
import { getTodayShort } from '../utils/dates';
import { formatTime12, parseTime24, toTime24 } from '../utils/timeFormat';

// ============================================================
// Time Picker
// ============================================================

function TimePicker({ value, onChange }) {
  const { hour, minute, period } = parseTime24(value);

  const hours = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  const minutes = [0, 15, 30, 45];

  function setHour(h) {
    onChange(toTime24(h, minute, period));
  }

  function setMinute(m) {
    onChange(toTime24(hour, m, period));
  }

  function setPeriod(p) {
    onChange(toTime24(hour, minute, p));
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-[11px] font-medium text-[#8FA39D]">ساعت</p>
        <div className="grid grid-cols-4 gap-2">
          {hours.map((h) => {
            const active = h === hour;
            return (
              <button
                key={h}
                type="button"
                onClick={() => setHour(h)}
                className={[
                  'flex h-11 items-center justify-center rounded-xl border text-[14px] font-bold transition-all active:scale-95',
                  active
                    ? 'border-[#E3B341]/50 bg-[#E3B341]/[0.14] text-[#E3B341]'
                    : 'border-white/[0.06] bg-[#153029] text-[#8FA39D]',
                ].join(' ')}
              >
                {h}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-[#8FA39D]">دقیقه</p>
        <div className="grid grid-cols-4 gap-2">
          {minutes.map((m) => {
            const active = m === minute;
            return (
              <button
                key={m}
                type="button"
                onClick={() => setMinute(m)}
                className={[
                  'flex h-11 items-center justify-center rounded-xl border text-[14px] font-bold transition-all active:scale-95',
                  active
                    ? 'border-[#E3B341]/50 bg-[#E3B341]/[0.14] text-[#E3B341]'
                    : 'border-white/[0.06] bg-[#153029] text-[#8FA39D]',
                ].join(' ')}
              >
                {String(m).padStart(2, '0')}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-[11px] font-medium text-[#8FA39D]">نوبت</p>
        <div className="grid grid-cols-2 gap-2">
          {['صبح', 'شب'].map((p) => {
            const active = p === period;
            return (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={[
                  'flex h-11 items-center justify-center rounded-xl border text-[13px] font-bold transition-all active:scale-95',
                  active
                    ? 'border-[#E3B341]/50 bg-[#E3B341]/[0.14] text-[#E3B341]'
                    : 'border-white/[0.06] bg-[#153029] text-[#8FA39D]',
                ].join(' ')}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      <div className="rounded-2xl border border-[#E3B341]/20 bg-[#E3B341]/[0.06] p-4 text-center">
        <p className="text-[11px] text-[#8FA39D]">زمان یادآوری</p>
        <p className="mt-1 text-[20px] font-extrabold text-[#E3B341]">
          {formatTime12(value)}
        </p>
      </div>
    </div>
  );
}

// ============================================================
// PIN Setup Flow
// ============================================================

function PinSetupFlow({ onDone, onCancel }) {
  const [step, setStep] = useState('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const PIN_LENGTH = 4;

  function handleKey(digit) {
    if (pinValue.length >= PIN_LENGTH || saving) return;
    setError('');
    const next = pinValue + digit;
    setPinValue(next);

    if (next.length === PIN_LENGTH) {
      setSaving(true);
      setTimeout(async () => {
        if (step === 'enter') {
          setFirstPin(next);
          setPinValue('');
          setStep('confirm');
          setSaving(false);
        } else {
          if (next === firstPin) {
            try {
              await savePinToStorage(next);
              onDone?.();
            } catch (err) {
              console.error('setPin failed:', err);
              setError(err?.message || 'ذخیره رمز ناموفق بود.');
              setPinValue('');
              setFirstPin('');
              setStep('enter');
            }
          } else {
            setError('رمز مطابقت ندارد. دوباره تلاش کنید.');
            setPinValue('');
            setFirstPin('');
            setStep('enter');
          }
          setSaving(false);
        }
      }, 180);
    }
  }

  return (
    <div className="flex flex-col items-center">
      <p className="text-[14px] font-bold text-[#F2EFE9]">
        {step === 'enter' ? 'رمز جدید را وارد کنید' : 'رمز را دوباره وارد کنید'}
      </p>

      <p className="mt-1.5 text-[11px] text-[#5C736C]">
        {step === 'enter' ? '۴ رقم دلخواه' : 'برای اطمینان، تکرار کنید'}
      </p>

      <div className="mt-5 flex items-center gap-3" dir="ltr">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={[
              'h-3.5 w-3.5 rounded-full transition-all duration-200',
              i < pinValue.length
                ? 'scale-100 bg-[#E3B341]'
                : 'scale-90 bg-white/[0.12]',
            ].join(' ')}
          />
        ))}
      </div>

      <div className="h-6">
        {error && <p className="mt-2 text-[11px] text-[#E2574C]">{error}</p>}
      </div>

      <div className="mt-3 w-full">
        <PinPad
          onKey={handleKey}
          onBackspace={() => setPinValue((p) => p.slice(0, -1))}
          onClear={() => setPinValue('')}
        />
      </div>

      <button
        type="button"
        onClick={onCancel}
        className="mt-5 text-[12px] font-semibold text-[#8FA39D]"
      >
        انصراف
      </button>
    </div>
  );
}

// ============================================================
// Sheet — با Framer Motion
// ============================================================

function Sheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;

    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevLeft = body.style.left;
    const prevRight = body.style.right;
    const prevWidth = body.style.width;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.left = prevLeft;
      body.style.right = prevRight;
      body.style.width = prevWidth;
      window.scrollTo(0, scrollY);
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="
              fixed inset-x-3 bottom-3 z-[70] mx-auto
              flex max-h-[88svh] w-auto max-w-[420px] flex-col
              overflow-hidden rounded-[24px] border border-white/[0.07] bg-[#0F211E]
              outline-none

              lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2
              lg:max-h-[85vh] lg:w-full lg:max-w-[520px]
              lg:-translate-x-1/2 lg:-translate-y-1/2
            "
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="shrink-0 px-4 pt-3 pb-3 lg:px-6 lg:pt-4 lg:pb-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.12] lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {subtitle && (
                    <p className="text-[11px] text-[#5C736C] lg:text-[12px]">
                      {subtitle}
                    </p>
                  )}
                  <h2 className="mt-0.5 text-[18px] font-bold text-[#F2EFE9] lg:text-[20px]">
                    {title}
                  </h2>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D] active:scale-95 lg:h-10 lg:w-10"
                  aria-label="بستن"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-5 lg:px-6 lg:pb-6">
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// ============================================================
// Section Title (فقط دسکتاپ)
// ============================================================

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-[#5C736C]">
      {children}
    </h2>
  );
}

// ============================================================
// Main Page
// ============================================================

function SettingsPage() {
  const dataVersion = useAppStore((s) => s.dataVersion);
  const refreshData = useAppStore((s) => s.refreshData);

  const setLocked = useSecurityStore((s) => s.setLocked);
  const resetSecurity = useSecurityStore((s) => s.reset);
  const setMethod = useSecurityStore((s) => s.setMethod);

  const { forceShow: forceShowReminder } = useDailyReminder();

  const { available: bioAvailable, checking: bioChecking } = useBiometricCheck();

  const [userName, setLocalName] = useState('');
  const [currency, setLocalCurrency] = useState('افغانی');
  const [reminderOn, setLocalReminder] = useState(false);
  const [reminderTime, setLocalReminderTime] = useState('21:00');

  const [lockOn, setLocalLock] = useState(false);
  const [pinOn, setLocalPin] = useState(false);
  const [bioOn, setLocalBio] = useState(false);

  const [sheet, setSheet] = useState(null);
  const [nameInput, setNameInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState('');
  const [pinSetupOpen, setPinSetupOpen] = useState(false);
  const [pinSetupFromToggle, setPinSetupFromToggle] = useState(false);
  const [confirmClear, setConfirmClear] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  async function loadAll() {
    const [name, cur, remOn, remTime, lockState, pinState, bioState] =
      await Promise.all([
        getUserName(),
        getCurrencyLabel(),
        isReminderEnabled(),
        getReminderTime(),
        isLockEnabled(),
        isPinEnabled(),
        isBiometricEnabled(),
      ]);
    setLocalName(name);
    setLocalCurrency(cur);
    setLocalReminder(remOn);
    setLocalReminderTime(remTime);
    setLocalLock(lockState);
    setLocalPin(pinState);
    setLocalBio(bioState);
    setNameInput(name);
  }

  useEffect(() => {
    loadAll();
  }, [dataVersion]);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  }

  async function saveName() {
    const clean = nameInput.trim();
    await setUserName(clean);
    setLocalName(clean);
    setSheet(null);
    showToast('پروفایل به‌روزرسانی شد.');
  }

  async function changeCurrency(label) {
    await setCurrencyLabel(label);
    setLocalCurrency(label);
    setSheet(null);
    showToast('واحد پول تغییر کرد.');
  }

  async function toggleReminder(next) {
    setLocalReminder(next);
    await setReminderEnabled(next);
    showToast(next ? 'یادآوری فعال شد.' : 'یادآوری غیرفعال شد.');
  }

  async function changeReminderTime(time) {
    setLocalReminderTime(time);
    await setReminderTime(time);
  }

  async function toggleLock(next) {
    if (next) {
      if (!pinOn && !bioOn) {
        setPinSetupFromToggle(true);
        setPinSetupOpen(true);
        setSheet('lock');
        return;
      }
      try {
        await setLockEnabled(true);
        setLocalLock(true);
        showToast('قفل برنامه فعال شد.');
      } catch (err) {
        console.error(err);
        showToast('فعال‌سازی قفل ناموفق بود.');
      }
    } else {
      try {
        await setLockEnabled(false);
        setLocalLock(false);
        showToast('قفل برنامه غیرفعال شد.');
      } catch (err) {
        console.error(err);
        showToast('غیرفعال‌سازی ناموفق بود.');
      }
    }
  }

  async function afterPinSet() {
    setPinSetupOpen(false);
    setPinSetupFromToggle(false);
    setLocalPin(true);
    setLocalLock(true);
    await setLockEnabled(true);
    showToast('رمز تعیین شد و قفل فعال شد.');
    await loadAll();
  }

  function cancelPinSetup() {
    setPinSetupOpen(false);
    if (pinSetupFromToggle) {
      setPinSetupFromToggle(false);
      setLocalLock(false);
      setSheet(null);
    }
  }

  async function handleRegisterBiometric() {
    setBusy(true);
    try {
      if (!window.PublicKeyCredential) {
        throw new Error('مرورگر شما از اثر انگشت پشتیبانی نمی‌کند.');
      }

      const available = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable()
        .catch(() => false);

      if (!available) {
        throw new Error(
          'اثر انگشت روی این دستگاه فعال نیست. در تنظیمات گوشی، قفل صفحه و اثر انگشت را فعال کن.'
        );
      }

      await registerBiometric();
      setLocalBio(true);
      setLocalLock(true);
      await setLockEnabled(true);
      showToast('اثر انگشت فعال شد.');
    } catch (err) {
      console.error('Biometric error:', err);

      let message = err?.message || 'ثبت اثر انگشت ناموفق بود.';
      if (err?.name === 'NotAllowedError') {
        message = 'لغو شد یا اجازه داده نشد.';
      } else if (err?.name === 'NotSupportedError') {
        message = 'این دستگاه از اثر انگشت پشتیبانی نمی‌کند.';
      } else if (err?.name === 'InvalidStateError') {
        message = 'اثر انگشت قبلاً روی این دستگاه ثبت شده است.';
      }

      showToast(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearBiometric() {
    await clearBiometric();
    setLocalBio(false);
    showToast('اثر انگشت حذف شد.');
  }

  async function handleClearPin() {
    await clearPin();
    setLocalPin(false);
    if (!bioOn) {
      await setLockEnabled(false);
      setLocalLock(false);
    }
    showToast('رمز حذف شد.');
  }

  async function handleExport() {
    try {
      const data = await exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `khazane-backup-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      showToast('فایل پشتیبان دانلود شد.');
    } catch (err) {
      showToast('خروجی ناموفق بود.');
    }
  }

  async function handleImport(event) {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      await importAllData(data);
      refreshData();
      await loadAll();
      setSheet(null);
      showToast('بازیابی با موفقیت انجام شد.');
    } catch (err) {
      showToast(err?.message || 'فایل نامعتبر است.');
    }
    event.target.value = '';
  }

  async function handleClearAll() {
    await clearAllData();
    refreshData();
    setConfirmClear(false);
    setSheet(null);
    showToast('همه‌ی داده‌ها پاک شد.');
  }

  async function handleLogout() {
    setConfirmLogout(false);
    setSheet(null);

    sessionStorage.removeItem(SESSION_UNLOCK_KEY);

    resetSecurity();

    const useBio = bioOn && bioAvailable;
    setMethod(useBio ? 'biometric' : 'pin');

    setLocked(true);
  }

  async function handleTestReminder() {
    setSheet(null);
    await forceShowReminder();
  }

  // ==========================================================
  // Currency Row (مشترک بین موبایل و دسکتاپ)
  // ==========================================================
  const currencyRow = (
    <SettingsButtonRow
      icon={Coins}
      title="واحد پول"
      subtitle={currency}
      onClick={() => setSheet('currency')}
      isLast
    />
  );

  return (
    <>
      <div className="px-4 pb-6 pt-6 lg:mx-auto lg:max-w-[1100px] lg:px-8 lg:pb-12 lg:pt-8">
        <header>
          <p className="text-[11px] text-[#5C736C] lg:text-[12px]">
            شخصی‌سازی برنامه
          </p>
          <h1 className="mt-1 text-[21px] font-bold text-[#F2EFE9] lg:text-[26px]">
            تنظیمات
          </h1>
        </header>

        {/* ============================================ */}
        {/* موبایل — تک‌ستونی، دست‌نخورده               */}
        {/* ============================================ */}
        <div className="lg:hidden">
          <InstallCard />
          <SettingsProfileCard
            name={userName}
            onClick={() => setSheet('profile')}
          />

          <SettingsGroup>
            <SettingsToggleRow
              icon={ShieldCheck}
              title="قفل برنامه"
              subtitle={
                lockOn
                  ? 'برای باز کردن، رمز یا اثر انگشت لازم است'
                  : 'غیرفعال'
              }
              checked={lockOn}
              onChange={toggleLock}
            />

            <SettingsButtonRow
              icon={Fingerprint}
              title="روش‌های ورود"
              subtitle={
                pinOn || bioOn
                  ? `${pinOn ? 'رمز' : ''}${pinOn && bioOn ? ' + ' : ''}${bioOn ? 'اثر انگشت' : ''}`
                  : 'هیچ روشی تنظیم نشده'
              }
              onClick={() => setSheet('lock')}
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsToggleRow
              icon={Bell}
              title="یادآوری ثبت روزانه"
              subtitle={
                reminderOn
                  ? `هر شب ساعت ${formatTime12(reminderTime)}`
                  : 'غیرفعال'
              }
              checked={reminderOn}
              onChange={toggleReminder}
              isLast={!reminderOn}
            />

            {reminderOn && (
              <SettingsButtonRow
                icon={Clock}
                title="زمان یادآوری"
                subtitle={formatTime12(reminderTime)}
                onClick={() => setSheet('reminderTime')}
              />
            )}
          </SettingsGroup>

          <SettingsGroup>{currencyRow}</SettingsGroup>

          <SettingsGroup>
            <SettingsButtonRow
              icon={Database}
              title="پشتیبان‌گیری"
              subtitle="خروجی و بازیابی اطلاعات"
              onClick={() => setSheet('backup')}
            />

            <SettingsButtonRow
              icon={Trash2}
              title="پاک‌سازی همه داده‌ها"
              subtitle="حذف کامل تراکنش‌ها و تنظیمات"
              tone="danger"
              isLast
              onClick={() => setConfirmClear(true)}
            />
          </SettingsGroup>

          {lockOn && (
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E2574C]/20 bg-[#E2574C]/[0.08] py-3.5 text-[13px] font-semibold text-[#E2574C] active:scale-[0.98]"
            >
              <LogOut size={17} strokeWidth={2} />
              خروج از حساب
            </button>
          )}

          <p className="mt-6 text-center text-[10.5px] text-[#5C736C]">
            خزانه • نسخه ۱.۰ • {getTodayShort()}
          </p>
        </div>

        {/* ============================================ */}
        {/* دسکتاپ — گرید ۳ ردیفی با ارتفاع یکسان        */}
        {/* ============================================ */}
        <div className="mt-8 hidden lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-5 lg:gap-y-6">
          {/* ---------- ردیف ۱: حساب کاربری | ترجیحات ---------- */}
          <div className="flex flex-col">
            <SectionTitle>حساب کاربری</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsProfileCard
                name={userName}
                onClick={() => setSheet('profile')}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>ترجیحات</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>{currencyRow}</SettingsGroup>
            </div>
          </div>

          {/* ---------- ردیف ۲: امنیت | داده‌ها ---------- */}
          <div className="flex flex-col">
            <SectionTitle>امنیت</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsToggleRow
                  icon={ShieldCheck}
                  title="قفل برنامه"
                  subtitle={
                    lockOn
                      ? 'برای باز کردن، رمز یا اثر انگشت لازم است'
                      : 'غیرفعال'
                  }
                  checked={lockOn}
                  onChange={toggleLock}
                />
                <SettingsButtonRow
                  icon={Fingerprint}
                  title="روش‌های ورود"
                  subtitle={
                    pinOn || bioOn
                      ? `${pinOn ? 'رمز' : ''}${pinOn && bioOn ? ' + ' : ''}${bioOn ? 'اثر انگشت' : ''}`
                      : 'هیچ روشی تنظیم نشده'
                  }
                  onClick={() => setSheet('lock')}
                  isLast
                />
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>داده‌ها</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsButtonRow
                  icon={Database}
                  title="پشتیبان‌گیری"
                  subtitle="خروجی و بازیابی اطلاعات"
                  onClick={() => setSheet('backup')}
                />
                <SettingsButtonRow
                  icon={Trash2}
                  title="پاک‌سازی همه داده‌ها"
                  subtitle="حذف کامل تراکنش‌ها و تنظیمات"
                  tone="danger"
                  isLast
                  onClick={() => setConfirmClear(true)}
                />
              </SettingsGroup>
            </div>
          </div>

          {/* ---------- ردیف ۳: یادآوری | نصب و خروج ---------- */}
          <div className="flex flex-col">
            <SectionTitle>یادآوری</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsToggleRow
                  icon={Bell}
                  title="یادآوری ثبت روزانه"
                  subtitle={
                    reminderOn
                      ? `هر شب ساعت ${formatTime12(reminderTime)}`
                      : 'غیرفعال'
                  }
                  checked={reminderOn}
                  onChange={toggleReminder}
                  isLast={!reminderOn}
                />
                {reminderOn && (
                  <SettingsButtonRow
                    icon={Clock}
                    title="زمان یادآوری"
                    subtitle={formatTime12(reminderTime)}
                    onClick={() => setSheet('reminderTime')}
                    isLast
                  />
                )}
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>نصب و خروج</SectionTitle>
            <div className="flex flex-1 flex-col gap-3 [&>*]:!mt-0">
              <InstallCard />
              {lockOn && (
                <button
                  type="button"
                  onClick={() => setConfirmLogout(true)}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl border border-[#E2574C]/20 bg-[#E2574C]/[0.08] py-3.5 text-[13px] font-semibold text-[#E2574C] transition-all hover:bg-[#E2574C]/[0.12] active:scale-[0.98]"
                >
                  <LogOut size={17} strokeWidth={2} />
                  خروج از حساب
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ---------- فوتر دسکتاپ ---------- */}
        <p className="mt-10 hidden text-center text-[10.5px] text-[#5C736C] lg:block">
          خزانه • نسخه ۱.۰ • {getTodayShort()}
        </p>
      </div>

      {/* ============================================ */}
      {/* Sheets — مشترک                               */}
      {/* ============================================ */}

      <Sheet
        open={sheet === 'profile'}
        onClose={() => setSheet(null)}
        title="پروفایل"
        subtitle="اطلاعات شخصی"
      >
        <label className="mb-2 block text-[11px] font-medium text-[#8FA39D]">
          نام نمایشی
        </label>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="مثلاً احمد"
          className="w-full rounded-2xl border border-white/[0.07] bg-[#153029] px-4 py-3 text-[13px] text-[#F2EFE9] outline-none placeholder:text-[#5C736C] focus:border-[#E3B341]/40"
        />

        <button
          type="button"
          onClick={saveName}
          className="mt-4 w-full rounded-2xl bg-[linear-gradient(155deg,#E3B341,#B9862A)] py-3.5 text-[13px] font-bold text-[#0A1614] active:scale-[0.98]"
        >
          ذخیره
        </button>
      </Sheet>

      <Sheet
        open={sheet === 'reminderTime'}
        onClose={() => setSheet(null)}
        title="زمان یادآوری"
        subtitle="چه ساعتی یادت بیاورم؟"
      >
        <TimePicker value={reminderTime} onChange={changeReminderTime} />

        <button
          type="button"
          onClick={handleTestReminder}
          className="mt-5 w-full rounded-2xl border border-[#4FD1BE]/30 bg-[#4FD1BE]/[0.08] py-3 text-[12px] font-semibold text-[#4FD1BE] active:scale-[0.98]"
        >
          نمایش آزمایشی یادآوری
        </button>

        <button
          type="button"
          onClick={() => setSheet(null)}
          className="mt-3 w-full rounded-2xl bg-[linear-gradient(155deg,#E3B341,#B9862A)] py-3.5 text-[13px] font-bold text-[#0A1614] active:scale-[0.98]"
        >
          ذخیره
        </button>
      </Sheet>

      <Sheet
        open={sheet === 'lock'}
        onClose={() => {
          if (pinSetupOpen) {
            cancelPinSetup();
          } else {
            setSheet(null);
          }
        }}
        title="امنیت"
        subtitle="قفل برنامه"
      >
        {pinSetupOpen ? (
          <PinSetupFlow onDone={afterPinSet} onCancel={cancelPinSetup} />
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0A1614] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D]">
                <ShieldCheck size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#F2EFE9]">
                  رمز عبور
                </p>
                <div className="mt-1">
                  <StatusBadge active={pinOn} />
                </div>
              </div>

              {pinOn ? (
                <button
                  type="button"
                  onClick={handleClearPin}
                  className="shrink-0 rounded-xl bg-[#E2574C]/[0.10] px-3 py-2 text-[11px] font-semibold text-[#E2574C]"
                >
                  حذف
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setPinSetupFromToggle(false);
                    setPinSetupOpen(true);
                  }}
                  className="shrink-0 rounded-xl bg-[#E3B341]/[0.14] px-3 py-2 text-[11px] font-semibold text-[#E3B341]"
                >
                  تنظیم
                </button>
              )}
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0A1614] p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D]">
                <Fingerprint size={19} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[13px] font-semibold text-[#F2EFE9]">
                  اثر انگشت / Face ID
                </p>
                <div className="mt-1">
                  {bioChecking ? (
                    <span className="text-[10px] text-[#5C736C]">
                      در حال بررسی...
                    </span>
                  ) : (
                    <StatusBadge
                      active={bioOn}
                      inactiveLabel={
                        bioAvailable === false ? 'پشتیبانی نمی‌شود' : 'غیرفعال'
                      }
                    />
                  )}
                </div>
              </div>

              {bioOn ? (
                <button
                  type="button"
                  onClick={handleClearBiometric}
                  className="shrink-0 rounded-xl bg-[#E2574C]/[0.10] px-3 py-2 text-[11px] font-semibold text-[#E2574C]"
                >
                  حذف
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || bioChecking}
                  onClick={handleRegisterBiometric}
                  className="shrink-0 rounded-xl bg-[#E3B341]/[0.14] px-3 py-2 text-[11px] font-semibold text-[#E3B341] disabled:opacity-40"
                >
                  {busy ? '...' : bioChecking ? '...' : 'فعال‌سازی'}
                </button>
              )}
            </div>

            <p className="pt-1 text-center text-[10.5px] leading-relaxed text-[#5C736C]">
              همه‌ی اطلاعات فقط روی همین دستگاه ذخیره می‌شود و هیچ‌گاه به سرور
              فرستاده نمی‌شود.
            </p>
          </div>
        )}
      </Sheet>

      <Sheet
        open={sheet === 'currency'}
        onClose={() => setSheet(null)}
        title="واحد پول"
        subtitle="واحد نمایش مبالغ"
      >
        <div className="space-y-2">
          {CURRENCY_OPTIONS.map((opt) => {
            const isActive = opt.label === currency;
            return (
              <button
                key={opt.code}
                type="button"
                onClick={() => changeCurrency(opt.label)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-right transition-all',
                  isActive
                    ? 'border-[#E3B341]/40 bg-[#E3B341]/[0.10]'
                    : 'border-white/[0.06] bg-[#153029] active:scale-[0.99]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#0F211E] text-[16px] font-bold text-[#E3B341]">
                    {opt.symbol}
                  </span>
                  <div>
                    <p className="text-[13px] font-semibold text-[#F2EFE9]">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-[10.5px] text-[#5C736C]">
                      {opt.code}
                    </p>
                  </div>
                </div>

                {isActive && (
                  <span className="text-[11px] font-bold text-[#E3B341]">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      <Sheet
        open={sheet === 'backup'}
        onClose={() => setSheet(null)}
        title="پشتیبان‌گیری"
        subtitle="خروجی و بازیابی"
      >
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExport}
            className="flex w-full items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#153029] p-4 text-right active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#4FD1BE]/10 text-[#4FD1BE]">
              <Database size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#F2EFE9]">
                خروجی گرفتن
              </p>
              <p className="mt-1 text-[11px] text-[#5C736C]">
                ذخیره‌ی همه‌ی تراکنش‌ها در یک فایل JSON
              </p>
            </div>
          </button>

          <label className="flex w-full cursor-pointer items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#153029] p-4 active:scale-[0.99]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E3B341]/10 text-[#E3B341]">
              <Database size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-[#F2EFE9]">
                بازیابی از فایل
              </p>
              <p className="mt-1 text-[11px] text-[#5C736C]">
                ⚠ همه‌ی داده‌های فعلی جایگزین می‌شوند
              </p>
            </div>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      </Sheet>

      <Sheet
        open={confirmClear}
        onClose={() => setConfirmClear(false)}
        title="پاک‌سازی همه‌ی داده‌ها"
        subtitle="این عملیات قابل بازگشت نیست"
      >
        <p className="rounded-2xl border border-[#E2574C]/20 bg-[#E2574C]/[0.08] p-4 text-[12px] leading-relaxed text-[#E2574C]">
          تمام تراکنش‌ها، دسته‌بندی‌ها و تنظیمات شما برای همیشه حذف می‌شود.
          توصیه می‌کنیم قبل از این کار پشتیبان تهیه کنید.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmClear(false)}
            className="rounded-2xl border border-white/[0.08] bg-[#153029] py-3.5 text-[12.5px] font-semibold text-[#8FA39D]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleClearAll}
            className="rounded-2xl bg-[linear-gradient(155deg,#E2574C,#B8392F)] py-3.5 text-[12.5px] font-bold text-white"
          >
            بله، پاک کن
          </button>
        </div>
      </Sheet>

      <Sheet
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="خروج از حساب"
        subtitle="بعد از خروج باید دوباره وارد شوید"
      >
        <p className="rounded-2xl border border-white/[0.06] bg-[#153029] p-4 text-[12px] leading-relaxed text-[#8FA39D]">
          با خروج از حساب، برنامه بلافاصله قفل می‌شود و برای ورود دوباره به{' '}
          {pinOn ? 'رمز عبور' : ''}
          {pinOn && bioOn ? ' یا ' : ''}
          {bioOn ? 'اثر انگشت' : ''} نیاز خواهید داشت.
        </p>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmLogout(false)}
            className="rounded-2xl border border-white/[0.08] bg-[#153029] py-3.5 text-[12.5px] font-semibold text-[#8FA39D]"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 rounded-2xl bg-[linear-gradient(155deg,#E2574C,#B8392F)] py-3.5 text-[12.5px] font-bold text-white"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </Sheet>

      {toast && (
        <div className="pointer-events-none fixed bottom-[100px] left-1/2 z-[200] max-w-[90vw] -translate-x-1/2">
          <div className="rounded-2xl border border-white/[0.08] bg-[#153029] px-4 py-2.5 text-center text-[12px] font-medium text-[#F2EFE9] shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

export default SettingsPage;