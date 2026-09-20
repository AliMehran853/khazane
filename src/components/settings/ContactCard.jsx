import { MessageCircle, Phone } from 'lucide-react';

const PHONE_LOCAL = '0778765853';
const PHONE_INTL = '93778765853';

const WHATSAPP_MESSAGE = encodeURIComponent(
  'سلام علی جان! 👋\n' +
    'از اپلیکیشن «خزانه» استفاده می‌کنم و یه پیشنهاد/نظر داشتم:\n\n' +
    '_______________________\n\n' +
    'ممنون از وقتی که گذاشتی 🙏',
);

export default function ContactCard() {
  const waLink = `https://wa.me/${PHONE_INTL}?text=${WHATSAPP_MESSAGE}`;

  return (
    <div className="space-y-2.5">
      <a
        href={waLink}
        target="_blank"
        rel="noopener noreferrer"
        className="
          group flex w-full items-center gap-3 rounded-2xl
          border border-[#25D366]/25 bg-[#25D366]/[0.08] p-3.5 text-right
          backdrop-blur-md
          transition-all hover:bg-[#25D366]/[0.14] active:scale-[0.98]
        "
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#25D366]/25 bg-[#25D366]/[0.16] text-[#25D366]">
          <MessageCircle size={20} strokeWidth={2} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F8FAFC]">واتساپ</p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]" dir="ltr">
            {PHONE_LOCAL}
          </p>
        </div>

        <span className="shrink-0 text-[10.5px] font-semibold text-[#25D366]">
          گفتگو ←
        </span>
      </a>

      <a
        href={`tel:+${PHONE_INTL}`}
        className="
          glass-inner flex w-full items-center gap-3 rounded-2xl
          p-3.5 text-right
          transition-all hover:border-[#00D1A7]/30 active:scale-[0.98]
        "
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.06] bg-white/[0.04] text-[#00D1A7]">
          <Phone size={20} strokeWidth={1.9} />
        </div>

        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F8FAFC]">تماس مستقیم</p>
          <p className="mt-0.5 text-[11px] text-[#94A3B8]" dir="ltr">
            +{PHONE_INTL}
          </p>
        </div>
      </a>
    </div>
  );
}