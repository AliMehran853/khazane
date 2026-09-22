import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Clock,
  Coins,
  Database,
  Fingerprint,
  LogOut,
  RotateCcw,
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
import AboutCard from '../settings/AboutCard';
import AboutModal from '../settings/AboutModal';
import PinPad from '../lock/PinPad';

import { useAppStore } from '../store/appStore';
import { useSecurityStore } from '../store/securityStore';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useBiometricCheck } from '../hooks/useBiometricCheck';
import { useHaptic } from '../hooks/useHaptic';
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
  resetApp,
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

import { CURRENCY_OPTIONS, APP_VERSION, PIN_LENGTH } from '../utils/constants';
import { getTodayShort } from '../utils/dates';
import { formatTime12FromString, parseTime24, toTime24 } from '../utils/formatting';
import { lockBody } from '../utils/scrollLock';

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

  function Option({ active, onClick, children }) {
    return (
      <button
        type="button"
        onClick={onClick}
        className={[
          'flex h-11 items-center justify-center rounded-xl border text-base font-bold backdrop-blur-md transition-all active:scale-95',
          active
            ? 'border-primary/50 bg-primary/[0.14] text-primary'
            : 'border-border-1 bg-fill-1 text-fg-2',
        ].join(' ')}
      >
        {children}
      </button>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-2 text-xs font-medium text-fg-2">ساعت</p>
        <div className="grid grid-cols-4 gap-2">
          {hours.map((h) => (
            <Option key={h} active={h === hour} onClick={() => setHour(h)}>
              {h}
            </Option>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fg-2">دقیقه</p>
        <div className="grid grid-cols-4 gap-2">
          {minutes.map((m) => (
            <Option key={m} active={m === minute} onClick={() => setMinute(m)}>
              {String(m).padStart(2, '0')}
            </Option>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fg-2">نوبت</p>
        <div className="grid grid-cols-2 gap-2">
          {['صبح', 'شب'].map((p) => (
            <Option key={p} active={p === period} onClick={() => setPeriod(p)}>
              {p}
            </Option>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/[0.08] p-4 text-center backdrop-blur-md">
        <p className="text-xs text-fg-2">زمان یادآوری</p>
        <p className="mt-1 text-2xl font-extrabold text-primary">
          {formatTime12FromString(value)}
        </p>
      </div>
    </div>
  );
}

function PinSetupFlow({ onDone, onCancel }) {
  const [step, setStep] = useState('enter');
  const [firstPin, setFirstPin] = useState('');
  const [pinValue, setPinValue] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

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
      <p className="text-md font-bold text-fg-1">
        {step === 'enter' ? 'رمز جدید را وارد کنید' : 'رمز را دوباره وارد کنید'}
      </p>
      <p className="mt-1.5 text-xs text-fg-3">
        {step === 'enter' ? '۴ رقم دلخواه' : 'برای اطمینان، تکرار کنید'}
      </p>

      <div className="mt-5 flex items-center gap-3" dir="ltr">
        {Array.from({ length: PIN_LENGTH }).map((_, i) => (
          <div
            key={i}
            className={[
              'h-3.5 w-3.5 rounded-full transition-all duration-200',
              i < pinValue.length
                ? 'scale-100 bg-primary'
                : 'scale-90 bg-fill-3',
            ].join(' ')}
          />
        ))}
      </div>

      <div className="h-6">
        {error && <p className="mt-2 text-xs text-expense">{error}</p>}
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
        className="mt-5 text-sm font-semibold text-fg-2"
      >
        انصراف
      </button>
    </div>
  );
}

function Sheet({ open, onClose, title, subtitle, children }) {
  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="kh-modal-overlay fixed inset-0 z-[100]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ duration: 0.34, ease: [0.32, 0.72, 0, 1] }}
            className="glass-strong fixed inset-x-3 bottom-3 z-[110] mx-auto flex max-h-[88svh] w-auto max-w-[420px] flex-col overflow-hidden rounded-3xl outline-none lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:max-h-[85vh] lg:w-full lg:max-w-[520px] lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="shrink-0 px-4 pt-3 pb-3 lg:px-6 lg:pt-4 lg:pb-4">
              <div className="kh-drag-handle lg:hidden" />
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  {subtitle && (
                    <p className="text-xs text-fg-3 lg:text-sm">{subtitle}</p>
                  )}
                  <h2 className="mt-0.5 text-xl font-bold text-fg-1 lg:text-2xl">
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="kh-close-btn lg:h-10 lg:w-10"
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

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-3">
      {children}
    </h2>
  );
}

function SettingsPage() {
  const dataVersion = useAppStore((s) => s.dataVersion);
  const refreshData = useAppStore((s) => s.refreshData);
  const haptic = useHaptic();

  const setLocked = useSecurityStore((s) => s.setLocked);
  const resetSecurity = useSecurityStore((s) => s.reset);
  const setMethod = useSecurityStore((s) => s.setMethod);
  const setPinEnabledInStore = useSecurityStore((s) => s.setPinEnabled);
  const setBiometricEnabledInStore = useSecurityStore((s) => s.setBiometricEnabled);
  const setBiometricAvailableInStore = useSecurityStore((s) => s.setBiometricAvailable);

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
  const [confirmReset, setConfirmReset] = useState(false);
  const [resetting, setResetting] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [aboutOpen, setAboutOpen] = useState(false);

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
    refreshData();
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
      } catch {
        showToast('فعال‌سازی قفل ناموفق بود.');
      }
    } else {
      try {
        await setLockEnabled(false);
        setLocalLock(false);
        showToast('قفل برنامه غیرفعال شد.');
      } catch {
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
    setPinEnabledInStore(true);
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
          'اثر انگشت روی این دستگاه فعال نیست. در تنظیمات گوشی، قفل صفحه و اثر انگشت را فعال کن.',
        );
      }

      await registerBiometric();
      setLocalBio(true);
      setLocalLock(true);
      await setLockEnabled(true);
      setBiometricEnabledInStore(true);
      setBiometricAvailableInStore(true);
      showToast('اثر انگشت فعال شد.');
    } catch (err) {
      let message = err?.message || 'ثبت اثر انگشت ناموفق بود.';
      if (err?.name === 'NotAllowedError') message = 'لغو شد یا اجازه داده نشد.';
      else if (err?.name === 'NotSupportedError')
        message = 'این دستگاه از اثر انگشت پشتیبانی نمی‌کند.';
      else if (err?.name === 'InvalidStateError')
        message = 'اثر انگشت قبلاً روی این دستگاه ثبت شده است.';
      showToast(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearBiometric() {
    await clearBiometric();
    setLocalBio(false);
    setBiometricEnabledInStore(false);
    showToast('اثر انگشت حذف شد.');
  }

  async function handleClearPin() {
    await clearPin();
    setLocalPin(false);
    setPinEnabledInStore(false);
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
    } catch {
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

  async function handleResetApp() {
    setResetting(true);
    haptic.warning();
    try {
      await resetApp();
      window.location.reload();
    } catch (err) {
      console.error(err);
      setResetting(false);
      showToast('شروع مجدد ناموفق بود.');
    }
  }

  async function handleLogout() {
    setConfirmLogout(false);
    setSheet(null);
    sessionStorage.removeItem(SESSION_UNLOCK_KEY);
    resetSecurity();
    setPinEnabledInStore(pinOn);
    setBiometricEnabledInStore(bioOn);
    setBiometricAvailableInStore(bioAvailable);
    const useBio = bioOn && bioAvailable;
    setMethod(useBio ? 'biometric' : 'pin');
    setLocked(true);
  }

  async function handleTestReminder() {
    setSheet(null);
    await forceShowReminder();
  }

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
          <p className="kh-page-subtitle">شخصی‌سازی برنامه</p>
          <h1 className="kh-page-title">تنظیمات</h1>
        </header>

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
              isLast
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsToggleRow
              icon={Bell}
              title="یادآوری ثبت روزانه"
              subtitle={
                reminderOn
                  ? `هر شب ساعت ${formatTime12FromString(reminderTime)}`
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
                subtitle={formatTime12FromString(reminderTime)}
                onClick={() => setSheet('reminderTime')}
                isLast
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
              icon={RotateCcw}
              title="پاک‌سازی و شروع مجدد"
              subtitle="همه‌چیز از صفر — مثل اولین نصب"
              tone="danger"
              onClick={() => setConfirmReset(true)}
            />
            <AboutCard onClick={() => setAboutOpen(true)} isLast />
          </SettingsGroup>

          {lockOn && (
            <button
              type="button"
              onClick={() => setConfirmLogout(true)}
              className="glass mt-4 flex w-full items-center justify-center gap-2 rounded-2xl border-expense/25 py-3.5 text-base font-semibold text-expense active:scale-[0.98]"
            >
              <LogOut size={17} strokeWidth={2} />
              خروج از حساب
            </button>
          )}

          <p className="mt-6 text-center text-2xs text-fg-3">
            خزانه • نسخه {APP_VERSION} • {getTodayShort()}
          </p>
        </div>

        {/* Desktop */}
        <div className="mt-8 hidden lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-5 lg:gap-y-6">
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
                  icon={RotateCcw}
                  title="پاک‌سازی و شروع مجدد"
                  subtitle="همه‌چیز از صفر — مثل اولین نصب"
                  tone="danger"
                  onClick={() => setConfirmReset(true)}
                />
                <AboutCard onClick={() => setAboutOpen(true)} isLast />
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>یادآوری</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsToggleRow
                  icon={Bell}
                  title="یادآوری ثبت روزانه"
                  subtitle={
                    reminderOn
                      ? `هر شب ساعت ${formatTime12FromString(reminderTime)}`
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
                    subtitle={formatTime12FromString(reminderTime)}
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
                  className="glass flex w-full items-center justify-center gap-2 rounded-2xl border-expense/25 py-3.5 text-base font-semibold text-expense transition-all hover:border-expense/40 active:scale-[0.98]"
                >
                  <LogOut size={17} strokeWidth={2} />
                  خروج از حساب
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-10 hidden text-center text-2xs text-fg-3 lg:block">
          خزانه • نسخه {APP_VERSION} • {getTodayShort()}
        </p>
      </div>

      <Sheet
        open={sheet === 'profile'}
        onClose={() => setSheet(null)}
        title="پروفایل"
        subtitle="اطلاعات شخصی"
      >
        <label className="mb-2 block text-xs font-medium text-fg-2">
          نام نمایشی
        </label>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder="مثلاً احمد"
          className="glass-inner w-full rounded-2xl px-4 py-3 text-base text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
        />

        <p className="mt-2 text-2xs leading-relaxed text-fg-3">
          نام نمایشی برای پیام‌های خوش‌آمدگویی و پروفایل استفاده می‌شود.
        </p>

        <button
          type="button"
          onClick={saveName}
          className="kh-btn kh-btn-primary mt-4 w-full py-3.5 text-base"
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
          className="mt-5 w-full rounded-2xl border border-primary/30 bg-primary/[0.10] py-3 text-sm font-semibold text-primary backdrop-blur-md active:scale-[0.98]"
        >
          نمایش آزمایشی یادآوری
        </button>

        <button
          type="button"
          onClick={() => setSheet(null)}
          className="kh-btn kh-btn-primary mt-3 w-full py-3.5 text-base"
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
            <div className="glass-inner flex items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-fg-2">
                <ShieldCheck size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-fg-1">
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
                  className="shrink-0 rounded-xl bg-expense/[0.12] px-3 py-2 text-xs font-semibold text-expense"
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
                  className="shrink-0 rounded-xl bg-primary/[0.16] px-3 py-2 text-xs font-semibold text-primary"
                >
                  تنظیم
                </button>
              )}
            </div>

            <div className="glass-inner flex items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-fg-2">
                <Fingerprint size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-fg-1">
                  اثر انگشت / Face ID
                </p>
                <div className="mt-1">
                  {bioChecking ? (
                    <span className="text-2xs text-fg-3">در حال بررسی...</span>
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
                  className="shrink-0 rounded-xl bg-expense/[0.12] px-3 py-2 text-xs font-semibold text-expense"
                >
                  حذف
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || bioChecking}
                  onClick={handleRegisterBiometric}
                  className="shrink-0 rounded-xl bg-primary/[0.16] px-3 py-2 text-xs font-semibold text-primary disabled:opacity-40"
                >
                  {busy || bioChecking ? '...' : 'فعال‌سازی'}
                </button>
              )}
            </div>

            <p className="pt-1 text-center text-2xs leading-relaxed text-fg-3">
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
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-right backdrop-blur-md transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/[0.12]'
                    : 'border-border-1 bg-fill-1 active:scale-[0.99]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-lg font-bold text-primary">
                    {opt.symbol}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-fg-1">
                      {opt.label}
                    </p>
                    <p className="mt-0.5 text-2xs text-fg-3">{opt.code}</p>
                  </div>
                </div>
                {isActive && (
                  <span className="text-xs font-bold text-primary">✓</span>
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
            className="glass-inner flex w-full items-center gap-3 rounded-2xl p-4 text-right active:scale-[0.99]"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.14] text-primary">
              <Database size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-fg-1">
                خروجی گرفتن
              </p>
              <p className="mt-1 text-xs text-fg-3">
                ذخیره‌ی همه‌ی تراکنش‌ها در یک فایل JSON
              </p>
            </div>
          </button>

          <label className="glass-inner flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 active:scale-[0.99]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.14] text-primary">
              <Database size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-fg-1">
                بازیابی از فایل
              </p>
              <p className="mt-1 text-xs text-fg-3">
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
        open={confirmReset}
        onClose={() => (resetting ? null : setConfirmReset(false))}
        title="پاک‌سازی و شروع مجدد"
        subtitle="همه‌چیز مثل اولین نصب"
      >
        <p className="rounded-2xl border border-expense/25 bg-expense/[0.10] p-4 text-sm leading-relaxed text-expense backdrop-blur-md">
          با این کار{' '}
          <span className="font-bold">
            همه‌ی تراکنش‌ها، دسته‌بندی‌ها، تنظیمات، پروفایل، قفل، یادآوری‌ها و
            پشتیبان‌ها
          </span>{' '}
          پاک می‌شود و برنامه کاملاً از نو شروع می‌شود.
        </p>

        <div className="glass-inner mt-4 rounded-2xl p-4">
          <p className="text-xs leading-relaxed text-fg-2">
            بعد از این کار دوباره سؤال‌های اولیه پرسیده می‌شود — دقیقاً انگار
            همین حالا اپ رو نصب کرده‌ای.
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={resetting}
            onClick={() => setConfirmReset(false)}
            className="kh-btn kh-btn-ghost py-3.5 text-sm"
          >
            انصراف
          </button>
          <button
            type="button"
            disabled={resetting}
            onClick={handleResetApp}
            className="kh-btn kh-btn-danger flex items-center justify-center gap-2 py-3.5 text-sm"
          >
            {resetting ? (
              '...'
            ) : (
              <>
                <RotateCcw size={14} />
                بله، شروع مجدد
              </>
            )}
          </button>
        </div>
      </Sheet>

      <Sheet
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title="خروج از حساب"
        subtitle="بعد از خروج باید دوباره وارد شوید"
      >
        <p className="glass-inner rounded-2xl p-4 text-sm leading-relaxed text-fg-2">
          با خروج از حساب، برنامه بلافاصله قفل می‌شود و برای ورود دوباره به{' '}
          {pinOn ? 'رمز عبور' : ''}
          {pinOn && bioOn ? ' یا ' : ''}
          {bioOn ? 'اثر انگشت' : ''} نیاز خواهید داشت.
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmLogout(false)}
            className="kh-btn kh-btn-ghost py-3.5 text-sm"
          >
            انصراف
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="kh-btn kh-btn-danger flex items-center justify-center gap-2 py-3.5 text-sm"
          >
            <LogOut size={16} />
            خروج
          </button>
        </div>
      </Sheet>

      <AboutModal open={aboutOpen} onClose={() => setAboutOpen(false)} />

      {toast && (
        <div className="pointer-events-none fixed bottom-[100px] left-1/2 z-[200] max-w-[90vw] -translate-x-1/2">
          <div className="glass-strong rounded-2xl px-4 py-2.5 text-center text-sm font-medium text-fg-1 shadow-lg">
            {toast}
          </div>
        </div>
      )}
    </>
  );
}

export default SettingsPage;