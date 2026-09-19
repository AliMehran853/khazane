import { useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';

import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import FloatingActionButton from './FloatingActionButton';
import TransactionSheet from '../transactions/TransactionSheet';
import DateChoiceModal from '../transactions/DateChoiceModal';
import LockScreen from '../lock/LockScreen';
import DailyReminderModal from '../dashboard/DailyReminderModal';
import GreetingToast from '../common/GreetingToast';
import OnboardingFlow from '../onboarding/OnboardingFlow';

import { useAppStore } from '../store/appStore';
import { useAppLock } from '../hooks/useAppLock';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useGreeting } from '../hooks/useGreeting';

import { isOnboardingCompleted } from '../services/settingsService';

// ⭐ فقط بعد از unlock رندر می‌شه
function GreetingHost() {
  const { visible, greeting, dismiss } = useGreeting({ enabled: true });
  return (
    <GreetingToast open={visible} greeting={greeting} onClose={dismiss} />
  );
}

function AppShell() {
  const location = useLocation();
  const { locked, checking } = useAppLock();
  const { visible: reminderVisible, dismiss: dismissReminder } =
    useDailyReminder();

  const transactionSheetOpen = useAppStore((s) => s.transactionSheetOpen);
  const transactionSheetType = useAppStore((s) => s.transactionSheetType);
  const editingTransaction = useAppStore((s) => s.editingTransaction);
  const prefilledDate = useAppStore((s) => s.prefilledDate);
  const closeTransactionSheet = useAppStore((s) => s.closeTransactionSheet);

  const resetWeekOffset = useAppStore((s) => s.resetWeekOffset);
  const refreshData = useAppStore((s) => s.refreshData);
  const dataVersion = useAppStore((s) => s.dataVersion);

  // ⭐ چک onboarding
  const [onboardingLoading, setOnboardingLoading] = useState(true);
  const [onboardingCompleted, setLocalOnboardingCompleted] = useState(true);

  useEffect(() => {
    let cancelled = false;
    isOnboardingCompleted()
      .then((done) => {
        if (cancelled) return;
        setLocalOnboardingCompleted(done);
      })
      .finally(() => {
        if (cancelled) return;
        setOnboardingLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  // ⭐ با هر تغییر صفحه، هفته برگرده به «این هفته»
  useEffect(() => {
    resetWeekOffset();
  }, [location.pathname, resetWeekOffset]);

  // در حال بررسی قفل یا onboarding
  if (checking || onboardingLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A1614]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.1] border-t-[#E3B341]" />
      </div>
    );
  }

  if (locked) {
    return <LockScreen />;
  }

  // ⭐ اگه onboarding تکمیل نشده → فقط OnboardingFlow + Sheet
  if (!onboardingCompleted) {
    return (
      <>
        <OnboardingFlow
          onComplete={() => {
            setLocalOnboardingCompleted(true);
            refreshData();
          }}
        />

        {/* برای اینکه کاربر بتونه در مرحله‌ی درآمد/مصرف ثبت کنه */}
        <TransactionSheet
          open={transactionSheetOpen}
          type={transactionSheetType}
          editingTransaction={editingTransaction}
          prefilledDate={prefilledDate}
          onClose={closeTransactionSheet}
        />

        <DateChoiceModal />
      </>
    );
  }

  return (
    <div
      className="relative min-h-dvh bg-[#0A1614] text-[#F2EFE9]"
      data-vaul-drawer-wrapper
    >
      <Sidebar />

      <main className="mx-auto w-full max-w-[420px] pb-24 lg:max-w-none lg:pb-12 lg:pr-[260px]">
        <div className="lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:pt-2">
          <div key={location.pathname}>
            <Outlet />
          </div>
        </div>
      </main>

      <FloatingActionButton />
      <BottomNav />

      <TransactionSheet
        open={transactionSheetOpen}
        type={transactionSheetType}
        editingTransaction={editingTransaction}
        prefilledDate={prefilledDate}
        onClose={closeTransactionSheet}
      />

      <DateChoiceModal />

      <DailyReminderModal
        open={reminderVisible}
        onClose={dismissReminder}
      />

      <GreetingHost />
    </div>
  );
}

export default AppShell;