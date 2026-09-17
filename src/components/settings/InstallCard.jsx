import { Download, Smartphone, CheckCircle2 } from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

export default function InstallCard() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  // اگر نصب شده، نمایش بده که نصب است
  if (isInstalled) {
    return (
      <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#4FD1BE]/20 bg-[#4FD1BE]/[0.06] px-4 py-3.5">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4FD1BE]/[0.14] text-[#4FD1BE]">
          <CheckCircle2 size={19} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-semibold text-[#4FD1BE]">
            نصب شده روی دستگاه
          </p>
          <p className="mt-0.5 text-[11px] text-[#5C736C]">
            خزانه به‌صورت اپ روی صفحه‌ی خانه‌ی شماست.
          </p>
        </div>
      </div>
    );
  }

  // اگر قابلیت نصب ندارد (بعضی مرورگرها)
  if (!canInstall) {
    return null;
  }

  // دکمه‌ی نصب
  return (
    <button
      type="button"
      onClick={promptInstall}
      className="
        mt-3 flex w-full items-center gap-3 rounded-2xl
        border border-[#E3B341]/25 bg-[linear-gradient(155deg,#1B3A32_0%,#0F211E_75%)]
        p-4 text-right transition-all active:scale-[0.98]
      "
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[#E3B341]">
        <Smartphone size={20} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-[#F2EFE9]">
          نصب خزانه روی صفحه‌ی خانه
        </p>
        <p className="mt-1 text-[11px] text-[#8FA39D]">
          دسترسی سریع، بدون مرورگر، کاملاً آفلاین
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E3B341]/[0.14] text-[#E3B341]">
        <Download size={17} strokeWidth={2} />
      </div>
    </button>
  );
}