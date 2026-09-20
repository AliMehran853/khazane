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

  if (location.pathname === '/settings') {
    return null;
  }

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
      openTransactionSheet(type, null, date);
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
          ? 'cursor-not-allowed border-[#8A7530] bg-[linear-gradient(155deg,#A89047,#8A7530)] text-[#3D3419]'
          : 'border-[#E3B341]/20 bg-[linear-gradient(155deg,#E3B341,#B9862A)] text-[#0A1614] shadow-[0_8px_30px_rgba(227,179,65,0.22)]',
      ].join(' ')}
    >
      <Plus size={27} strokeWidth={2.4} />
    </motion.button>
  );
}

export default FloatingActionButton;