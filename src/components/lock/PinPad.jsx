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
              className="kh-pin-action"
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
              className="kh-pin-action"
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
            className="kh-pin-key"
          >
            <span className="relative">{key}</span>
          </button>
        );
      })}
    </div>
  );
}