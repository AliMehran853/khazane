import { Delete } from 'lucide-react';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
];

export default function PinPad({ onKey, onBackspace, onClear }) {
  return (
    <div className="grid grid-cols-3 gap-2.5 lg:gap-3" dir="ltr">
      {KEYS.flat().map((key) => {
        if (key === 'clear') {
          return (
            <button
              key="clear"
              type="button"
              onClick={onClear}
              className="
                flex h-[58px] items-center justify-center rounded-2xl
                text-[12px] font-semibold text-[#9CAEB8]
                transition-all
                active:scale-95 active:bg-white/[0.06]
                lg:h-[62px] lg:text-[13px]
              "
            >
              پاک
            </button>
          );
        }

        if (key === 'backspace') {
          return (
            <button
              key="backspace"
              type="button"
              onClick={onBackspace}
              className="
                flex h-[58px] items-center justify-center rounded-2xl
                text-[#9CAEB8]
                transition-all
                active:scale-95 active:bg-white/[0.06]
                lg:h-[62px]
              "
            >
              <Delete size={22} strokeWidth={1.8} />
            </button>
          );
        }

        return (
          <button
            key={key}
            type="button"
            onClick={() => onKey(key)}
            className="
              group relative flex h-[58px] items-center justify-center
              overflow-hidden rounded-2xl
              border border-[#00D1A7]/15
              bg-[rgba(11,34,38,0.55)]
              backdrop-blur-2xl
              text-[22px] font-bold text-[#F1F5F9]
              shadow-[inset_0_1px_0_0_rgba(0,209,167,0.08)]
              transition-all
              hover:border-[#00D1A7]/30 hover:bg-[rgba(0,209,167,0.10)]
              active:scale-95 active:border-[#00D1A7]/50 active:bg-[#00D1A7]/[0.18]
              lg:h-[62px] lg:text-[26px]
            "
          >
            {/* هاله‌ی داخلی */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  'radial-gradient(circle at 50% 30%, rgba(0,209,167,0.20), transparent 70%)',
              }}
            />
            <span className="relative">{key}</span>
          </button>
        );
      })}
    </div>
  );
}