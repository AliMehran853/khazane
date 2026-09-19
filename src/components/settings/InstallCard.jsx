import { useState } from 'react';
import {
  Download,
  Smartphone,
  CheckCircle2,
  Share2,
  MoreVertical,
  Copy,
  Check,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

// ============================================================
// ۱. کارت نصب‌شده
// ============================================================
function InstalledCard() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#4FD1BE]/20 bg-[#4FD1BE]/[0.06] px-4 py-3.5 lg:mt-4 lg:px-5 lg:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#4FD1BE]/[0.14] text-[#4FD1BE]">
        <CheckCircle2 size={19} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#4FD1BE] lg:text-[14px]">
          نصب شده روی دستگاه
        </p>
        <p className="mt-0.5 text-[11px] text-[#5C736C] lg:text-[12px]">
          خزانه به‌صورت اپ روی صفحه‌ی خانه‌ی شماست.
        </p>
      </div>
    </div>
  );
}

// ============================================================
// ۲. کارت In-App Browser
// ============================================================
function InAppBrowserCard() {
  const [copied, setCopied] = useState(false);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  }

  return (
    <div className="mt-3 rounded-2xl border border-[#E3B341]/25 bg-[#0F211E] p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E3B341]/[0.14] text-[#E3B341]">
          <AlertCircle size={19} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F2EFE9] lg:text-[14px]">
            برای نصب، در مرورگر باز کن
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8FA39D] lg:text-[12px]">
            این صفحه داخل یک اپ (مثل اینستاگرام یا تلگرام) باز شده. برای نصب،
            لینک را کپی کن و در Chrome یا Safari باز کن.
          </p>

          <button
            type="button"
            onClick={copyLink}
            className="
              mt-3 flex items-center gap-2 rounded-xl
              bg-[#153029] px-3.5 py-2.5
              text-[12px] font-semibold text-[#E3B341]
              active:scale-95
            "
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ۳. کارت راهنمای iOS
// ============================================================
function IOSInstructionsCard() {
  return (
    <div className="mt-3 rounded-2xl border border-[#E3B341]/25 bg-[linear-gradient(155deg,#1B3A32_0%,#0F211E_75%)] p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[#E3B341]">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[#F2EFE9]">
            نصب خزانه روی iPhone / iPad
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8FA39D]">
            در iOS، نصب PWA دستی انجام می‌شود:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۱
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                دکمه‌ی{' '}
                <span className="inline-flex items-center gap-1 rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  <Share2 size={11} strokeWidth={2.2} />
                  Share
                </span>{' '}
                پایین Safari را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۲
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                <span className="rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  Add to Home Screen
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۳
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                اسم «خزانه» را تایید کن و{' '}
                <span className="rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  Add
                </span>{' '}
                بزن
              </p>
            </li>
          </ol>

          <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#0A1614]/60 p-2.5">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0 text-[#E3B341]"
              strokeWidth={2}
            />
            <p className="text-[10.5px] leading-relaxed text-[#8FA39D]">
              نکته: باید از مرورگر{' '}
              <span className="font-semibold text-[#F2EFE9]">Safari</span>{' '}
              استفاده کنی. Chrome iOS نصب PWA را پشتیبانی نمی‌کند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ۴. کارت راهنمای Android (وقتی beforeinstallprompt نیامد)
// ============================================================
function AndroidInstructionsCard({ isChromeGo }) {
  return (
    <div className="mt-3 rounded-2xl border border-[#E3B341]/25 bg-[linear-gradient(155deg,#1B3A32_0%,#0F211E_75%)] p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[#E3B341]">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[#F2EFE9]">
            نصب خزانه روی دستگاه
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#8FA39D]">
            برای نصب، این مراحل را دنبال کن:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۱
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                این صفحه را در{' '}
                <span className="font-semibold text-[#E3B341]">Chrome</span>{' '}
                باز کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۲
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                منوی{' '}
                <span className="inline-flex items-center gap-1 rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  <MoreVertical size={11} strokeWidth={2.2} />
                </span>{' '}
                بالا-راست را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E3B341]/[0.14] text-[11px] font-bold text-[#E3B341]">
                ۳
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F2EFE9]">
                <span className="rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  Add to Home screen
                </span>{' '}
                یا{' '}
                <span className="rounded-md bg-[#153029] px-1.5 py-0.5 text-[11px] font-semibold text-[#E3B341]">
                  Install app
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
          </ol>

          {isChromeGo && (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#E3B341]/20 bg-[#E3B341]/[0.06] p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-[#E3B341]"
                strokeWidth={2}
              />
              <p className="text-[10.5px] leading-relaxed text-[#8FA39D]">
                نکته: به‌نظر می‌رسد از{' '}
                <span className="font-semibold text-[#F2EFE9]">Chrome Go</span>{' '}
                استفاده می‌کنی که از نصب خودکار پشتیبانی نمی‌کند. با
                دستور بالا می‌توانی به‌صورت دستی نصب کنی.
              </p>
            </div>
          )}

          {!isChromeGo && (
            <div className="mt-3 flex items-start gap-2 rounded-xl bg-[#0A1614]/60 p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-[#E3B341]"
                strokeWidth={2}
              />
              <p className="text-[10.5px] leading-relaxed text-[#8FA39D]">
                اگر Chrome گزینه‌ای نشان نداد، از مرورگر پیش‌فرض دستگاه استفاده
                نکن. در Chrome به‌روز امتحان کن.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ۵. دکمه‌ی نصب (وقتی beforeinstallprompt آماده است)
// ============================================================
function InstallButton({ onInstall }) {
  return (
    <button
      type="button"
      onClick={onInstall}
      className="
        mt-3 flex w-full items-center gap-3 rounded-2xl
        border border-[#E3B341]/25 bg-[linear-gradient(155deg,#1B3A32_0%,#0F211E_75%)]
        p-4 text-right transition-all active:scale-[0.98]
        lg:mt-4 lg:p-5
      "
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#E3B341]/[0.14] text-[#E3B341] lg:h-12 lg:w-12">
        <Smartphone size={20} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-[#F2EFE9] lg:text-[14.5px]">
          نصب خزانه روی صفحه‌ی خانه
        </p>
        <p className="mt-1 text-[11px] text-[#8FA39D] lg:text-[12px]">
          دسترسی سریع، بدون مرورگر، کاملاً آفلاین
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E3B341]/[0.14] text-[#E3B341]">
        <Download size={17} strokeWidth={2} />
      </div>
    </button>
  );
}

// ============================================================
// کامپوننت اصلی
// ============================================================
export default function InstallCard() {
  const {
    canInstall,
    isInstalled,
    platform,
    isInApp,
    isChromeGo,
    dismissed,
    showManualGuide,
    promptInstall,
  } = useInstallPrompt();

  // ۱. نصب شده
  if (isInstalled) return <InstalledCard />;

  // ۲. In-App Browser
  if (isInApp) return <InAppBrowserCard />;

  // ۳. اگر کاربر dismiss کرده
  if (dismissed) return null;

  // ۴. iOS → راهنمای iOS
  if (platform === 'ios') return <IOSInstructionsCard />;

  // ۵. دکمه‌ی نصب آماده
  if (canInstall) return <InstallButton onInstall={promptInstall} />;

  // ۶. Android بدون beforeinstallprompt → راهنمای Android
  if (platform === 'android' && showManualGuide) {
    return <AndroidInstructionsCard isChromeGo={isChromeGo} />;
  }

  // ۷. دسکتاپ (Chrome/Edge) که پشتیبانی می‌کنه ولی prompt نیامده
  if (platform === 'desktop' && showManualGuide) {
    return <AndroidInstructionsCard isChromeGo={false} />;
  }

  return null;
}