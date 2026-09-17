import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useEffect } from 'react';
import TransactionForm from './TransactionForm';
import { getTodayShort } from '../utils/dates';

function TransactionSheet({ open, type, onClose }) {
  const isIncome = type === 'income';

  // قفل اسکرول پس‌زمینه
  useEffect(() => {
    if (!open) return;

    const scrollY = window.scrollY;
    const body = document.body;

    const prevPosition = body.style.position;
    const prevTop = body.style.top;
    const prevLeft = body.style.left;
    const prevRight = body.style.right;
    const prevWidth = body.style.width;

    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.left = '0';
    body.style.right = '0';
    body.style.width = '100%';

    return () => {
      body.style.position = prevPosition;
      body.style.top = prevTop;
      body.style.left = prevLeft;
      body.style.right = prevRight;
      body.style.width = prevWidth;

      window.scrollTo(0, scrollY);
    };
  }, [open]);

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
            className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 320 }}
            className="
              fixed z-[70] mx-auto flex flex-col overflow-hidden
              rounded-[24px] border border-white/[0.07] bg-[#0F211E]
              outline-none

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
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-white/[0.12] lg:hidden" />

              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-[#5C736C] lg:text-[12px]">
                    {isIncome ? 'ثبت درآمد جدید' : 'ثبت مصرف جدید'}
                  </p>

                  <h2 className="mt-0.5 text-[18px] font-bold text-[#F2EFE9] lg:text-[20px]">
                    {isIncome ? 'ثبت درآمد' : 'ثبت مصرف'}
                  </h2>

                  <p className="mt-1 text-[10.5px] font-medium text-[#E3B341] lg:text-[11.5px]">
                    📅 {getTodayShort()}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D] active:scale-95 lg:h-10 lg:w-10"
                  aria-label="بستن"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            <TransactionForm type={type} onSuccess={onClose} />
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

export default TransactionSheet;