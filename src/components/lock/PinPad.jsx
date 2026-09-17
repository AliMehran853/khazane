import { Delete } from 'lucide-react';

const KEYS = [
  ['1', '2', '3'],
  ['4', '5', '6'],
  ['7', '8', '9'],
  ['clear', '0', 'backspace'],
];

export default function PinPad({ onKey, onBackspace, onClear }) {
  return (
    <div className="grid grid-cols-3 gap-3" dir="ltr">
      {KEYS.flat().map((key) => {
        if (key === 'clear') {
          return (
            <button
              key="clear"
              type="button"
              onClick={onClear}
              className="flex h-[56px] items-center justify-center rounded-2xl text-[12px] font-semibold text-[#8FA39D] active:scale-95 active:bg-white/[0.03]"
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
              className="flex h-[56px] items-center justify-center rounded-2xl text-[#8FA39D] active:scale-95 active:bg-white/[0.03]"
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
            className="flex h-[56px] items-center justify-center rounded-2xl border border-white/[0.05] bg-[#0F211E] text-[22px] font-bold text-[#F2EFE9] transition-all active:scale-95 active:bg-[#153029]"
          >
            {key}
          </button>
        );
      })}
    </div>
  );
}