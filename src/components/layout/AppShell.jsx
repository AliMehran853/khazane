import { Outlet, useLocation } from 'react-router-dom';

import BottomNav from './BottomNav';
import Sidebar from './Sidebar';
import FloatingActionButton from './FloatingActionButton';
import TransactionSheet from '../transactions/TransactionSheet';
import LockScreen from '../lock/LockScreen';
import DailyReminderModal from '../dashboard/DailyReminderModal';
import GreetingToast from '../common/GreetingToast';

import { useAppStore } from '../store/appStore';
import { useAppLock } from '../hooks/useAppLock';
import { useDailyReminder } from '../hooks/useDailyReminder';
import { useGreeting } from '../hooks/useGreeting';

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
  const closeTransactionSheet = useAppStore((s) => s.closeTransactionSheet);

  if (checking) {
    return (
      <div className="flex min-h-dvh items-center justify-center bg-[#0A1614]">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/[0.1] border-t-[#E3B341]" />
      </div>
    );
  }

  if (locked) {
    return <LockScreen />;
  }

  return (
    <div
      className="relative min-h-dvh bg-[#0A1614] text-[#F2EFE9]"
      data-vaul-drawer-wrapper
    >
      <Sidebar />

      <main className="mx-auto w-full max-w-[420px] pb-24 lg:max-w-none lg:pb-12 lg:pr-[260px]">
        <div className="lg:mx-auto lg:max-w-[1200px] lg:px-8 lg:pt-2">
          {/* ⭐ بدون انیمیشن — سرعت حداکثر */}
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
        onClose={closeTransactionSheet}
      />

      <DailyReminderModal
        open={reminderVisible}
        onClose={dismissReminder}
      />

      <GreetingHost />
    </div>
  );
}

export default AppShell;