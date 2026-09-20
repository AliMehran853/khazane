import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import TransactionForm from './TransactionForm';
import { getTodayShort, formatShortDate } from '../utils/dates';

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

    const body = document.body;
    const scrollbarWidth =
      window.innerWidth - document.documentElement.clientWidth;
    const prevOverflow = body.style.overflow;
    const prevPaddingRight = body.style.paddingRight;

    body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      body.style.paddingRight = `${scrollbarWidth}px`;
    }

    return () => {
      body.style.overflow = prevOverflow;
      body.style.paddingRight = prevPaddingRight;
    };
  }, [open]);

  const headerSubtitle = isEditing
    ? 'ویرایش تراکنش'
    : isIncome
      ? 'ثبت درآمد جدید'
      : 'ثبت مصرف جدید';

  const headerTitle = isEditing
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
            className="fixed inset-0 z-[60] bg-black/65 backdrop-blur-sm"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="
              glass-strong fixed z-[70] mx-auto flex flex-col overflow-hidden
              rounded-[24px] outline-none

              inset-x-3 bottom-3 max-h-[88svh] w-auto max-w-[420px]

              lg:inset-x-auto lg:bottom-auto lg:left-1/2 lg:top-1/2
              lg:max-h-[85vh] lg:w-full lg:max-w-[560px]
              lg:-translate-x-1/2 lg:-translate-y-1/2
            "
            style={{
              paddingBottom: 'env(safe-area-inset-bottom)',
            }}
          >
            <div className="shrink-0 px-4 pt-3 pb-3 lg:px-6 lg:pt-4 lg:pb-4">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.18] lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#64748B] lg:text-[12px]">
                    {headerSubtitle}
                  </p>

                  <h2 className="mt-0.5 text-[18px] font-bold text-[#F8FAFC] lg:text-[20px]">
                    {headerTitle}
                  </h2>

                  <p className="mt-1 text-[10.5px] font-medium text-[#00D1A7] lg:text-[11.5px]">
                    📅 {displayDate}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.06] text-[#94A3B8] backdrop-blur-md active:scale-95 lg:h-10 lg:w-10"
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