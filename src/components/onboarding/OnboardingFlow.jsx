import { useState, useEffect, useRef } from 'react';
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

  // ⭐ بارگذاری مرحله‌ی ذخیره‌شده
  useEffect(() => {
    getOnboardingStep().then((s) => {
      if (s > 0 && s < TOTAL_STEPS) setStep(s);
    });
  }, []);

  // ⭐ ذخیره‌ی مرحله در هر تغییر
  useEffect(() => {
    setOnboardingStep(step);
  }, [step]);

  // ⭐ وقتی کاربر تراکنشی ثبت کرد و شیت بسته شد، خودکار برو مرحله بعد
  useEffect(() => {
    if (!waitingForSheet) return;
    if (transactionSheetOpen) return;
    // شیت بسته شد — برو مرحله بعد
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
    <div className="fixed inset-0 z-[60] overflow-y-auto bg-[#0A1614]">
      {/* هاله‌ی طلایی */}
      <div
        className="pointer-events-none fixed inset-0"
        style={{
          background:
            'radial-gradient(circle at 50% 25%, rgba(227,179,65,0.16), transparent 60%)',
        }}
      />

      {/* ⭐ wrapper: روی موبایل تمام صفحه، روی دسکتاپ کارت مرکز */}
      <div className="relative flex min-h-dvh w-full items-center justify-center lg:p-8">
        <div
          className="
            flex w-full flex-col
            px-6 pt-8 pb-6
            lg:max-w-[540px] lg:rounded-[32px]
            lg:border lg:border-white/[0.08]
            lg:bg-[#0F211E]/70
            lg:px-10 lg:py-10
            lg:shadow-2xl lg:backdrop-blur-xl
          "
        >
          {/* Progress */}
          <div className="mb-6 flex gap-1.5">
            {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
              <div
                key={i}
                className={[
                  'h-1 flex-1 rounded-full transition-colors duration-300',
                  i <= step ? 'bg-[#E3B341]' : 'bg-white/[0.08]',
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
                  absolute right-6 top-16 z-10 flex h-10 w-10
                  items-center justify-center rounded-xl bg-[#153029]
                  text-[#8FA39D] active:scale-95
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

// ============================================================
// Step Wrapper
// ============================================================

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
        <div className="absolute inset-0 rounded-3xl bg-[#E3B341]/30 blur-3xl" />
        <div className="relative">
          <AppLogo size={110} />
        </div>
      </motion.div>

      <h1 className="mt-8 text-[26px] font-extrabold leading-tight text-[#F2EFE9] lg:text-[30px]">
        به خزانه خوش آمدی
      </h1>

      <p className="mt-3 max-w-[320px] text-[13px] leading-relaxed text-[#8FA39D] lg:text-[14px]">
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
          bg-[linear-gradient(155deg,#E3B341,#B9862A)]
          py-3.5 text-[14px] font-bold text-[#0A1614]
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
    <div className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-[#0F211E] p-3 text-right">
      <span className="text-[20px]">{emoji}</span>
      <span className="text-[12.5px] text-[#F2EFE9]">{text}</span>
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
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[#E3B341]">
          <User size={26} strokeWidth={1.9} />
        </div>
        <h2 className="mt-5 text-[22px] font-extrabold text-[#F2EFE9] lg:text-[24px]">
          اسمت رو بگو
        </h2>
        <p className="mt-2 max-w-[300px] text-[12.5px] leading-relaxed text-[#8FA39D]">
          با این اسم، خزانه تو رو صدا می‌زنه و پیام‌های روزانه‌ات شخصی‌تر می‌شه.
        </p>
      </div>

      <div className="mt-8 space-y-3">
        <div>
          <label className="mb-1.5 block text-right text-[11px] font-medium text-[#8FA39D]">
            اسم
          </label>
          <input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="مثلاً علی"
            autoFocus
            className="
              w-full rounded-2xl border border-white/[0.07] bg-[#153029]
              px-4 py-3.5 text-center text-[15px] font-semibold
              text-[#F2EFE9] outline-none placeholder:text-[#5C736C]
              focus:border-[#E3B341]/40
            "
          />
        </div>

        <div>
          <label className="mb-1.5 block text-right text-[11px] font-medium text-[#8FA39D]">
            تخلص{' '}
            <span className="font-normal text-[#5C736C]">(اختیاری)</span>
          </label>
          <input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            placeholder="مثلاً مهران"
            className="
              w-full rounded-2xl border border-white/[0.07] bg-[#153029]
              px-4 py-3.5 text-center text-[15px] font-semibold
              text-[#F2EFE9] outline-none placeholder:text-[#5C736C]
              focus:border-[#E3B341]/40
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
          bg-[linear-gradient(155deg,#E3B341,#B9862A)]
          py-3.5 text-[14px] font-bold text-[#0A1614]
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
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#4FD1BE]/[0.14] text-[#4FD1BE]">
        <Wallet size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-[22px] font-extrabold text-[#F2EFE9] lg:text-[24px]">
        امروز درآمد داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-[12.5px] leading-relaxed text-[#8FA39D]">
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
            bg-[linear-gradient(155deg,#4FD1BE,#2FAF9D)]
            py-3.5 text-[14px] font-bold text-[#0A1614]
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
            w-full rounded-2xl border border-white/[0.08] bg-[#153029]
            py-3.5 text-[13px] font-semibold text-[#8FA39D]
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
      <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E2574C]/[0.14] text-[#E2574C]">
        <ShoppingBag size={30} strokeWidth={1.8} />
      </div>

      <h2 className="mt-5 text-[22px] font-extrabold text-[#F2EFE9] lg:text-[24px]">
        امروز مصرف داشتی؟
      </h2>

      <p className="mt-3 max-w-[300px] text-[12.5px] leading-relaxed text-[#8FA39D]">
        اگه داشتی، ثبتش کن تا از همون روز اول حس کنترل و آگاهی رو تجربه کنی.
      </p>

      <div className="mt-10 w-full max-w-[320px] space-y-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={waiting}
          className="
            flex w-full items-center justify-center gap-2 rounded-2xl
            bg-[linear-gradient(155deg,#E2574C,#B8392F)]
            py-3.5 text-[14px] font-bold text-white
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
            w-full rounded-2xl border border-white/[0.08] bg-[#153029]
            py-3.5 text-[13px] font-semibold text-[#8FA39D]
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
        <div className="absolute inset-0 rounded-3xl bg-[#E3B341]/30 blur-3xl" />
        <div className="relative flex h-24 w-24 items-center justify-center rounded-3xl bg-[linear-gradient(155deg,#E3B341,#B9862A)] text-[#0A1614]">
          <CheckCircle2 size={48} strokeWidth={2} />
        </div>
      </motion.div>

      <h2 className="mt-8 text-[24px] font-extrabold text-[#F2EFE9] lg:text-[26px]">
        همه چیز آماده‌ست
      </h2>

      <p className="mt-3 max-w-[300px] text-[13px] leading-relaxed text-[#8FA39D]">
        از دکمه‌ی <span className="font-bold text-[#E3B341]">+</span> برای ثبت
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
          rounded-2xl bg-[linear-gradient(155deg,#E3B341,#B9862A)]
          py-3.5 text-[14px] font-bold text-[#0A1614]
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
    <div className="flex items-center gap-2.5 rounded-2xl border border-white/[0.06] bg-[#0F211E] px-4 py-3 text-right">
      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#E3B341]" />
      <span className="text-[12px] text-[#8FA39D]">{text}</span>
    </div>
  );
}