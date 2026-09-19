import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MoreVertical, Pencil, Trash2 } from 'lucide-react';

import { getCategoryIcon } from '../utils/categoryIcons';
import {
  formatTransactionDate,
  formatFullDate,
  formatTime12,
} from '../utils/dates';
import { useAppStore } from '../store/appStore';
import { deleteTransaction } from '../services/transactionService';

function formatNumber(value) {
  return new Intl.NumberFormat('fa-AF').format(Math.round(value || 0));
}

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

  const iconBg = isIncome
    ? 'bg-[#4FD1BE]/[0.10] text-[#4FD1BE]'
    : 'bg-[#E2574C]/[0.10] text-[#E2574C]';

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
      <div className="relative border-b border-white/[0.05] last:border-b-0">
        <div className="flex items-start gap-3 px-4 py-3 lg:px-5 lg:py-3.5">
          {/* آیکون دسته */}
          <div
            className={[
              'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl lg:h-11 lg:w-11',
              iconBg,
            ].join(' ')}
          >
            <Icon size={18} strokeWidth={1.9} />
          </div>

          {/* محتوا */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] font-semibold text-[#F2EFE9] lg:text-[13.5px]">
              {category?.name || 'بدون دسته'}
            </p>

            {note && (
              <p className="mt-0.5 truncate text-[10.5px] text-[#5C736C] lg:text-[11px]">
                {note}
              </p>
            )}

            <p className="mt-0.5 truncate text-[9.5px] font-medium text-[#5C736C]/80 lg:text-[10px]">
              {dateTimeText}
            </p>
          </div>

          {/* مبلغ + چوون + منو */}
          <div className="flex shrink-0 items-start gap-1">
            <span
              className={[
                'text-[14px] font-bold lg:text-[15px]',
                isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]',
              ].join(' ')}
            >
              {isIncome ? '+' : '-'}
              {formatNumber(transaction.amount)}
            </span>

            {/* چوون باز کردن جزئیات */}
            <button
              type="button"
              onClick={() => setExpanded((v) => !v)}
              aria-label="جزئیات بیشتر"
              aria-expanded={expanded}
              className="
                -mr-1 flex h-6 w-6 items-center justify-center rounded-lg
                text-[#5C736C]/60 transition-colors
                hover:bg-white/[0.05] hover:text-[#8FA39D]
                active:scale-90
              "
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

            {/* منوی سه‌نقطه */}
            <div ref={menuRef} className="relative">
              <button
                type="button"
                onClick={() => setMenuOpen((v) => !v)}
                aria-label="گزینه‌ها"
                aria-expanded={menuOpen}
                className="
                  -mr-1 flex h-6 w-6 items-center justify-center rounded-lg
                  text-[#5C736C]/60 transition-colors
                  hover:bg-white/[0.05] hover:text-[#8FA39D]
                  active:scale-90
                "
              >
                <MoreVertical size={15} strokeWidth={2} />
              </button>

              {menuOpen && (
                <div
                  className="
                    absolute left-0 top-[calc(100%+4px)] z-50 min-w-[130px]
                    overflow-hidden rounded-xl border border-white/[0.08]
                    bg-[#153029] py-1 shadow-2xl
                  "
                  dir="rtl"
                >
                  <button
                    type="button"
                    onClick={handleEdit}
                    className="flex w-full items-center gap-2 px-3 py-2 text-right text-[12.5px] font-semibold text-[#F2EFE9] transition-colors hover:bg-white/[0.04]"
                  >
                    <Pencil
                      size={14}
                      strokeWidth={2}
                      className="text-[#E3B341]"
                    />
                    ویرایش
                  </button>

                  <div className="mx-2 h-px bg-white/[0.06]" />

                  <button
                    type="button"
                    onClick={handleDeleteClick}
                    className="flex w-full items-center gap-2 px-3 py-2 text-right text-[12.5px] font-semibold text-[#E2574C] transition-colors hover:bg-[#E2574C]/[0.08]"
                  >
                    <Trash2 size={14} strokeWidth={2} />
                    حذف
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* پنل بازشوی جزئیات سریع */}
        <AnimatePresence initial={false}>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="overflow-hidden"
            >
              <div className="space-y-2 bg-[#0A1614]/40 px-4 py-3 lg:px-5">
                <DetailRow label="یادداشت" value={note || '—'} />
                <DetailRow label="تاریخ" value={fullDateText} />
                <DetailRow label="ساعت" value={timeText} />
                <DetailRow
                  label="نوع"
                  value={isIncome ? 'درآمد' : 'مصرف'}
                  valueClass={
                    isIncome ? 'text-[#4FD1BE]' : 'text-[#E2574C]'
                  }
                />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* مودال تایید حذف */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            onClick={() => !deleting && setConfirmDelete(false)}
          />
          <div
            className="relative z-10 w-full max-w-[320px] rounded-[22px] border border-white/[0.08] bg-[#0F211E] p-5"
            dir="rtl"
          >
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2574C]/[0.14] text-[#E2574C]">
                <Trash2 size={22} strokeWidth={1.9} />
              </div>
            </div>

            <h3 className="mt-3 text-center text-[14px] font-extrabold text-[#F2EFE9]">
              حذف تراکنش
            </h3>

            <p className="mt-2 text-center text-[11.5px] leading-relaxed text-[#8FA39D]">
              آیا مطمئنی می‌خواهی این تراکنش را حذف کنی؟
              <br />
              این عملیات قابل بازگشت نیست.
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={deleting}
                onClick={() => setConfirmDelete(false)}
                className="rounded-xl border border-white/[0.08] bg-[#153029] py-2.5 text-[12px] font-semibold text-[#8FA39D] disabled:opacity-50"
              >
                انصراف
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleConfirmDelete}
                className="rounded-xl bg-[linear-gradient(155deg,#E2574C,#B8392F)] py-2.5 text-[12px] font-bold text-white disabled:opacity-50"
              >
                {deleting ? 'در حال حذف...' : 'حذف کن'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ============================================================
// یک ردیف ساده برای نمایش label/value
// ============================================================

function DetailRow({ label, value, valueClass = '' }) {
  return (
    <div className="flex items-start justify-between gap-3 text-[11.5px]">
      <span className="shrink-0 text-[#5C736C]">{label}</span>
      <span
        className={['text-right font-semibold text-[#F2EFE9]', valueClass].join(
          ' ',
        )}
      >
        {value}
      </span>
    </div>
  );
}