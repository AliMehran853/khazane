import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Bell } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { useAppStore } from '../store/appStore';

function DailyReminderModal({ open, onClose, onConfirmNavigate }) {
  const { t } = useTranslation();
  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);

  async function handleYes() {
    await onClose?.();
  }

  async function handleNo() {
    await onClose?.();
    if (onConfirmNavigate) {
      onConfirmNavigate();
    } else {
      openTransactionSheet('expense');
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={handleYes}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="glass-strong relative z-10 w-full max-w-[340px] rounded-[28px] border-primary/20 p-6 lg:max-w-[400px] lg:p-7"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl border border-primary/25 bg-primary/[0.16] text-primary"
              >
                <Bell size={30} strokeWidth={1.8} />
              </motion.div>
            </div>

            <h2 className="mt-5 text-center text-[17px] font-extrabold text-fg-1 lg:text-[18px]">
              {t('reminder.modalTitle')}
            </h2>

            <p className="mt-2 text-center text-[12.5px] leading-relaxed text-fg-2 lg:text-[13px]">
              {t('reminder.modalText')}
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleYes}
                className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-primary/30 bg-primary/[0.14] text-[12.5px] font-bold text-primary backdrop-blur-md transition-all active:scale-[0.97]"
              >
                <CheckCircle2 size={17} strokeWidth={2} />
                {t('reminder.modalYes')}
              </button>

              <button
                type="button"
                onClick={handleNo}
                className="flex min-h-[50px] items-center justify-center gap-2 rounded-2xl border border-expense/30 bg-expense/[0.14] text-[12.5px] font-bold text-expense backdrop-blur-md transition-all active:scale-[0.97]"
              >
                <XCircle size={17} strokeWidth={2} />
                {t('reminder.modalNo')}
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-fg-3">
              {t('reminder.modalHint')}
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DailyReminderModal;