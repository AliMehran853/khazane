import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  ShoppingBag,
  Sparkles,
  User,
  Wallet,
} from 'lucide-react';

import AppLogo from '../common/AppLogo';
import { useAppStore } from '../store/appStore';
import { useHaptic } from '../hooks/useHaptic';

import {
  setFirstName as saveFirstName,
  setLastName as saveLastName,
  setUserName,
  setOnboardingCompleted,
  setOnboardingStep,
  getOnboardingStep,
} from '../services/settingsService';

const TOTAL_STEPS = 5;

export default function OnboardingFlow({ onComplete }) {
  const [step, setStep] = useState(0);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [saving, setSaving] = useState(false);
  const [waitingForSheet, setWaitingForSheet] = useState(false);

  const haptic = useHaptic();
  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const transactionSheetOpen = useAppStore((s) => s.transactionSheetOpen);

  useEffect(() => {
    getOnboardingStep().then((s) => {
      if (s > 0 && s < TOTAL_STEPS) setStep(s);
    });
  }, []);

  useEffect(() => {
    setOnboardingStep(step);
  }, [step]);

  useEffect(() => {
    if (!waitingForSheet) return;
    if (transactionSheetOpen) return;
    setWaitingForSheet(false);
    setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  }, [transactionSheetOpen, waitingForSheet]);

  function next() {
    haptic.tap();
    if (step < TOTAL_STEPS - 1) setStep(step + 1);
  }

  function back() {
    haptic.tap();
    if (step > 0) setStep(step - 1);
  }

  async function handleNameNext() {
    const clean = firstName.trim();
    if (!clean) return;

    setSaving(true);
    haptic.success();

    await saveFirstName(clean);
    await saveLastName(lastName.trim());

    const full = [clean, lastName.trim()].filter(Boolean).join(' ');
    await setUserName(full);

    setSaving(false);
    next();
  }

  function handleAddIncome() {
    haptic.medium();
    setWaitingForSheet(true);
    openTransactionSheet('income');
  }

  function handleAddExpense() {
    haptic.medium();
    setWaitingForSheet(true);
    openTransactionSheet('expense');
  }

  async function finish() {
    haptic.success();
    setSaving(true);
    await setOnboardingCompleted(true);
    await setOnboardingStep(0);
    setSaving(false);
    onComplete?.();
  }

  const showBack = step > 0 && step < TOTAL_STEPS - 1 && !waitingForSheet;

  return (
    <div className="fixed inset-0 z-[60] overflow-y-auto">
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(0,209,167,0.20), transparent 60%)',
        }}
      />

      <div className="relative flex min-h-dvh w-full items-center justify-center lg:p-8">
        <div className="flex w-full flex-col px-6 pt-8 pb-6 lg:max-w-[540px] lg:glass-strong lg:rounded-4xl lg:px-10 lg:py-10">
          <div className="mb-6 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step
                    ? 'bg-primary shadow-[0_0_8px_rgba(0,209,167,0.45)]'
                    : 'bg-fill-3',
                ].join(' ')}
              />
            ))}
          </div>

          <AnimatePresence>
            {showBack && (
              <motion.button
                type="button"
                onClick={back}
                aria-label="بازگشت"
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 8 }}
                transition={{ duration: 0.2 }}
                className="glass-inner absolute right-6 top-16 z-10 flex h-10 w-10 items-center justify-center rounded-xl text-fg-2 active:scale-95 lg:right-12 lg:top-20"
              >
                <ArrowRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          <div className="flex flex-1 flex-col items-center justify-center py-4 lg:py-6">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <StepWrap key="welcome">
                  <WelcomeStep onNext={next} />
                </StepWrap>
              )}

              {step === 1 && (
                <StepWrap key="name">
                  <NameStep
                    firstName={firstName}
                    lastName={lastName}
                    setFirstName={setFirstName}
                    setLastName={setLastName}
                    onNext={handleNameNext}
                    saving={saving}
                  />
                </StepWrap>
              )}

              {step === 2 && (
                <StepWrap key="income">
                  <IncomeStep
                    onAdd={handleAddIncome}
                    onSkip={next}
                    waiting={waitingForSheet}
                  />
                </StepWrap>
              )}

              {step === 3 && (
                <StepWrap key="expense">
                  <ExpenseStep
                    onAdd={handleAddExpense}
                    onSkip={next}
                    waiting={waitingForSheet}
                  />
                </StepWrap>
              )}

              {step === 4 && (
                <StepWrap key="done">
                  <DoneStep onFinish={finish} saving={saving} />
                </StepWrap>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}

function StepWrap({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
      className="w-full"
    >
      {children}
    </motion.div>
  );
}

function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-primary/35 blur-3xl" />
        <div className="relative">
          <AppLogo size={110} />
        </div>
      </motion.div>

      <h1 className="mt-8 text-3xl font-extrabold leading-tight text-fg-1 lg:text-4xl">
        به خزانه خوش آمدی
      </h1>

      <p className="mt-3 max-w-[320px] text-base leading-relaxed text-fg-2 lg:text-md">
        یه همراه ساده برای مدیریت درآمد و مصارف روزانه‌ات. کاملاً آفلاین، امن و
        بدون تبلیغ.
      </p>

      <div className="mt-8 w-full max-w-[320px] space-y-2.5">
        <FeatureRow emoji="📊" text="نمودارهای واضح از مصارف" />
        <FeatureRow emoji="🔒" text="قفل با رمز و اثر انگشت" />
        <FeatureRow emoji="⚡" text="کاملاً آفلاین و سریع" />
      </div>

      <button
        type="button"
        onClick={onNext}
        className="kh-btn kh-btn-primary mt-10 w-full max-w-[320px] py-3.5 text-md"
      >
        بزن بریم
      </button>
    </div>
  );
}

