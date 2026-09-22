import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import ConfirmDialog from '../common/ConfirmDialog';
import { getCategoryIcon } from '../utils/categoryIcons';
import {
  formatTransactionDate,
  formatFullDate,
  formatTime12,
} from '../utils/dates';
import { formatNumber } from '../utils/formatting';
import { useAppStore } from '../store/appStore';
import { deleteTransaction } from '../services/transactionService';

export default function TransactionItem({ transaction, category }) {
  const [expanded, setExpanded] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const menuRef = useRef(null);

  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const refreshData = useAppStore((s) => s.refreshData);

  const Icon = getCategoryIcon(category?.icon);
  const isIncome = transaction.type === 'income';

  const iconClass = isIncome
    ? 'bg-primary/15 text-primary border-primary/25'
    : 'bg-expense/15 text-expense border-expense/25';

  const note = (transaction.note || '').trim();
  const dateTimeText = formatTransactionDate(transaction.date);
  const fullDateText = formatFullDate(transaction.date);
  const timeText = formatTime12(transaction.date);

  useEffect(() => {
    if (!menuOpen) return;
    function onDocClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    }
    function onEsc(e) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onEsc);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onEsc);
    };
  }, [menuOpen]);

  function handleEdit() {
    setMenuOpen(false);
    openTransactionSheet(transaction.type, transaction);
  }

  function handleDeleteClick() {
    setMenuOpen(false);
    setConfirmDelete(true);
  }

  async function handleConfirmDelete() {
    try {
      setDeleting(true);
      await deleteTransaction(transaction.id);
      refreshData();
      setConfirmDelete(false);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div className="relative border-b border-border-1 last:border-b-0">
        <div className="flex items-start gap-3 px-4 py-3 lg:px-5 lg:py-3.5">
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border backdrop-blur-md lg:h-11 lg:w-11',
              iconClass,
            ].join(' ')}
          >
            <Icon size={18} strokeWidth={1.9} />
          </div>

          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-semibold text-fg-1 lg:text-md">
              {category?.name || 'بدون دسته'}
            </p>

            {note && (
              <p className="mt-0.5 truncate text-2xs text-fg-3 lg:text-xs">
                {note}
              </p>
            )}

            <p className="mt-0.5 truncate text-2xs font-medium text-fg-3/80">
              {dateTimeText}
            </p>
          </div>

          <div className="flex shrink-0 items-start gap-1">
            <span
              className={[
                'text-md font-bold lg:text-lg',
                isIncome ? 'text-primary' : 'text-expense',
              ].join(' ')}
            >
              {isIncome ? '+' : '-'}
              {formatNumber(transaction.amount)}
            </span>

            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label="جزئیات بیشتر"
              aria-expanded={expanded}
              className="-mr-1 flex h-6 w-6 items-center justify-center rounded-lg text-fg-3/70 transition-colors hover:bg-fill-2 hover:text-fg-2 active:scale-90"
            >
              <ChevronDown
                size={14}
                strokeWidth={2.2}
                className={[
                  'transition-transform duration-200',
                  expanded ? 'rotate-180' : '',
                ].join(' ')}
              />
            </button>

            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="گزینه‌ها"
                aria-expanded={menuOpen}
                className="-mr-1 flex h-6 w-6 items-center justify-center rounded-lg text-fg-3/70 transition-colors hover:bg-fill-2 hover:text-fg-2 active:scale-90"
              >
                <MoreVertical size={15} strokeWidth={2} />
              </button>

              {menuOpen && (
                <div
                  className="glass-strong absolute left-0 top-[calc(100%+4px)] z-50 min-w-[130px] overflow-hidden rounded-xl py-1 shadow-2xl"
                  dir="rtl"
                >
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-3 py-2 text-right text-sm font-semibold text-fg-1 transition-colors hover:bg-fill-1"
                  >
                    <Pencil size={14} strokeWidth={2} className="text-primary" />
                    ویرایش
                  </button>

                  <div className="mx-2 h-px bg-border-1" />

                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex w-full items-center gap-2 px-3 py-2 text-right text-sm font-semibold text-expense transition-colors hover:bg-expense/10"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-2 bg-fill-1 px-4 py-3 backdrop-blur-md lg:px-5">
                <DetailRow label="یادداشت" value={note || '—'} />
                <DetailRow label="تاریخ" value={fullDateText} />
                <DetailRow label="ساعت" value={timeText} />
                <DetailRow
                  label="نوع"
                  value={isIncome ? 'درآمد' : 'مصرف'}
                  valueClass={isIncome ? 'text-primary' : 'text-expense'}
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        icon={Trash2}
        iconTone="danger"
        title="حذف تراکنش"
        description={
          <>
            آیا مطمئنی می‌خواهی این تراکنش را حذف کنی؟
            <br />
            این عملیات قابل بازگشت نیست.
          </>
        }
        confirmLabel="حذف کن"
        loadingLabel="در حال حذف..."
        loading={deleting}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}

function DetailRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-start justify-between gap-3 text-xs">
      <span className="shrink-0 text-fg-3">{label}</span>
      <span
        className={['text-right font-semibold text-fg-1', valueClass].join(' ')}
      >
        {value}
      </span>
    </div>
  );
}