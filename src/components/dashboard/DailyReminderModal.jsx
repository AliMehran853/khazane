import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Bell } from 'lucide-react';
import { useAppStore } from '../store/appStore';

function DailyReminderModal({ open, onClose, onConfirmNavigate }) {
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
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="
              relative z-10 w-full max-w-[340px] lg:max-w-[400px]
              rounded-[28px] border border-white/[0.08]
              bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)]
              p-6 shadow-2xl lg:p-7
            "
            dir="rtl"
          >
            <div className="flex justify-center">
              <motion.div
                initial={{ scale: 0.6, rotate: -10 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.1, duration: 0.4, ease: 'backOut' }}
                className="flex h-16 w-16 items-center justify-center rounded-3xl bg-[#E3B341]/[0.14] text-[#E3B341]"
              >
                <Bell size={30} strokeWidth={1.8} />
              </motion.div>
            </div>

            <h2 className="mt-5 text-center text-[17px] font-extrabold text-[#F2EFE9] lg:text-[18px]">
              ثبت روزانه فراموش نشود
            </h2>

            <p className="mt-2 text-center text-[12.5px] leading-relaxed text-[#8FA39D] lg:text-[13px]">
              از آخرین ثبت شما بیش از ۲۴ ساعت گذشته.
              <br />
              آیا درآمد یا مصرف جدیدی ثبت کرده‌اید؟
            </p>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleYes}
                className="
                  flex min-h-[50px] items-center justify-center gap-2
                  rounded-2xl border border-[#4FD1BE]/30
                  bg-[#4FD1BE]/[0.10]
                  text-[12.5px] font-bold text-[#4FD1BE]
                  transition-all active:scale-[0.97]
                "
              >
                <CheckCircle2 size={17} strokeWidth={2} />
                بله، ثبت کرده‌ام
              </button>

              <button
                type="button"
                onClick={handleNo}
                className="
                  flex min-h-[50px] items-center justify-center gap-2
                  rounded-2xl border border-[#E2574C]/30
                  bg-[#E2574C]/[0.10]
                  text-[12.5px] font-bold text-[#E2574C]
                  transition-all active:scale-[0.97]
                "
              >
                <XCircle size={17} strokeWidth={2} />
                خیر، الان ثبت کنم
              </button>
            </div>

            <p className="mt-4 text-center text-[10px] leading-relaxed text-[#5C736C]">
              این یادآوری فقط یک بار در روز نمایش داده می‌شود.
            </p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

export default DailyReminderModal;