import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import { lockBody } from '../utils/scrollLock';

export default function ConfirmDialog({
  open,
  onClose,
  icon: Icon,
  iconTone = 'danger',
  title,
  description,
  confirmLabel = 'تایید',
  cancelLabel = 'انصراف',
  onConfirm,
  loading = false,
  loadingLabel = '...',
}) {
  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  const iconClass =
    iconTone === 'danger'
      ? 'text-expense border-expense/25 bg-expense/15'
      : 'text-primary border-primary/25 bg-primary/15';

  const confirmClass = iconTone === 'danger' ? 'kh-btn-danger' : 'kh-btn-primary';

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => !loading && onClose?.()}
            className="kh-modal-overlay"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="glass-strong relative z-10 w-full max-w-[320px] rounded-3xl p-5"
          >
            {Icon && (
              <div className="flex justify-center">
                <div
                  className={[
                    'flex h-12 w-12 items-center justify-center rounded-2xl border',
                    iconClass,
                  ].join(' ')}
                >
                  <Icon size={22} strokeWidth={1.9} />
                </div>
              </div>
            )}

            <h3 className="mt-3 text-center text-md font-extrabold text-fg-1">
              {title}
            </h3>

            {description && (
              <div className="mt-2 text-center text-sm leading-relaxed text-fg-2">
                {description}
              </div>
            )}

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={onClose}
                className="kh-btn kh-btn-ghost py-2.5 text-sm"
              >
                {cancelLabel}
              </button>
              <button
                type="button"
                disabled={loading}
                onClick={onConfirm}
                className={['kh-btn py-2.5 text-sm', confirmClass].join(' ')}
              >
                {loading ? loadingLabel : confirmLabel}
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}