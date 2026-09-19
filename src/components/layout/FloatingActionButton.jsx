import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useAppStore } from '../store/appStore';
import { useHaptic } from '../hooks/useHaptic';

function FloatingActionButton() {
  const location = useLocation();
  const haptic = useHaptic();

  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const openDateChoice = useAppStore((s) => s.openDateChoice);
  const weekOffset = useAppStore((s) => s.weekOffset);

  if (location.pathname === '/settings') {
    return null;
  }

  const type = location.pathname === '/income' ? 'income' : 'expense';

  function handleClick() {
    haptic.medium();

    if (weekOffset === 0) {
      openTransactionSheet(type);
    } else {
      openDateChoice(type);
    }
  }

  return (
    <motion.button
      type="button"
      aria-label={type === 'income' ? 'ثبت درآمد' : 'ثبت مصرف'}
      onClick={handleClick}
      whileTap={{ scale: 0.92 }}
      whileHover={{ scale: 1.04 }}
      transition={{ duration: 0.16 }}
      className="
        fixed bottom-[36px] left-1/2 z-50
        flex h-[58px] w-[58px] -translate-x-1/2 items-center justify-center rounded-full
        border border-[#E3B341]/20
        bg-[linear-gradient(155deg,#E3B341,#B9862A)]
        text-[#0A1614]
        shadow-[0_8px_30px_rgba(227,179,65,0.22)]
        lg:hidden
      "
    >
      <Plus size={27} strokeWidth={2.4} />
    </motion.button>
  );
}

export default FloatingActionButton;