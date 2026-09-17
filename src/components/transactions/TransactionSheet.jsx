import { Drawer } from 'vaul';
import { X } from 'lucide-react';
import TransactionForm from './TransactionForm';
import { getTodayShort } from '../utils/dates';

function TransactionSheet({ open, type, onClose }) {
  const isIncome = type === 'income';

  return (
    <Drawer.Root
      open={open}
      onOpenChange={(value) => {
        if (!value) onClose?.();
      }}
    >
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-[60] bg-black/60 backdrop-blur-[2px]" />

        <Drawer.Content
          className="
            fixed inset-x-0 bottom-0 z-[70] mx-auto
            flex max-h-[90dvh] w-full max-w-[420px] flex-col
            rounded-t-[30px] border border-white/[0.07] bg-[#0F211E]
            outline-none
          "
        >
          {/* هدر ثابت */}
          <div className="shrink-0 px-4 pt-3">
            <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-white/[0.12]" />

            <div className="mb-5 flex items-start justify-between gap-3">
              <div className="min-w-0 flex-1">
                <p className="text-[11px] text-[#5C736C]">
                  {isIncome ? 'ثبت درآمد جدید' : 'ثبت مصرف جدید'}
                </p>

                <Drawer.Title className="mt-1 text-[19px] font-bold text-[#F2EFE9]">
                  {isIncome ? 'ثبت درآمد' : 'ثبت مصرف'}
                </Drawer.Title>

                <p className="mt-1 text-[11px] font-medium text-[#E3B341]">
                  📅 {getTodayShort()}
                </p>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#153029] text-[#8FA39D] active:scale-95"
                aria-label="بستن"
              >
                <X size={19} />
              </button>
            </div>
          </div>

          {/* بدنه اسکرول‌شدنی */}
          <div className="min-h-0 flex-1 overflow-y-auto px-4 pb-[calc(env(safe-area-inset-bottom)+20px)]">
            <TransactionForm type={type} onSuccess={onClose} />
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}

export default TransactionSheet;