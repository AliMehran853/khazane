import { motion } from 'framer-motion';
import { Plus } from 'lucide-react';
import { useLocation } from 'react-router-dom';

import { useRecordTransaction } from '../hooks/useRecordTransaction';
import { ROUTES } from '../utils/constants';

function FloatingActionButton() {
  const location = useLocation();
  const { type, isDisabled, trigger } = useRecordTransaction();

  if (location.pathname === ROUTES.settings) return null;

  const ariaLabel = isDisabled
    ? 'ثبت در این دوره فعلاً امکان‌پذیر نیست'
    : type === 'income'
      ? 'ثبت درآمد'
      : 'ثبت مصرف';

  return (
    <motion.button
      type="button"
      aria-label={ariaLabel}
      aria-disabled={isDisabled}
      onClick={trigger}
      whileTap={isDisabled ? undefined : { scale: 0.92 }}
      whileHover={isDisabled ? undefined : { scale: 1.04 }}
      transition={{ duration: 0.16 }}
      data-disabled={isDisabled}
      className="kh-fab lg:hidden"
    >
      <Plus size={27} strokeWidth={2.4} />
    </motion.button>
  );
}

export default FloatingActionButton;