function FeatureRow({ emoji, text }) {
  return (
    <div className="glass-inner flex items-center gap-3 rounded-2xl p-3 text-right">
      <span className="text-xl">{emoji}</span>
      <span className="text-sm text-fg-1">{text}</span>
    </div>
  );
}

function NameStep({
  firstName,
  lastName,
  setFirstName,
  setLastName,
  onNext,
  saving,
}) {
  const canNext = firstName.trim().length > 0;

  return (
    <div className="w-full">
      <div className="flex flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary">
          <User size={26} strokeWidth={1.9} />
        </div>
        <h2 className="mt-5 text-2xl font-extrabold text-fg-1 lg:text-3xl">
          اسمت رو بگو
        </h2>
        <p className="mt-2 max-w-[300px] text-sm leading-relaxed text-fg-2">
          با این اسم، خزانه تو رو صدا می‌زنه و پیام‌های روزانه‌ات شخصی‌تر می‌شه.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div>
          <label className="mb-1.5 block text-right text-xs font-medium text-fg-2">
            اسم
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="مثلاً علی"
            autoFocus
            className="glass-inner w-full rounded-2xl px-4 py-3.5 text-center text-lg font-semibold text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-right text-xs font-medium text-fg-2">
            تخلص{' '}
            <span className="font-normal text-fg-3">(اختیاری)</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="مثلاً مهران"
            className="glass-inner w-full rounded-2xl px-4 py-3.5 text-center text-lg font-semibold text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext || saving}
        className="kh-btn kh-btn-primary mt-8 w-full py-3.5 text-md"
      >
        {saving ? '...' : 'ادامه'}
      </button>
    </div>
  );
}

function IncomeStep({ onAdd, onSkip, waiting }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/25 bg-primary/[0.16] text-primary">
        <Wallet size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-fg-1 lg:text-3xl">
        امروز درآمد داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-fg-2">
        اگه داشتی، همین الان ثبتش کن — خیلی سریع. اگه نه، می‌تونی Skip کنی و
        بعداً ثبت کنی.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={waiting}
          className="kh-btn kh-btn-primary w-full py-3.5 text-md"
        >
          <Wallet size={16} strokeWidth={2.2} />
          {waiting ? '...' : 'ثبت درآمد'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={waiting}
          className="glass-inner w-full rounded-2xl py-3.5 text-base font-semibold text-fg-2 active:scale-[0.98] disabled:opacity-40"
        >
          بعداً
        </button>
      </div>
    </div>
  );
}

function ExpenseStep({ onAdd, onSkip, waiting }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-expense/25 bg-expense/[0.16] text-expense">
        <ShoppingBag size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-2xl font-extrabold text-fg-1 lg:text-3xl">
        امروز مصرف داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-sm leading-relaxed text-fg-2">
        اگه داشتی، ثبتش کن تا از همون روز اول حس کنترل و آگاهی رو تجربه کنی.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={waiting}
          className="kh-btn kh-btn-danger w-full py-3.5 text-md"
        >
          <ShoppingBag size={16} strokeWidth={2.2} />
          {waiting ? '...' : 'ثبت مصرف'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={waiting}
          className="glass-inner w-full rounded-2xl py-3.5 text-base font-semibold text-fg-2 active:scale-[0.98] disabled:opacity-40"
        >
          بعداً
        </button>
      </div>
    </div>
  );
}

function DoneStep({ onFinish, saving }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-primary/35 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-gradient-to-b from-primary to-primary-dark text-on-primary shadow-[0_12px_32px_rgba(0,209,167,0.40)]">
          <CheckCircle2 size={48} strokeWidth={2} />
        </div>
      </motion.div>

      <h2 className="mt-8 text-3xl font-extrabold text-fg-1 lg:text-4xl">
        همه چیز آماده‌ست
      </h2>

      <p className="mt-3 max-w-[300px] text-base leading-relaxed text-fg-2">
        از دکمه‌ی <span className="font-bold text-primary">+</span> برای ثبت
        سریع استفاده کن، و از تنظیمات برای شخصی‌سازی.
      </p>

      <div className="mt-8 w-full max-w-[320px] space-y-2.5">
        <TipRow text="هر روز پیام‌های کوچیک برات داریم" />
        <TipRow text="می‌تونی از تنظیمات قفل بذاری" />
        <TipRow text="همه‌ی داده‌ها فقط روی موبایل توئه" />
      </div>

      <button
        type="button"
        onClick={onFinish}
        disabled={saving}
        className="kh-btn kh-btn-primary mt-10 flex w-full max-w-[320px] items-center justify-center gap-2 py-3.5 text-md"
      >
        <Sparkles size={16} />
        {saving ? '...' : 'بریم شروع کنیم'}
      </button>
    </div>
  );
}

function TipRow({ text }) {
  return (
    <div className="glass-inner flex items-center gap-2.5 rounded-2xl px-4 py-3 text-right">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
      <span className="text-sm text-fg-2">{text}</span>
    </div>
  );
}