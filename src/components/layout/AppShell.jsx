import { Outlet, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';

import BottomNav from './BottomNav';
import FloatingActionButton from './FloatingActionButton';
import TransactionSheet from '../transactions/TransactionSheet';
import LockScreen from '../lock/LockScreen';
import DailyReminderModal from '../dashboard/DailyReminderModal';

import { useAppStore } from '../store/appStore';
import { useAppLock } from '../hooks/useAppLock';
import { useDailyReminder } from '../hooks/useDailyReminder';

function AppShell() {
  const location = useLocation();
  const { locked, checking } = useAppLock();
  const { visible: reminderVisible, dismiss: dismissReminder } = useDailyReminder();

  const transactionSheetOpen = useAppStore((s) => s.transactionSheetOpen);
  const transactionSheetType = useAppStore((s) => s.transactionSheetType);
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
    <div className="relative min-h-dvh bg-[#0A1614] text-[#F2EFE9]">
      <main className="mx-auto w-full max-w-[420px] pb-32">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      <FloatingActionButton />
      <BottomNav />

      <TransactionSheet
        open={transactionSheetOpen}
        type={transactionSheetType}
        onClose={closeTransactionSheet}
      />

      {/* ⭐ یادآوری روزانه */}
      <DailyReminderModal
        open={reminderVisible}
        onClose={dismissReminder}
      />
    </div>
  );
}

export default AppShell;