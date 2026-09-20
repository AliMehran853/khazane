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
import PeriodLockToast from '../common/PeriodLockToast';
import OnboardingFlow from '../onboarding/OnboardingFlow';

import { useAppStore } from '../store/appStore';
import { useAppLock } from '../hooks/useAppLock';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useGreeting } from '../hooks/useGreeting';

import { isOnboardingCompleted } from '../services/settingsService';

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

  const resetPeriodOffset = useAppStore((s) => s.resetPeriodOffset);
  const refreshData = useAppStore((s) => s.refreshData);
  const dataVersion = useAppStore((s) => s.dataVersion);

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

  useEffect(() => {
    resetPeriodOffset();
  }, [location.pathname, resetPeriodOffset]);

  if (checking || onboardingLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.1] border-t-[#00D1A7]" />
      </div>
    );
  }

  if (locked) {
    return <LockScreen />;
  }

  if (!onboardingCompleted) {
    return (
      <>
        <OnboardingFlow
          onComplete={() => {
            setLocalOnboardingCompleted(true);
            refreshData();
          }}
        />

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
    <div className="relative min-h-dvh text-[#F8FAFC]" data-vaul-drawer-wrapper>
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

      <DailyReminderModal open={reminderVisible} onClose={dismissReminder} />

      <GreetingHost />

      <PeriodLockToast />
    </div>
  );
}

export default AppShell;