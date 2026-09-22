import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function Toast({
  open,
  onClose,
  icon,
  emoji,
  title,
  children,
  duration = 7000,
  zIndex = 95,
}) {
  useEffect(() => {
    if (!open || !duration) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [open, onClose, duration]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: -60, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -40, opacity: 0 }}
          transition={{ type: 'spring', damping: 24, stiffness: 280 }}
          style={{ zIndex }}
          className="pointer-events-none fixed inset-x-0 top-0 flex justify-center px-3 pt-[max(12px,env(safe-area-inset-top))]"
        >
          <div dir="rtl" className="kh-toast pointer-events-auto">
            <div className="kh-toast-stripe" />

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary">
              {emoji ? <span className="text-2xl leading-none">{emoji}</span> : icon}
            </div>

            <div className="relative min-w-0 flex-1">
              <p className="text-md font-extrabold text-primary">{title}</p>
              {children && (
                <div className="mt-1 text-sm leading-relaxed text-fg-1">
                  {children}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-fg-2 transition-colors hover:bg-fill-3 hover:text-fg-1 active:scale-90"
            >
              <X size={14} strokeWidth={2.2} />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}