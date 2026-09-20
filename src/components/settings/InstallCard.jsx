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
} from 'lucide-react';
import { useInstallPrompt } from '../hooks/useInstallPrompt';

// ============================================================
// ۱. کارت نصب‌شده
// ============================================================
function InstalledCard() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.08] px-4 py-3.5 backdrop-blur-md lg:mt-4 lg:px-5 lg:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
        <CheckCircle2 size={19} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[13px] font-semibold text-[#00D1A7] lg:text-[14px]">
          نصب شده روی دستگاه
        </p>
        <p className="mt-0.5 text-[11px] text-[#64748B] lg:text-[12px]">
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
    <div className="glass mt-3 rounded-2xl border-[#00D1A7]/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
          <AlertCircle size={19} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-bold text-[#F8FAFC] lg:text-[14px]">
            برای نصب، در مرورگر باز کن
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8] lg:text-[12px]">
            این صفحه داخل یک اپ (مثل اینستاگرام یا تلگرام) باز شده. برای نصب،
            لینک را کپی کن و در Chrome یا Safari باز کن.
          </p>

          <button
            type="button"
            onClick={copyLink}
            className="
              mt-3 flex items-center gap-2 rounded-xl
              border border-[#00D1A7]/30 bg-[#00D1A7]/[0.12]
              px-3.5 py-2.5
              text-[12px] font-semibold text-[#00D1A7]
              backdrop-blur-md active:scale-95
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
    <div className="glass-strong mt-3 rounded-2xl border-[#00D1A7]/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[#F8FAFC]">
            نصب خزانه روی iPhone / iPad
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">
            در iOS، نصب PWA دستی انجام می‌شود:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۱
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                دکمه‌ی{' '}
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  <Share2 size={11} strokeWidth={2.2} />
                  Share
                </span>{' '}
                پایین Safari را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۲
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                <span className="rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  Add to Home Screen
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۳
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                اسم «خزانه» را تایید کن و{' '}
                <span className="rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  Add
                </span>{' '}
                بزن
              </p>
            </li>
          </ol>

          <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl p-2.5">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0 text-[#00D1A7]"
              strokeWidth={2}
            />
            <p className="text-[10.5px] leading-relaxed text-[#94A3B8]">
              نکته: باید از مرورگر{' '}
              <span className="font-semibold text-[#F8FAFC]">Safari</span>{' '}
              استفاده کنی. Chrome iOS نصب PWA را پشتیبانی نمی‌کند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ============================================================
// ۴. کارت راهنمای Android
// ============================================================
function AndroidInstructionsCard({ isChromeGo }) {
  return (
    <div className="glass-strong mt-3 rounded-2xl border-[#00D1A7]/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold text-[#F8FAFC]">
            نصب خزانه روی دستگاه
          </p>
          <p className="mt-1 text-[11px] leading-relaxed text-[#94A3B8]">
            برای نصب، این مراحل را دنبال کن:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۱
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                این صفحه را در{' '}
                <span className="font-semibold text-[#00D1A7]">Chrome</span>{' '}
                باز کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۲
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                منوی{' '}
                <span className="inline-flex items-center gap-1 rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  <MoreVertical size={11} strokeWidth={2.2} />
                </span>{' '}
                بالا-راست را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[11px] font-bold text-[#00D1A7]">
                ۳
              </span>
              <p className="text-[11.5px] leading-relaxed text-[#F8FAFC]">
                <span className="rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  Add to Home screen
                </span>{' '}
                یا{' '}
                <span className="rounded-md border border-white/[0.08] bg-white/[0.06] px-1.5 py-0.5 text-[11px] font-semibold text-[#00D1A7]">
                  Install app
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
          </ol>

          {isChromeGo && (
            <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl border-[#00D1A7]/25 p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-[#00D1A7]"
                strokeWidth={2}
              />
              <p className="text-[10.5px] leading-relaxed text-[#94A3B8]">
                نکته: به‌نظر می‌رسد از{' '}
                <span className="font-semibold text-[#F8FAFC]">Chrome Go</span>{' '}
                استفاده می‌کنی که از نصب خودکار پشتیبانی نمی‌کند. با
                دستور بالا می‌توانی به‌صورت دستی نصب کنی.
              </p>
            </div>
          )}

          {!isChromeGo && (
            <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-[#00D1A7]"
                strokeWidth={2}
              />
              <p className="text-[10.5px] leading-relaxed text-[#94A3B8]">
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
// ۵. دکمه‌ی نصب
// ============================================================
function InstallButton({ onInstall }) {
  return (
    <button
      type="button"
      onClick={onInstall}
      className="
        glass-strong mt-3 flex w-full items-center gap-3 rounded-2xl
        border-[#00D1A7]/25 p-4 text-right transition-all
        hover:border-[#00D1A7]/40 active:scale-[0.98]
        lg:mt-4 lg:p-5
      "
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7] lg:h-12 lg:w-12">
        <Smartphone size={20} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-[13.5px] font-bold text-[#F8FAFC] lg:text-[14.5px]">
          نصب خزانه روی صفحه‌ی خانه
        </p>
        <p className="mt-1 text-[11px] text-[#94A3B8] lg:text-[12px]">
          دسترسی سریع، بدون مرورگر، کاملاً آفلاین
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.16] text-[#00D1A7]">
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

  if (isInstalled) return <InstalledCard />;
  if (isInApp) return <InAppBrowserCard />;
  if (dismissed) return null;
  if (platform === 'ios') return <IOSInstructionsCard />;
  if (canInstall) return <InstallButton onInstall={promptInstall} />;
  if (platform === 'android' && showManualGuide) {
    return <AndroidInstructionsCard isChromeGo={isChromeGo} />;
  }
  if (platform === 'desktop' && showManualGuide) {
    return <AndroidInstructionsCard isChromeGo={false} />;
  }

  return null;
}