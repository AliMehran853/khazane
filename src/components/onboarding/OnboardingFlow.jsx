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
      {/* هاله‌ی فیروزه‌ای */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(0,209,167,0.20), transparent 60%)',
        }}
      />

      <div className="relative flex min-h-dvh w-full items-center justify-center lg:p-8">
        <div
          className="
            flex w-full flex-col
            px-6 pt-8 pb-6
            lg:max-w-[540px] lg:rounded-[32px]
            lg:glass-strong
            lg:px-10 lg:py-10
          "
        >
          {/* Progress */}
          <div className="mb-6 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step
                    ? 'bg-[#00D1A7] shadow-[0_0_8px_rgba(0,209,167,0.45)]'
                    : 'bg-white/[0.10]',
                ].join(' ')}
              />
            ))}
          </div>

          {/* Back */}
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
                className="
                  glass-inner absolute right-6 top-16 z-10 flex h-10 w-10
                  items-center justify-center rounded-xl
                  text-[#94A3B8] active:scale-95
                  lg:right-12 lg:top-20
                "
              >
                <ArrowRight size={18} />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Content */}
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

// ============================================================
// Step 1 — Welcome
// ============================================================

function WelcomeStep({ onNext }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-[#00D1A7]/35 blur-3xl" />
        <div className="relative">
          <AppLogo size={110} />
        </div>
      </motion.div>

      <h1 className="mt-8 text-[26px] font-extrabold leading-tight text-[#F8FAFC] lg:text-[30px]">
        به خزانه خوش آمدی
      </h1>

      <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-[#94A3B8] lg:text-[14px]">
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
        className="
          mt-10 w-full max-w-[320px] rounded-2xl
          bg-[linear-gradient(155deg,#00D1A7,#00A88A)]
          py-3.5 text-[14px] font-bold text-[#0F172A]
          shadow-[0_8px_24px_rgba(0,209,167,0.35)]
          active:scale-[0.98]
        "
      >
        بزن بریم
      </button>
    </div>
  );
}

function FeatureRow({ emoji, text }) {
  return (
    <div className="glass-inner flex items-center gap-3 rounded-2xl p-3 text-right">
      <span className="text-[20px]">{emoji}</span>
      <span className="text-[12.5px] text-[#F8FAFC]">{text}</span>
    </div>
  );
}

// ============================================================
// Step 2 — Name
// ============================================================

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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
          <User size={26} strokeWidth={1.9} />
        </div>
        <h2 className="mt-5 text-[22px] font-extrabold text-[#F8FAFC] lg:text-[24px]">
          اسمت رو بگو
        </h2>
        <p className="mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-[#94A3B8]">
          با این اسم، خزانه تو رو صدا می‌زنه و پیام‌های روزانه‌ات شخصی‌تر می‌شه.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div>
          <label className="mb-1.5 block text-right text-[11px] font-medium text-[#94A3B8]">
            اسم
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="مثلاً علی"
            autoFocus
            className="
              glass-inner w-full rounded-2xl
              px-4 py-3.5 text-center text-[15px] font-semibold
              text-[#F8FAFC] outline-none placeholder:text-[#64748B]
              focus:border-[#00D1A7]/50
            "
          />
        </div>

        <div>
          <label className="mb-1.5 block text-right text-[11px] font-medium text-[#94A3B8]">
            تخلص{' '}
            <span className="font-normal text-[#64748B]">(اختیاری)</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="مثلاً مهران"
            className="
              glass-inner w-full rounded-2xl
              px-4 py-3.5 text-center text-[15px] font-semibold
              text-[#F8FAFC] outline-none placeholder:text-[#64748B]
              focus:border-[#00D1A7]/50
            "
          />
        </div>
      </div>

      <button
        type="button"
        onClick={onNext}
        disabled={!canNext || saving}
        className="
          mt-8 w-full rounded-2xl
          bg-[linear-gradient(155deg,#00D1A7,#00A88A)]
          py-3.5 text-[14px] font-bold text-[#0F172A]
          shadow-[0_8px_24px_rgba(0,209,167,0.35)]
          active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-40
        "
      >
        {saving ? '...' : 'ادامه'}
      </button>
    </div>
  );
}

// ============================================================
// Step 3 — Income
// ============================================================

function IncomeStep({ onAdd, onSkip, waiting }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
        <Wallet size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-[22px] font-extrabold text-[#F8FAFC] lg:text-[24px]">
        امروز درآمد داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-[12.5px] leading-relaxed text-[#94A3B8]">
        اگه داشتی، همین الان ثبتش کن — خیلی سریع. اگه نه، می‌تونی Skip کنی و
        بعداً ثبت کنی.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={waiting}
          className="
            flex w-full items-center justify-center gap-2 rounded-2xl
            bg-[linear-gradient(155deg,#00D1A7,#00A88A)]
            py-3.5 text-[14px] font-bold text-[#0F172A]
            shadow-[0_8px_24px_rgba(0,209,167,0.35)]
            active:scale-[0.98] disabled:opacity-60
          "
        >
          <Wallet size={16} strokeWidth={2.2} />
          {waiting ? '...' : 'ثبت درآمد'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={waiting}
          className="
            glass-inner w-full rounded-2xl
            py-3.5 text-[13px] font-semibold text-[#94A3B8]
            active:scale-[0.98] disabled:opacity-40
          "
        >
          بعداً
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Step 4 — Expense
// ============================================================

function ExpenseStep({ onAdd, onSkip, waiting }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-[#F43F5E]/25 bg-[#F43F5E]/[0.16] text-[#F43F5E]">
        <ShoppingBag size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-[22px] font-extrabold text-[#F8FAFC] lg:text-[24px]">
        امروز مصرف داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-[12.5px] leading-relaxed text-[#94A3B8]">
        اگه داشتی، ثبتش کن تا از همون روز اول حس کنترل و آگاهی رو تجربه کنی.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={waiting}
          className="
            flex w-full items-center justify-center gap-2 rounded-2xl
            bg-[linear-gradient(155deg,#F43F5E,#BE123C)]
            py-3.5 text-[14px] font-bold text-white
            shadow-[0_8px_24px_rgba(244,63,94,0.35)]
            active:scale-[0.98] disabled:opacity-60
          "
        >
          <ShoppingBag size={16} strokeWidth={2.2} />
          {waiting ? '...' : 'ثبت مصرف'}
        </button>

        <button
          type="button"
          onClick={onSkip}
          disabled={waiting}
          className="
            glass-inner w-full rounded-2xl
            py-3.5 text-[13px] font-semibold text-[#94A3B8]
            active:scale-[0.98] disabled:opacity-40
          "
        >
          بعداً
        </button>
      </div>
    </div>
  );
}

// ============================================================
// Step 5 — Done
// ============================================================

function DoneStep({ onFinish, saving }) {
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div
        initial={{ scale: 0.6, rotate: -10, opacity: 0 }}
        animate={{ scale: 1, rotate: 0, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.5, ease: 'backOut' }}
        className="relative"
      >
        <div className="absolute inset-0 rounded-3xl bg-[#00D1A7]/35 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-[linear-gradient(155deg,#00D1A7,#00A88A)] text-[#0F172A] shadow-[0_12px_32px_rgba(0,209,167,0.40)]">
          <CheckCircle2 size={48} strokeWidth={2} />
        </div>
      </motion.div>

      <h2 className="mt-8 text-[24px] font-extrabold text-[#F8FAFC] lg:text-[26px]">
        همه چیز آماده‌ست
      </h2>

      <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#94A3B8]">
        از دکمه‌ی <span className="font-bold text-[#00D1A7]">+</span> برای ثبت
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
        className="
          mt-10 flex w-full max-w-[320px] items-center justify-center gap-2
          rounded-2xl bg-[linear-gradient(155deg,#00D1A7,#00A88A)]
          py-3.5 text-[14px] font-bold text-[#0F172A]
          shadow-[0_8px_24px_rgba(0,209,167,0.35)]
          active:scale-[0.98] disabled:opacity-60
        "
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
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#00D1A7]" />
      <span className="text-[12px] text-[#94A3B8]">{text}</span>
    </div>
  );
}