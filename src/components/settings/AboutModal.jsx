import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Heart, Sparkles, Calendar } from 'lucide-react';

import AppLogo from '../common/AppLogo';
import ContactCard from './ContactCard';
import { lockBody } from '../utils/scrollLock';
import { APP_NAME, APP_VERSION, CHANGELOG } from '../utils/constants';

const FEATURES = [
  { emoji: '📊', label: 'نمودارها' },
  { emoji: '🔒', label: 'امنیت' },
  { emoji: '⚡', label: 'آفلاین' },
];

export default function AboutModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return;
    return lockBody();
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
            onClick={onClose}
            className="kh-modal-overlay"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="glass-strong relative z-10 flex max-h-[88vh] w-full max-w-[440px] flex-col overflow-hidden rounded-3xl"
          >
            <div className="kh-modal-glow" style={{ height: '12rem' }} />

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="kh-close-btn absolute left-4 top-4 z-10"
            >
              <X size={18} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-primary/25 blur-2xl" />
                  <div className="relative">
                    <AppLogo size={78} />
                  </div>
                </div>
                <h2 className="mt-4 text-2xl font-extrabold text-fg-1">
                  {APP_NAME}
                </h2>
                <p className="mt-1 text-xs text-fg-3">نسخه {APP_VERSION}</p>
              </div>

              <div className="glass-inner mt-6 rounded-2xl p-4">
                <p className="text-center text-sm leading-relaxed text-fg-2">
                  اپلیکیشن مدیریت درآمد و مصارف شخصی، ساخته شده با علاقه برای
                  سادگی و کارایی. کاملاً آفلاین، سریع و امن — همه‌ی داده‌ها فقط
                  روی دستگاه خودت ذخیره می‌شن.
                </p>
              </div>

              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className="glass-inner flex flex-col items-center rounded-2xl py-3"
                  >
                    <span className="text-xl">{f.emoji}</span>
                    <span className="mt-1 text-2xs font-semibold text-fg-2">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-6">
                <h3 className="mb-3 flex items-center justify-center gap-1.5 text-center text-xs font-bold uppercase tracking-wider text-fg-3">
                  <Sparkles size={12} className="text-primary" />
                  سازنده
                  <Sparkles size={12} className="text-primary" />
                </h3>

                <div className="glass-inner rounded-2xl border-primary/25 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-b from-primary to-primary-dark text-2xl font-extrabold text-on-primary shadow-[0_6px_20px_rgba(0,209,167,0.30)]">
                      ع
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-lg font-extrabold text-fg-1">
                        علی مهران
                      </p>
                      <p className="mt-0.5 text-xs font-semibold text-primary">
                        فرانت‌اند دولوپر
                      </p>
                    </div>
                    <Code2 size={20} className="shrink-0 text-primary/60" />
                  </div>

                  <p className="mt-3.5 text-xs leading-relaxed text-fg-2">
                    تجربه‌های کاربری ساده و دل‌نشین می‌سازم. این اپ رو با React
                    و Tailwind طراحی کردم تا مدیریت مالی شخصی برای همه راحت و
                    لذت‌بخش بشه.
                  </p>

                  <p className="mt-2 text-xs leading-relaxed text-fg-2">
                    اگه پیشنهاد یا ایده‌ای داری، خوشحال می‌شم بشنوم.
                  </p>
                </div>
              </div>

              {/* Version history */}
              <div className="mt-6">
                <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-fg-3">
                  تغییرات نسخه‌ها
                </h3>

                <div className="space-y-3">
                  {CHANGELOG.map((log) => (
                    <div
                      key={log.version}
                      className="glass-inner rounded-2xl p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-lg border border-primary/25 bg-primary/15 px-2 py-0.5 text-xs font-bold text-primary">
                          نسخه {log.version}
                        </span>
                        <span className="flex items-center gap-1 text-2xs text-fg-3">
                          <Calendar size={11} strokeWidth={2} />
                          {log.date}
                        </span>
                      </div>

                      <ul className="space-y-1">
                        {log.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-xs leading-relaxed text-fg-2"
                          >
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-primary/60" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-5">
                <h3 className="mb-3 text-center text-xs font-bold uppercase tracking-wider text-fg-3">
                  راه‌های ارتباطی
                </h3>
                <ContactCard />
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-2xs text-fg-3">
                ساخته شده با
                <Heart size={11} className="fill-expense text-expense" />
                در افغانستان
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}