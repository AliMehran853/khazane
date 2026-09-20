import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAppStore } from '../store/appStore';
import { useHaptic } from '../hooks/useHaptic';
import { getPeriodBaseDate } from '../utils/dates';

function FloatingActionButton() {
  const location = useLocation();
  const haptic = useHaptic();

  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const openDateChoice = useAppStore((s) => s.openDateChoice);
  const showPeriodLockToast = useAppStore((s) => s.showPeriodLockToast);
  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);

  if (location.pathname === '/settings') return null;

  const type = location.pathname === '/income' ? 'income' : 'expense';
  const isDisabled = period === 'monthly' || period === 'yearly';

  function handleClick() {
    if (isDisabled) {
      haptic.warning();
      showPeriodLockToast();
      return;
    }

    haptic.medium();

    if (period === 'daily') {
      const date = getPeriodBaseDate('daily', periodOffset);
      setTimeout(() => openTransactionSheet(type, null, date), 120);
      return;
    }

    if (period === 'weekly') {
      openDateChoice(type);
      return;
    }

    openTransactionSheet(type);
  }

  return (
    <motion.button
      type="button"
      aria-label={
        isDisabled
          ? 'ثبت در این دوره فعلاً امکان‌پذیر نیست'
          : type === 'income'
            ? 'ثبت درآمد'
            : 'ثبت مصرف'
      }
      aria-disabled={isDisabled}
      onClick={handleClick}
      whileTap={isDisabled ? undefined : { scale: 0.92 }}
      whileHover={isDisabled ? undefined : { scale: 1.04 }}
      transition={{ duration: 0.16 }}
      className={[
        'fixed bottom-[36px] left-1/2 z-50',
        'flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full',
        'border transition-all duration-200 lg:hidden',
        isDisabled
          ? 'cursor-not-allowed border-[#00A88A]/30 bg-[#00A88A]/50 text-white/40'
          : 'border-white/20 bg-[linear-gradient(155deg,#00D1A7,#00A88A)] text-white shadow-[0_8px_32px_rgba(0,209,167,0.35)]',
      ].join(' ')}
    >
      <Plus size={27} strokeWidth={2.4} />
    </motion.button>
  );
}

export default FloatingActionButton;