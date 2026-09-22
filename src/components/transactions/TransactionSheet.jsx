import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

import TransactionForm from './TransactionForm';
import { getTodayShort, formatShortDate } from '../utils/dates';
import { lockBody } from '../utils/scrollLock';

function TransactionSheet({
  open,
  type,
  editingTransaction,
  prefilledDate,
  onClose,
}) {
  const isEditing = Boolean(editingTransaction);
  const effectiveType = isEditing ? editingTransaction.type : type;
  const isIncome = effectiveType === 'income';

  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  const subtitle = isEditing
    ? 'ویرایش تراکنش'
    : isIncome
      ? 'ثبت درآمد جدید'
      : 'ثبت مصرف جدید';

  const title = isEditing
    ? 'ویرایش تراکنش'
    : isIncome
      ? 'ثبت درآمد'
      : 'ثبت مصرف';

  const displayDate = prefilledDate
    ? formatShortDate(prefilledDate)
    : getTodayShort();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="kh-modal-overlay fixed inset-0 z-[60]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="glass-strong fixed z-[70] mx-auto flex flex-col overflow-hidden rounded-3xl outline-none inset-x-3 bottom-3 max-h-[88svh] w-auto max-w-[420px] lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2 lg:max-h-[85vh] lg:w-full lg:max-w-[560px] lg:-translate-x-1/2 lg:-translate-y-1/2"
            style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
          >
            <div className="shrink-0 px-4 pt-3 pb-3 lg:px-6 lg:pt-4 lg:pb-4">
              <div className="kh-drag-handle lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-fg-3 lg:text-sm">{subtitle}</p>
                  <h2 className="mt-0.5 text-xl font-bold text-fg-1 lg:text-2xl">
                    {title}
                  </h2>
                  <p className="mt-1 text-2xs font-medium text-primary lg:text-xs">
                    📅 {displayDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="kh-close-btn lg:h-10 lg:w-10"
                  aria-label="بستن"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <TransactionForm
              type={effectiveType}
              editingTransaction={editingTransaction}
              prefilledDate={prefilledDate}
              onSuccess={onClose}
            />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TransactionSheet;