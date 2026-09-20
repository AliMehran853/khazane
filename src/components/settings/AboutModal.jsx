import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Heart, Sparkles } from 'lucide-react';

import AppLogo from '../common/AppLogo';
import ContactCard from './ContactCard';
import { APP_NAME, APP_VERSION, CHANGELOG } from '../utils/constants';

const FEATURES = [
  { emoji: '📊', label: 'نمودارها' },
  { emoji: '🔒', label: 'امنیت' },
  { emoji: '⚡', label: 'آفلاین' },
];

function lockBody() {
  const body = document.body;
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  const prevOverflow = body.style.overflow;
  const prevPaddingRight = body.style.paddingRight;

  body.style.overflow = 'hidden';
  if (scrollbarWidth > 0) {
    body.style.paddingRight = `${scrollbarWidth}px`;
  }

  return () => {
    body.style.overflow = prevOverflow;
    body.style.paddingRight = prevPaddingRight;
  };
}

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
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="
              glass-strong relative z-10 flex max-h-[88vh] w-full max-w-[440px] flex-col
              overflow-hidden rounded-[28px]
            "
          >
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(0,209,167,0.22), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="
                absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center
                rounded-xl border border-white/[0.08] bg-white/[0.06] text-[#94A3B8] backdrop-blur-md
                active:scale-95
              "
            >
              <X size={18} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-6">
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-[#00D1A7]/25 blur-2xl" />
                  <div className="relative">
                    <AppLogo size={78} />
                  </div>
                </div>
                <h2 className="mt-4 text-[24px] font-extrabold text-[#F8FAFC]">
                  {APP_NAME}
                </h2>
                <p className="mt-1 text-[11.5px] text-[#64748B]">
                  نسخه {APP_VERSION}
                </p>
              </div>

              <div className="glass-inner mt-6 rounded-2xl p-4">
                <p className="text-center text-[12.5px] leading-relaxed text-[#94A3B8]">
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
                    <span className="text-[20px]">{f.emoji}</span>
                    <span className="mt-1 text-[10.5px] font-semibold text-[#94A3B8]">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* سازنده */}
              <div className="mt-6">
                <h3 className="mb-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  <Sparkles size={12} className="text-[#00D1A7]" />
                  سازنده
                  <Sparkles size={12} className="text-[#00D1A7]" />
                </h3>

                <div className="glass-inner rounded-2xl border-[#00D1A7]/25 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(155deg,#00D1A7,#00A88A)] text-[22px] font-extrabold text-[#0F172A] shadow-[0_6px_20px_rgba(0,209,167,0.30)]">
                      ع
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-extrabold text-[#F8FAFC]">
                        علی مهران
                      </p>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-[#00D1A7]">
                        فرانت‌اند دولوپر
                      </p>
                    </div>
                    <Code2 size={20} className="shrink-0 text-[#00D1A7]/60" />
                  </div>

                  <p className="mt-3.5 text-[11.5px] leading-relaxed text-[#94A3B8]">
                    تجربه‌های کاربری ساده و دل‌نشین می‌سازم. این اپ رو با React
                    و Tailwind طراحی کردم تا مدیریت مالی شخصی برای همه راحت و
                    لذت‌بخش بشه.
                  </p>

                  <p className="mt-2 text-[11.5px] leading-relaxed text-[#94A3B8]">
                    اگه پیشنهاد یا ایده‌ای داری، خوشحال می‌شم بشنوم.
                  </p>
                </div>
              </div>

              {/* تغییرات نسخه‌ها */}
              <div className="mt-6">
                <h3 className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  تغییرات نسخه‌ها
                </h3>

                <div className="space-y-3">
                  {CHANGELOG.map((log) => (
                    <div
                      key={log.version}
                      className="glass-inner rounded-2xl p-4"
                    >
                      <div className="mb-2 flex items-center justify-between">
                        <span className="rounded-lg border border-[#00D1A7]/25 bg-[#00D1A7]/[0.14] px-2 py-0.5 text-[11px] font-bold text-[#00D1A7]">
                          نسخه {log.version}
                        </span>
                        <span className="text-[10.5px] text-[#64748B]">
                          {log.date}
                        </span>
                      </div>

                      <ul className="space-y-1">
                        {log.items.map((item, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2 text-[11.5px] leading-relaxed text-[#94A3B8]"
                          >
                            <span className="mt-[7px] h-1 w-1 shrink-0 rounded-full bg-[#00D1A7]/60" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>

              {/* ارتباط */}
              <div className="mt-5">
                <h3 className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#64748B]">
                  راه‌های ارتباطی
                </h3>
                <ContactCard />
              </div>

              <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#64748B]">
                ساخته شده با
                <Heart size={11} className="fill-[#F43F5E] text-[#F43F5E]" />
                در افغانستان
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}