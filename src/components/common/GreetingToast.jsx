import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function GreetingToast({
  open,
  greeting,
  onClose,
  duration = 7000,
}) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, onClose, duration]);

  return (
    <AnimatePresence>
      {open && greeting && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          className="
            pointer-events-none fixed inset-x-0 top-0 z-[95]
            flex justify-center px-3
            pt-[max(12px,env(safe-area-inset-top))]
          "
        >
          <div
            dir="rtl"
            className="
              glass-strong pointer-events-auto flex w-full max-w-[420px] items-start gap-3
              rounded-3xl border-[#00D1A7]/25 p-4
              shadow-[0_12px_40px_rgba(0,0,0,0.45)]
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[22px]">
              {greeting.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-extrabold text-[#00D1A7]">
                {greeting.greeting} {greeting.name}!
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#F8FAFC]">
                {greeting.message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
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