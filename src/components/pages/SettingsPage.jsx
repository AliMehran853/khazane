import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Clock,
  Coins,
  Database,
  Fingerprint,
  Globe,
  LogOut,
  Languages,
  RotateCcw,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
import { useCurrencyLabel } from '../hooks/useCurrencyLabel';

import {
  getUserName,
  setUserName,
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

import {
  getCurrentRegionId,
  getCurrentLanguage,
  getCurrentCurrencyCode,
  updateLanguage,
  updateRegion,
  changeCurrencyWithReset,
  countTransactions,
} from '../../services/regionService';

import { REGIONS, REGION_ORDER } from '../../config/regions';
import { APP_VERSION, PIN_LENGTH } from '../utils/constants';
import { getTodayShort } from '../utils/dates';
import {
  formatTime12FromString,
  parseTime24,
  toTime24,
} from '../utils/formatting';
import { lockBody } from '../utils/scrollLock';

/* ============================================================
   Time Picker
   ============================================================ */

function TimePicker({ value, onChange }) {
  const { t } = useTranslation();
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
        <p className="mb-2 text-xs font-medium text-fg-2">
          {t('reminder.hour')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {hours.map((h) => (
            <Option key={h} active={h === hour} onClick={() => setHour(h)}>
              {h}
            </Option>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fg-2">
          {t('reminder.minute')}
        </p>
        <div className="grid grid-cols-4 gap-2">
          {minutes.map((m) => (
            <Option key={m} active={m === minute} onClick={() => setMinute(m)}>
              {String(m).padStart(2, '0')}
            </Option>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-medium text-fg-2">
          {t('reminder.period')}
        </p>
        <div className="grid grid-cols-2 gap-2">
          {['morning', 'night'].map((p) => (
            <Option key={p} active={p === period} onClick={() => setPeriod(p)}>
              {t(`reminder.${p}`)}
            </Option>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-primary/25 bg-primary/[0.08] p-4 text-center backdrop-blur-md">
        <p className="text-xs text-fg-2">{t('reminder.displayTime')}</p>
        <p className="mt-1 text-2xl font-extrabold text-primary">
          {formatTime12FromString(value)}
        </p>
      </div>
    </div>
  );
}

/* ============================================================
   PIN Setup Flow
   ============================================================ */

function PinSetupFlow({ onDone, onCancel }) {
  const { t } = useTranslation();
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
              setError(err?.message || t('security.pinSaveFailed'));
              setPinValue('');
              setFirstPin('');
              setStep('enter');
            }
          } else {
            setError(t('security.pinMismatch'));
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
        {step === 'enter' ? t('security.pinNew') : t('security.pinConfirm')}
      </p>
      <p className="mt-1.5 text-xs text-fg-3">
        {step === 'enter'
          ? t('security.pinEnterHint')
          : t('security.pinConfirmHint')}
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
        {t('common.cancel')}
      </button>
    </div>
  );
}

/* ============================================================
   Sheet (Modal wrapper)
   ============================================================ */

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
                  aria-label="close"
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

/* ============================================================
   Section Title
   ============================================================ */

function SectionTitle({ children }) {
  return (
    <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-fg-3">
      {children}
    </h2>
  );
}

/* ============================================================
   Currency Change Warning
   ============================================================ */

function CurrencyChangeWarning({ open, onClose, onConfirm, fromCode, toCode, count }) {
  const { t } = useTranslation();

  if (!open) return null;

  return (
    <Sheet
      open={open}
      onClose={onClose}
      title={t('currencyChange.title')}
      subtitle={t('currencyChange.subtitle')}
    >
      <p className="rounded-2xl border border-expense/25 bg-expense/[0.10] p-4 text-sm leading-relaxed text-expense backdrop-blur-md">
        {t('currencyChange.warningMessage', {
          from: t(`currencies.${fromCode}.label`),
          to: t(`currencies.${toCode}.label`),
          count,
        })}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onClose}
          className="kh-btn kh-btn-ghost py-3.5 text-sm"
        >
          {t('currencyChange.cancel')}
        </button>
        <button
          type="button"
          onClick={onConfirm}
          className="kh-btn kh-btn-danger flex items-center justify-center gap-2 py-3.5 text-sm"
        >
          {t('currencyChange.confirm')}
        </button>
      </div>
    </Sheet>
  );
}

/* ============================================================
   Main Settings Page
   ============================================================ */

function SettingsPage() {
  const { t } = useTranslation();
  const dataVersion = useAppStore((s) => s.dataVersion);
  const refreshData = useAppStore((s) => s.refreshData);
  const haptic = useHaptic();

  const currencyLabel = useCurrencyLabel();

  const setLocked = useSecurityStore((s) => s.setLocked);
  const resetSecurity = useSecurityStore((s) => s.reset);
  const setMethod = useSecurityStore((s) => s.setMethod);
  const setPinEnabledInStore = useSecurityStore((s) => s.setPinEnabled);
  const setBiometricEnabledInStore = useSecurityStore((s) => s.setBiometricEnabled);
  const setBiometricAvailableInStore = useSecurityStore((s) => s.setBiometricAvailable);

  const { forceShow: forceShowReminder } = useDailyReminder();
  const { available: bioAvailable, checking: bioChecking } = useBiometricCheck();

  const [userName, setLocalName] = useState('');
  const [language, setLocalLanguage] = useState('fa');
  const [regionId, setLocalRegionId] = useState('afghan');
  const [currencyCode, setLocalCurrencyCode] = useState('AFN');
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
  const [currencyWarning, setCurrencyWarning] = useState(null);

  async function loadAll() {
    const [
      name,
      lang,
      reg,
      curr,
      remOn,
      remTime,
      lockState,
      pinState,
      bioState,
    ] = await Promise.all([
      getUserName(),
      getCurrentLanguage(),
      getCurrentRegionId(),
      getCurrentCurrencyCode(),
      isReminderEnabled(),
      getReminderTime(),
      isLockEnabled(),
      isPinEnabled(),
      isBiometricEnabled(),
    ]);
    setLocalName(name);
    setLocalLanguage(lang);
    setLocalRegionId(reg);
    setLocalCurrencyCode(curr);
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
    showToast(t('profile.saveSuccess'));
    refreshData();
  }

  /* ---------- Language ---------- */

  async function handleChangeLanguage(lang) {
    if (lang === language) {
      setSheet(null);
      return;
    }
    await updateLanguage(lang);
    setLocalLanguage(lang);
    setSheet(null);
    showToast(t('languageChange.changed'));
    // reload page to apply font/direction changes fully
    setTimeout(() => window.location.reload(), 400);
  }

  /* ---------- Region ---------- */

  async function handleChangeRegion(newRegionId) {
    if (newRegionId === regionId) {
      setSheet(null);
      return;
    }
    const region = REGIONS[newRegionId];
    // if currency differs → need backup + reset
    if (region.currency !== currencyCode) {
      const count = await countTransactions();
      setCurrencyWarning({
        type: 'region',
        from: currencyCode,
        to: region.currency,
        regionId: newRegionId,
        count,
      });
      setSheet(null);
      return;
    }
    await updateRegion(newRegionId);
    setLocalRegionId(newRegionId);
    setSheet(null);
    showToast(t('languageChange.changed'));
    setTimeout(() => window.location.reload(), 400);
  }

  /* ---------- Currency ---------- */

  async function handleChangeCurrency(newCode) {
    if (newCode === currencyCode) {
      setSheet(null);
      return;
    }
    const count = await countTransactions();
    setCurrencyWarning({
      type: 'currency',
      from: currencyCode,
      to: newCode,
      count,
    });
    setSheet(null);
  }

  async function confirmCurrencyChange() {
    if (!currencyWarning) return;
    const { to, regionId: newRegionId, type } = currencyWarning;
    setCurrencyWarning(null);
    setBusy(true);

    try {
      if (type === 'region' && newRegionId) {
        // region change + currency change → do full reset with new currency
        await changeCurrencyWithReset(to);
        await updateRegion(newRegionId);
      } else {
        await changeCurrencyWithReset(to);
      }
      showToast(t('currencyChange.changed'));
      setTimeout(() => window.location.reload(), 600);
    } catch (err) {
      console.error(err);
      showToast(t('errors.generic'));
      setBusy(false);
    }
  }

  /* ---------- Reminder ---------- */

  async function toggleReminder(next) {
    setLocalReminder(next);
    await setReminderEnabled(next);
    showToast(next ? t('reminder.enabled') : t('reminder.disabled'));
  }

  async function changeReminderTime(time) {
    setLocalReminderTime(time);
    await setReminderTime(time);
  }

  /* ---------- Lock ---------- */

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
        showToast(t('security.lockEnabled'));
      } catch {
        showToast(t('security.lockEnableFailed'));
      }
    } else {
      try {
        await setLockEnabled(false);
        setLocalLock(false);
        showToast(t('security.lockDisabled'));
      } catch {
        showToast(t('security.lockDisableFailed'));
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
    showToast(t('security.pinSetAndLocked'));
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
        throw new Error(t('security.biometricNotSupported'));
      }
      const available = await window.PublicKeyCredential
        .isUserVerifyingPlatformAuthenticatorAvailable()
        .catch(() => false);

      if (!available) {
        throw new Error(t('security.biometricNotAvailable'));
      }

      await registerBiometric();
      setLocalBio(true);
      setLocalLock(true);
      await setLockEnabled(true);
      setBiometricEnabledInStore(true);
      setBiometricAvailableInStore(true);
      showToast(t('security.biometricEnabled'));
    } catch (err) {
      let message = err?.message || t('security.biometricRegisterFailed');
      if (err?.name === 'NotAllowedError') message = t('security.biometricCancelled');
      else if (err?.name === 'NotSupportedError')
        message = t('security.biometricDeviceNotSupported');
      else if (err?.name === 'InvalidStateError')
        message = t('security.biometricAlreadyRegistered');
      showToast(message);
    } finally {
      setBusy(false);
    }
  }

  async function handleClearBiometric() {
    await clearBiometric();
    setLocalBio(false);
    setBiometricEnabledInStore(false);
    showToast(t('security.biometricRemoved'));
  }

  async function handleClearPin() {
    await clearPin();
    setLocalPin(false);
    setPinEnabledInStore(false);
    if (!bioOn) {
      await setLockEnabled(false);
      setLocalLock(false);
    }
    showToast(t('security.pinRemoved'));
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
      showToast(t('backup.exportSuccess'));
    } catch {
      showToast(t('backup.exportFailed'));
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
      showToast(t('backup.importSuccess'));
    } catch (err) {
      showToast(err?.message || t('backup.importInvalid'));
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
      showToast(t('reset.failed'));
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

  /* ---------- Subscriptions ---------- */

  const currentRegion = REGIONS[regionId];

  const languageRow = (
    <SettingsButtonRow
      icon={Languages}
      title={t('settings.language')}
      subtitle={t(`languages.${language}`)}
      onClick={() => setSheet('language')}
    />
  );

  const regionRow = (
    <SettingsButtonRow
      icon={Globe}
      title={t('settings.region')}
      subtitle={t(`regionSelection.${regionId}.title`)}
      onClick={() => setSheet('region')}
    />
  );

  const currencyRow = (
    <SettingsButtonRow
      icon={Coins}
      title={t('settings.currency')}
      subtitle={currencyLabel}
      onClick={() => setSheet('currency')}
      isLast
    />
  );

  const loginMethodsSubtitle = () => {
    if (!pinOn && !bioOn) return t('settings.noLoginMethod');
    const parts = [];
    if (pinOn) parts.push(t('settings.loginPin'));
    if (bioOn) parts.push(t('settings.loginBiometric'));
    return parts.join(' + ');
  };

  const lockSubtitle = lockOn ? t('settings.appLockOn') : t('settings.appLockOff');
  const reminderSubtitle = reminderOn
    ? t('settings.reminderEveryNight', {
        time: formatTime12FromString(reminderTime),
      })
    : t('common.no');

  return (
    <>
      <div className="px-4 pb-6 pt-6 lg:mx-auto lg:max-w-[1100px] lg:px-8 lg:pb-12 lg:pt-8">
        <header>
          <p className="kh-page-subtitle">{t('settings.subtitle')}</p>
          <h1 className="kh-page-title">{t('settings.title')}</h1>
        </header>

        <div className="lg:hidden">
          <InstallCard />
          <SettingsProfileCard
            name={userName}
            onClick={() => setSheet('profile')}
          />

          <SettingsGroup>
            {languageRow}
            {regionRow}
            {currencyRow}
          </SettingsGroup>

          <SettingsGroup>
            <SettingsToggleRow
              icon={ShieldCheck}
              title={t('settings.appLock')}
              subtitle={lockSubtitle}
              checked={lockOn}
              onChange={toggleLock}
            />
            <SettingsButtonRow
              icon={Fingerprint}
              title={t('settings.loginMethods')}
              subtitle={loginMethodsSubtitle()}
              onClick={() => setSheet('lock')}
              isLast
            />
          </SettingsGroup>

          <SettingsGroup>
            <SettingsToggleRow
              icon={Bell}
              title={t('settings.dailyReminder')}
              subtitle={reminderSubtitle}
              checked={reminderOn}
              onChange={toggleReminder}
              isLast={!reminderOn}
            />
            {reminderOn && (
              <SettingsButtonRow
                icon={Clock}
                title={t('settings.reminderTime')}
                subtitle={formatTime12FromString(reminderTime)}
                onClick={() => setSheet('reminderTime')}
                isLast
              />
            )}
          </SettingsGroup>

          <SettingsGroup>
            <SettingsButtonRow
              icon={Database}
              title={t('settings.backup')}
              subtitle={t('settings.backupSubtitle')}
              onClick={() => setSheet('backup')}
            />
            <SettingsButtonRow
              icon={RotateCcw}
              title={t('settings.resetApp')}
              subtitle={t('settings.resetAppSubtitle')}
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
              {t('settings.logout')}
            </button>
          )}

          <p className="mt-6 text-center text-2xs text-fg-3">
            {t('settings.footer', {
              appName: t('app.name'),
              version: APP_VERSION,
              date: getTodayShort(),
            })}
          </p>
        </div>

        {/* Desktop */}
        <div className="mt-8 hidden lg:grid lg:grid-cols-2 lg:items-stretch lg:gap-x-5 lg:gap-y-6">
          <div className="flex flex-col">
            <SectionTitle>{t('settings.accountSection')}</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsProfileCard
                name={userName}
                onClick={() => setSheet('profile')}
              />
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>{t('settings.preferencesSection')}</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                {languageRow}
                {regionRow}
                {currencyRow}
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>{t('settings.securitySection')}</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsToggleRow
                  icon={ShieldCheck}
                  title={t('settings.appLock')}
                  subtitle={lockSubtitle}
                  checked={lockOn}
                  onChange={toggleLock}
                />
                <SettingsButtonRow
                  icon={Fingerprint}
                  title={t('settings.loginMethods')}
                  subtitle={loginMethodsSubtitle()}
                  onClick={() => setSheet('lock')}
                  isLast
                />
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>{t('settings.dataSection')}</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsButtonRow
                  icon={Database}
                  title={t('settings.backup')}
                  subtitle={t('settings.backupSubtitle')}
                  onClick={() => setSheet('backup')}
                />
                <SettingsButtonRow
                  icon={RotateCcw}
                  title={t('settings.resetApp')}
                  subtitle={t('settings.resetAppSubtitle')}
                  tone="danger"
                  onClick={() => setConfirmReset(true)}
                />
                <AboutCard onClick={() => setAboutOpen(true)} isLast />
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>{t('settings.reminderSection')}</SectionTitle>
            <div className="flex-1 [&>*]:!mt-0 [&>*]:h-full">
              <SettingsGroup>
                <SettingsToggleRow
                  icon={Bell}
                  title={t('settings.dailyReminder')}
                  subtitle={reminderSubtitle}
                  checked={reminderOn}
                  onChange={toggleReminder}
                  isLast={!reminderOn}
                />
                {reminderOn && (
                  <SettingsButtonRow
                    icon={Clock}
                    title={t('settings.reminderTime')}
                    subtitle={formatTime12FromString(reminderTime)}
                    onClick={() => setSheet('reminderTime')}
                    isLast
                  />
                )}
              </SettingsGroup>
            </div>
          </div>

          <div className="flex flex-col">
            <SectionTitle>{t('settings.installSection')}</SectionTitle>
            <div className="flex flex-1 flex-col gap-3 [&>*]:!mt-0">
              <InstallCard />
              {lockOn && (
                <button
                  type="button"
                  onClick={() => setConfirmLogout(true)}
                  className="glass flex w-full items-center justify-center gap-2 rounded-2xl border-expense/25 py-3.5 text-base font-semibold text-expense transition-all hover:border-expense/40 active:scale-[0.98]"
                >
                  <LogOut size={17} strokeWidth={2} />
                  {t('settings.logout')}
                </button>
              )}
            </div>
          </div>
        </div>

        <p className="mt-10 hidden text-center text-2xs text-fg-3 lg:block">
          {t('settings.footer', {
            appName: t('app.name'),
            version: APP_VERSION,
            date: getTodayShort(),
          })}
        </p>
      </div>

      {/* ========== PROFILE SHEET ========== */}
      <Sheet
        open={sheet === 'profile'}
        onClose={() => setSheet(null)}
        title={t('settings.profile')}
        subtitle={t('settings.profileSubtitle')}
      >
        <label className="mb-2 block text-xs font-medium text-fg-2">
          {t('settings.displayName')}
        </label>
        <input
          value={nameInput}
          onChange={(e) => setNameInput(e.target.value)}
          placeholder={t('settings.displayNamePlaceholder')}
          className="glass-inner w-full rounded-2xl px-4 py-3 text-base text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
        />

        <p className="mt-2 text-2xs leading-relaxed text-fg-3">
          {t('settings.displayNameHint')}
        </p>

        <button
          type="button"
          onClick={saveName}
          className="kh-btn kh-btn-primary mt-4 w-full py-3.5 text-base"
        >
          {t('common.save')}
        </button>
      </Sheet>

      {/* ========== LANGUAGE SHEET ========== */}
      <Sheet
        open={sheet === 'language'}
        onClose={() => setSheet(null)}
        title={t('languageChange.title')}
        subtitle={t('languageChange.subtitle')}
      >
        <p className="glass-inner mb-4 rounded-2xl p-3 text-xs leading-relaxed text-fg-2">
          {t('languageChange.note')}
        </p>

        <div className="space-y-2">
          {['fa', 'en'].map((code) => {
            const isActive = language === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleChangeLanguage(code)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-right backdrop-blur-md transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/[0.12]'
                    : 'border-border-1 bg-fill-1 active:scale-[0.99]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-sm font-bold text-primary">
                    {code === 'fa' ? 'فا' : 'EN'}
                  </span>
                  <p className="text-base font-semibold text-fg-1">
                    {t(`languages.${code}`)}
                  </p>
                </div>
                {isActive && (
                  <span className="text-xs font-bold text-primary">✓</span>
                )}
              </button>
            );
          })}
        </div>
      </Sheet>

      {/* ========== REGION SHEET ========== */}
      <Sheet
        open={sheet === 'region'}
        onClose={() => setSheet(null)}
        title={t('regionSelection.title')}
        subtitle={t('regionSelection.subtitle')}
      >
        <div className="space-y-2">
          {REGION_ORDER.map((id) => {
            const isActive = regionId === id;
            const region = REGIONS[id];
            return (
              <button
                key={id}
                type="button"
                onClick={() => handleChangeRegion(id)}
                className={[
                  'flex w-full items-center justify-between gap-3 rounded-2xl border px-4 py-3.5 text-right backdrop-blur-md transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/[0.12]'
                    : 'border-border-1 bg-fill-1 active:scale-[0.99]',
                ].join(' ')}
              >
                <div className="flex min-w-0 flex-1 items-start gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-lg">
                    {region.flag}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-base font-semibold text-fg-1">
                      {t(`regionSelection.${id}.title`)}
                    </p>
                    <p className="mt-0.5 text-2xs text-fg-3">
                      {t(`regionSelection.${id}.description`)}
                    </p>
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

      {/* ========== CURRENCY SHEET ========== */}
      <Sheet
        open={sheet === 'currency'}
        onClose={() => setSheet(null)}
        title={t('settings.currency')}
        subtitle={t('settings.currencySubtitle')}
      >
        <div className="space-y-2">
          {['AFN', 'IRR', 'USD', 'PKR'].map((code) => {
            const isActive = currencyCode === code;
            return (
              <button
                key={code}
                type="button"
                onClick={() => handleChangeCurrency(code)}
                className={[
                  'flex w-full items-center justify-between rounded-2xl border px-4 py-3.5 text-right backdrop-blur-md transition-all',
                  isActive
                    ? 'border-primary/40 bg-primary/[0.12]'
                    : 'border-border-1 bg-fill-1 active:scale-[0.99]',
                ].join(' ')}
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-lg font-bold text-primary">
                    {t(`currencies.${code}.symbol`)}
                  </span>
                  <div>
                    <p className="text-base font-semibold text-fg-1">
                      {t(`currencies.${code}.label`)}
                    </p>
                    <p className="mt-0.5 text-2xs text-fg-3">{code}</p>
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

      {/* ========== REMINDER TIME SHEET ========== */}
      <Sheet
        open={sheet === 'reminderTime'}
        onClose={() => setSheet(null)}
        title={t('reminder.timeTitle')}
        subtitle={t('reminder.timeSubtitle')}
      >
        <TimePicker value={reminderTime} onChange={changeReminderTime} />

        <button
          type="button"
          onClick={handleTestReminder}
          className="mt-5 w-full rounded-2xl border border-primary/30 bg-primary/[0.10] py-3 text-sm font-semibold text-primary backdrop-blur-md active:scale-[0.98]"
        >
          {t('reminder.testReminder')}
        </button>

        <button
          type="button"
          onClick={() => setSheet(null)}
          className="kh-btn kh-btn-primary mt-3 w-full py-3.5 text-base"
        >
          {t('common.save')}
        </button>
      </Sheet>

      {/* ========== SECURITY SHEET ========== */}
      <Sheet
        open={sheet === 'lock'}
        onClose={() => {
          if (pinSetupOpen) {
            cancelPinSetup();
          } else {
            setSheet(null);
          }
        }}
        title={t('security.title')}
        subtitle={t('security.subtitle')}
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
                  {t('security.password')}
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
                  {t('security.clear')}
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
                  {t('security.set')}
                </button>
              )}
            </div>

            <div className="glass-inner flex items-center gap-3 rounded-2xl p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-border-1 bg-fill-1 text-fg-2">
                <Fingerprint size={19} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-fg-1">
                  {t('security.biometric')}
                </p>
                <div className="mt-1">
                  {bioChecking ? (
                    <span className="text-2xs text-fg-3">
                      {t('security.checking')}
                    </span>
                  ) : (
                    <StatusBadge
                      active={bioOn}
                      inactiveLabel={
                        bioAvailable === false
                          ? t('security.notSupported')
                          : t('security.inactive')
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
                  {t('security.clear')}
                </button>
              ) : (
                <button
                  type="button"
                  disabled={busy || bioChecking}
                  onClick={handleRegisterBiometric}
                  className="shrink-0 rounded-xl bg-primary/[0.16] px-3 py-2 text-xs font-semibold text-primary disabled:opacity-40"
                >
                  {busy || bioChecking ? '...' : t('security.enable')}
                </button>
              )}
            </div>

            <p className="pt-1 text-center text-2xs leading-relaxed text-fg-3">
              {t('security.privacyNote')}
            </p>
          </div>
        )}
      </Sheet>

      {/* ========== BACKUP SHEET ========== */}
      <Sheet
        open={sheet === 'backup'}
        onClose={() => setSheet(null)}
        title={t('backup.title')}
        subtitle={t('backup.subtitle')}
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
                {t('backup.export')}
              </p>
              <p className="mt-1 text-xs text-fg-3">{t('backup.exportHint')}</p>
            </div>
          </button>

          <label className="glass-inner flex w-full cursor-pointer items-center gap-3 rounded-2xl p-4 active:scale-[0.99]">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.14] text-primary">
              <Database size={19} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-base font-semibold text-fg-1">
                {t('backup.import')}
              </p>
              <p className="mt-1 text-xs text-fg-3">
                {t('backup.importWarning')}
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

      {/* ========== CONFIRM RESET ========== */}
      <Sheet
        open={confirmReset}
        onClose={() => (resetting ? null : setConfirmReset(false))}
        title={t('reset.title')}
        subtitle={t('reset.subtitle')}
      >
        <p className="rounded-2xl border border-expense/25 bg-expense/[0.10] p-4 text-sm leading-relaxed text-expense backdrop-blur-md">
          {t('reset.warning')}
        </p>

        <div className="glass-inner mt-4 rounded-2xl p-4">
          <p className="text-xs leading-relaxed text-fg-2">
            {t('reset.hint')}
          </p>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            disabled={resetting}
            onClick={() => setConfirmReset(false)}
            className="kh-btn kh-btn-ghost py-3.5 text-sm"
          >
            {t('common.cancel')}
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
                {t('reset.confirm')}
              </>
            )}
          </button>
        </div>
      </Sheet>

      {/* ========== CONFIRM LOGOUT ========== */}
      <Sheet
        open={confirmLogout}
        onClose={() => setConfirmLogout(false)}
        title={t('logout.title')}
        subtitle={t('logout.subtitle')}
      >
        <p className="glass-inner rounded-2xl p-4 text-sm leading-relaxed text-fg-2">
          {t('logout.message', {
            methods: [pinOn && t('settings.loginPin'), bioOn && t('settings.loginBiometric')]
              .filter(Boolean)
              .join(' / '),
          })}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setConfirmLogout(false)}
            className="kh-btn kh-btn-ghost py-3.5 text-sm"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="kh-btn kh-btn-danger flex items-center justify-center gap-2 py-3.5 text-sm"
          >
            <LogOut size={16} />
            {t('logout.confirm')}
          </button>
        </div>
      </Sheet>

      {/* ========== CURRENCY CHANGE WARNING ========== */}
      {currencyWarning && (
        <CurrencyChangeWarning
          open={!!currencyWarning}
          onClose={() => setCurrencyWarning(null)}
          onConfirm={confirmCurrencyChange}
          fromCode={currencyWarning.from}
          toCode={currencyWarning.to}
          count={currencyWarning.count}
        />
      )}

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