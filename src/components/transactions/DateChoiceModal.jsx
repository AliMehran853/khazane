import { motion, AnimatePresence } from 'framer-motion';
import { CalendarDays, CalendarCheck2, X } from 'lucide-react';

import { useAppStore } from '../store/appStore';
import { getPeriodBaseDate, getWeekDays, formatFullDate } from '../utils/dates';

const FA_NUM = new Intl.NumberFormat('fa-AF');

export default function DateChoiceModal() {
  const open = useAppStore((s) => s.dateChoiceOpen);
  const type = useAppStore((s) => s.dateChoiceType);
  const periodOffset = useAppStore((s) => s.periodOffset);

  const closeDateChoice = useAppStore((s) => s.closeDateChoice);
  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);

  const baseDate = getPeriodBaseDate('weekly', periodOffset);
  const days = getWeekDays(baseDate);
  const today = new Date();

  function pickToday() {
    closeDateChoice();
    // ⭐ تأخیر هم‌سطح با انیمیشن خروج (۲۲۰ms)
    setTimeout(() => {
      openTransactionSheet(type, null, today);
    }, 220);
  }

  function pickDay(date) {
    closeDateChoice();
    setTimeout(() => {
      openTransactionSheet(type, null, date);
    }, 220);
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
            className="absolute inset-0 bg-black/70"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            style={{ willChange: 'transform, opacity' }}
            className="
              relative z-10 w-full max-w-[420px] overflow-hidden
              rounded-[26px] border border-white/[0.08]
              bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)]
              shadow-2xl
            "
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-32"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(227,179,65,0.20), transparent 70%)',
              }}
            />

            <div className="relative flex items-start justify-between gap-3 px-5 pt-5 pb-4">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#5C736C]">
                  تاریخ ثبت را انتخاب کن
                </p>
                <h2 className="mt-0.5 text-[17px] font-extrabold text-[#F2EFE9]">
                  کجا ثبت بشه؟
                </h2>
              </div>

              <button
                type="button"
                onClick={closeDateChoice}
                aria-label="بستن"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D] active:scale-95"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative px-5 pb-5">
              <button
                type="button"
                onClick={pickToday}
                className="
                  flex w-full items-center gap-3 rounded-2xl
                  border border-[#4FD1BE]/25 bg-[#4FD1BE]/[0.08]
                  p-4 text-right transition-all
                  hover:bg-[#4FD1BE]/[0.12] active:scale-[0.98]
                "
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#4FD1BE]/[0.14] text-[#4FD1BE]">
                  <CalendarCheck2 size={20} strokeWidth={2} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-extrabold text-[#F2EFE9]">
                    ثبت در امروز
                  </p>
                  <p className="mt-0.5 text-[11px] text-[#8FA39D]">
                    {formatFullDate(today)}
                  </p>
                </div>
              </button>

              <div className="mt-5">
                <div className="mb-2.5 flex items-center gap-2">
                  <div className="h-px flex-1 bg-white/[0.06]" />
                  <span className="text-[10.5px] font-semibold text-[#5C736C]">
                    یا روزی از این هفته
                  </span>
                  <div className="h-px flex-1 bg-white/[0.06]" />
                </div>

                <div className="grid grid-cols-4 gap-2">
                  {days.map((day) => {
                    const dayNum = FA_NUM.format(day.date.getDate());
                    const isToday =
                      day.date.toDateString() === today.toDateString();

                    return (
                      <button
                        key={day.key}
                        type="button"
                        disabled={isToday}
                        onClick={() => pickDay(day.date)}
                        className={[
                          'flex flex-col items-center justify-center rounded-2xl border py-3',
                          'transition-all active:scale-95',
                          isToday
                            ? 'cursor-not-allowed border-white/[0.04] bg-[#0A1614]/40 opacity-40'
                            : 'border-[#E3B341]/25 bg-[#E3B341]/[0.06] text-[#E3B341] hover:bg-[#E3B341]/[0.12]',
                        ].join(' ')}
                      >
                        <CalendarDays
                          size={14}
                          strokeWidth={2}
                          className={
                            isToday ? 'text-[#5C736C]' : 'text-[#E3B341]'
                          }
                        />
                        <span
                          className={[
                            'mt-1 text-[10.5px] font-semibold',
                            isToday ? 'text-[#5C736C]' : 'text-[#F2EFE9]',
                          ].join(' ')}
                        >
                          {day.shortLabel}
                        </span>
                        <span
                          className={[
                            'mt-0.5 text-[10px] font-bold',
                            isToday ? 'text-[#5C736C]' : 'text-[#E3B341]',
                          ].join(' ')}
                        >
                          {dayNum}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-4 text-center text-[10px] leading-relaxed text-[#5C736C]">
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