import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, X } from 'lucide-react';

import { useAppStore } from '../store/appStore';

const AUTO_DISMISS_MS = 4500;

export default function PeriodLockToast() {
  const open = useAppStore((s) => s.periodLockToastOpen);
  const hideToast = useAppStore((s) => s.hidePeriodLockToast);

  useEffect(() => {
    if (!open) return;
    const t = setTimeout(hideToast, AUTO_DISMISS_MS);
    return () => clearTimeout(t);
  }, [open, hideToast]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
          className="
            pointer-events-none fixed inset-x-0 top-0 z-[200]
            flex justify-center px-3
            pt-[max(12px,env(safe-area-inset-top))]
          "
          dir="rtl"
        >
          <div
            className="
              glass-strong pointer-events-auto flex w-full max-w-[420px] items-start gap-3
              rounded-3xl border-[#00D1A7]/25 p-4
              shadow-[0_12px_40px_rgba(0,0,0,0.45)]
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
              <Info size={22} strokeWidth={2} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-extrabold text-[#00D1A7]">
                امکان ثبت در این دوره نیست
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#F8FAFC]">
                برای ثبت تراکنش، از حالت{' '}
                <span className="font-bold text-[#00D1A7]">روزانه</span> یا{' '}
                <span className="font-bold text-[#00D1A7]">هفتگی</span>{' '}
                استفاده کن.
              </p>
            </div>

            <button
              type="button"
              onClick={hideToast}
              aria-label="بستن"
              className="
                flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                text-[#94A3B8] transition-colors
                hover:bg-white/[0.08] hover:text-[#F8FAFC]
                active:scale-90
              "
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}