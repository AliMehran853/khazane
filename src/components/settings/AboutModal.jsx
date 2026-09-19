import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Code2, Heart, Sparkles } from 'lucide-react';

import AppLogo from '../common/AppLogo';
import ContactCard from './ContactCard';
import { APP_NAME, APP_VERSION } from '../utils/constants';

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
            className="absolute inset-0 bg-black/70 backdrop-blur-[2px]"
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            dir="rtl"
            className="
              relative z-10 flex max-h-[88vh] w-full max-w-[440px] flex-col
              overflow-hidden rounded-[28px] border border-white/[0.08]
              bg-[linear-gradient(160deg,#1B3A32_0%,#0F211E_75%)]
              shadow-2xl
            "
          >
            {/* هاله‌ی طلایی بالای مودال */}
            <div
              className="pointer-events-none absolute inset-x-0 top-0 h-48"
              style={{
                background:
                  'radial-gradient(circle at 50% 0%, rgba(227,179,65,0.22), transparent 70%)',
              }}
            />

            <button
              type="button"
              onClick={onClose}
              aria-label="بستن"
              className="
                absolute left-4 top-4 z-10 flex h-9 w-9 items-center justify-center
                rounded-xl bg-black/30 text-[#8FA39D] backdrop-blur-sm
                active:scale-95
              "
            >
              <X size={18} />
            </button>

            <div className="relative min-h-0 flex-1 overflow-y-auto px-6 pt-8 pb-6">
              {/* لوگو + نام */}
              <div className="flex flex-col items-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-3xl bg-[#E3B341]/25 blur-2xl" />
                  <div className="relative">
                    <AppLogo size={78} />
                  </div>
                </div>
                <h2 className="mt-4 text-[24px] font-extrabold text-[#F2EFE9]">
                  {APP_NAME}
                </h2>
                <p className="mt-1 text-[11.5px] text-[#5C736C]">
                  نسخه {APP_VERSION}
                </p>
              </div>

              {/* توضیح اپ */}
              <div className="mt-6 rounded-2xl border border-white/[0.06] bg-[#0A1614]/40 p-4">
                <p className="text-center text-[12.5px] leading-relaxed text-[#8FA39D]">
                  اپلیکیشن مدیریت درآمد و مصارف شخصی، ساخته شده با علاقه برای
                  سادگی و کارایی. کاملاً آفلاین، سریع و امن — همه‌ی داده‌ها فقط
                  روی دستگاه خودت ذخیره می‌شن.
                </p>
              </div>

              {/* ویژگی‌ها */}
              <div className="mt-4 grid grid-cols-3 gap-2.5">
                {FEATURES.map((f) => (
                  <div
                    key={f.label}
                    className="flex flex-col items-center rounded-2xl border border-white/[0.06] bg-[#153029]/60 py-3"
                  >
                    <span className="text-[20px]">{f.emoji}</span>
                    <span className="mt-1 text-[10.5px] font-semibold text-[#8FA39D]">
                      {f.label}
                    </span>
                  </div>
                ))}
              </div>

              {/* سازنده */}
              <div className="mt-6">
                <h3 className="mb-3 flex items-center justify-center gap-1.5 text-center text-[11px] font-bold uppercase tracking-wider text-[#5C736C]">
                  <Sparkles size={12} className="text-[#E3B341]" />
                  سازنده
                  <Sparkles size={12} className="text-[#E3B341]" />
                </h3>

                <div className="rounded-2xl border border-[#E3B341]/25 bg-[#E3B341]/[0.04] p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(155deg,#E3B341,#B9862A)] text-[22px] font-extrabold text-[#0A1614]">
                      ع
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-[15px] font-extrabold text-[#F2EFE9]">
                        علی مهران
                      </p>
                      <p className="mt-0.5 text-[11.5px] font-semibold text-[#E3B341]">
                        فرانت‌اند دولوپر
                      </p>
                    </div>
                    <Code2 size={20} className="shrink-0 text-[#E3B341]/60" />
                  </div>

                  <p className="mt-3.5 text-[11.5px] leading-relaxed text-[#8FA39D]">
                    تجربه‌های کاربری ساده و دل‌نشین می‌سازم. این اپ رو با React
                    و Tailwind طراحی کردم تا مدیریت مالی شخصی برای همه راحت و
                    لذت‌بخش بشه.
                  </p>

                  <p className="mt-2 text-[11.5px] leading-relaxed text-[#8FA39D]">
                    اگه پیشنهاد یا ایده‌ای داری، خوشحال می‌شم بشنوم.
                  </p>
                </div>
              </div>

              {/* ارتباط */}
              <div className="mt-5">
                <h3 className="mb-3 text-center text-[11px] font-bold uppercase tracking-wider text-[#5C736C]">
                  راه‌های ارتباطی
                </h3>
                <ContactCard />
              </div>

              {/* فوتر */}
              <p className="mt-6 flex items-center justify-center gap-1.5 text-center text-[10.5px] text-[#5C736C]">
                ساخته شده با
                <Heart size={11} className="fill-[#E2574C] text-[#E2574C]" />
                در افغانستان
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}