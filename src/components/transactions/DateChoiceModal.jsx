import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CalendarCheck2, X } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import { lockBody } from '../utils/scrollLock';
import {
  getPeriodBaseDate,
  getWeekDays,
  formatFullDate,
} from '../utils/dates';
import { toPersianDigits } from '../utils/formatting';

export default function DateChoiceModal() {
  const open = useAppStore((s) => s.dateChoiceOpen);
  const type = useAppStore((s) => s.dateChoiceType);
  const periodOffset = useAppStore((s) => s.periodOffset);

  const closeDateChoice = useAppStore((s) => s.closeDateChoice);
  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);

  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  const baseDate = getPeriodBaseDate('weekly', periodOffset);
  const days = getWeekDays(baseDate);
  const today = new Date();

  function pickToday() {
    closeDateChoice();
    setTimeout(() => openTransactionSheet(type, null, today), 220);
  }

  function pickDay(date) {
    closeDateChoice();
    setTimeout(() => openTransactionSheet(type, null, date), 220);
  }

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[130] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            onClick={closeDateChoice}
            className="kh-modal-overlay"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            style={{ willChange: 'transform, opacity' }}
            className="glass-strong relative z-10 w-full max-w-[420px] overflow-hidden rounded-3xl"
          >
            <div className="kh-modal-glow" />

            <div className="relative flex items-start justify-between gap-3 px-5 pt-5 pb-4">
              <div className="min-w-0 flex-1">
                <p className="text-xs text-fg-3">تاریخ ثبت را انتخاب کن</p>
                <h2 className="mt-0.5 text-xl font-extrabold text-fg-1">
                  کجا ثبت بشه؟
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDateChoice}
                aria-label="بستن"
                className="kh-close-btn"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative px-5 pb-5">
              <button
                type="button"
                onClick={pickToday}
                className="flex w-full items-center gap-3 rounded-2xl border border-primary/30 bg-primary/10 p-4 text-right backdrop-blur-md transition-all hover:bg-primary/15 active:scale-[0.98]"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/15 text-primary">
                  <CalendarCheck2 size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-md font-extrabold text-fg-1">
                    ثبت در امروز
                  </p>
                  <p className="mt-0.5 text-xs text-fg-2">
                    {formatFullDate(today)}
                  </p>
                </div>
              </button>

              <div className="mt-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-px flex-1 bg-border-1" />
                  <span className="text-2xs font-semibold text-fg-3">
                    یا روزی از این هفته
                  </span>
                  <div className="h-px flex-1 bg-border-1" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {days.map((day) => {
                    const dayNum = toPersianDigits(day.date.getDate());
                    const isToday =
                      day.date.toDateString() === today.toDateString();

                    return (
                      <button
                        key={day.key}
                        type="button"
                        disabled={isToday}
                        onClick={() => pickDay(day.date)}
                        className={[
                          'flex flex-col items-center justify-center rounded-2xl border py-3 backdrop-blur-md transition-all active:scale-95',
                          isToday
                            ? 'cursor-not-allowed border-border-1 bg-fill-1 opacity-40'
                            : 'border-primary/25 bg-primary/10 text-primary hover:bg-primary/15',
                        ].join(' ')}
                      >
                        <CalendarDays
                          size={14}
                          strokeWidth={2}
                          className={isToday ? 'text-fg-3' : 'text-primary'}
                        />
                        <span
                          className={[
                            'mt-1 text-2xs font-semibold',
                            isToday ? 'text-fg-3' : 'text-fg-1',
                          ].join(' ')}
                        >
                          {day.shortLabel}
                        </span>
                        <span
                          className={[
                            'mt-0.5 text-2xs font-bold',
                            isToday ? 'text-fg-3' : 'text-primary',
                          ].join(' ')}
                        >
                          {dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-center text-2xs leading-relaxed text-fg-3">
                فقط روزهای این هفته در دسترس هستند. برای روزهای قدیمی‌تر،
                ابتدا هفته را با فلش‌ها عوض کن.
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}