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
              pointer-events-auto flex w-full max-w-[420px] items-start gap-3
              rounded-3xl border border-[#E3B341]/25
              bg-[linear-gradient(155deg,#1B3A32,#0F211E)]
              p-4 shadow-[0_12px_40px_rgba(0,0,0,0.4)]
              backdrop-blur-xl
            "
          >
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[22px]">
              {greeting.emoji}
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-[13.5px] font-extrabold text-[#E3B341]">
                {greeting.greeting} {greeting.name}!
              </p>
              <p className="mt-1 text-[12px] leading-relaxed text-[#F2EFE9]">
                {greeting.message}
              </p>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="
                flex h-7 w-7 shrink-0 items-center justify-center rounded-full
                text-[#8FA39D] transition-colors
                hover:bg-white/[0.06] hover:text-[#F2EFE9]
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