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

function InstalledCard() {
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.08] px-4 py-3.5 backdrop-blur-md lg:mt-4 lg:px-5 lg:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.16] text-primary">
        <CheckCircle2 size={19} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-primary lg:text-md">
          نصب شده روی دستگاه
        </p>
        <p className="mt-0.5 text-xs text-fg-3 lg:text-sm">
          خزانه به‌صورت اپ روی صفحه‌ی خانه‌ی شماست.
        </p>
      </div>
    </div>
  );
}

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
    <div className="glass mt-3 rounded-2xl border-primary/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.16] text-primary">
          <AlertCircle size={19} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-fg-1 lg:text-md">
            برای نصب، در مرورگر باز کن
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2 lg:text-sm">
            این صفحه داخل یک اپ (مثل اینستاگرام یا تلگرام) باز شده. برای نصب،
            لینک را کپی کن و در Chrome یا Safari باز کن.
          </p>

          <button
            type="button"
            onClick={copyLink}
            className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.12] px-3.5 py-2.5 text-sm font-semibold text-primary backdrop-blur-md active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? 'کپی شد!' : 'کپی لینک'}
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSInstructionsCard() {
  return (
    <div className="glass-strong mt-3 rounded-2xl border-primary/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-bold text-fg-1">
            نصب خزانه روی iPhone / iPad
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2">
            در iOS، نصب PWA دستی انجام می‌شود:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۱
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                دکمه‌ی{' '}
                <span className="inline-flex items-center gap-1 rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  <Share2 size={11} strokeWidth={2.2} />
                  Share
                </span>{' '}
                پایین Safari را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۲
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                <span className="rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  Add to Home Screen
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۳
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                اسم «خزانه» را تایید کن و{' '}
                <span className="rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  Add
                </span>{' '}
                بزن
              </p>
            </li>
          </ol>

          <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl p-2.5">
            <AlertCircle
              size={13}
              className="mt-0.5 shrink-0 text-primary"
              strokeWidth={2}
            />
            <p className="text-2xs leading-relaxed text-fg-2">
              نکته: باید از مرورگر{' '}
              <span className="font-semibold text-fg-1">Safari</span> استفاده
              کنی. Chrome iOS نصب PWA را پشتیبانی نمی‌کند.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AndroidInstructionsCard({ isChromeGo }) {
  return (
    <div className="glass-strong mt-3 rounded-2xl border-primary/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-bold text-fg-1">نصب خزانه روی دستگاه</p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2">
            برای نصب، این مراحل را دنبال کن:
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۱
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                این صفحه را در{' '}
                <span className="font-semibold text-primary">Chrome</span> باز
                کن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۲
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                منوی{' '}
                <span className="inline-flex items-center gap-1 rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  <MoreVertical size={11} strokeWidth={2.2} />
                </span>{' '}
                بالا-راست را بزن
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۳
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                <span className="rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  Add to Home screen
                </span>{' '}
                یا{' '}
                <span className="rounded-md border border-border-1 bg-fill-2 px-1.5 py-0.5 text-xs font-semibold text-primary">
                  Install app
                </span>{' '}
                را انتخاب کن
              </p>
            </li>
          </ol>

          {isChromeGo ? (
            <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl border-primary/25 p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-primary"
                strokeWidth={2}
              />
              <p className="text-2xs leading-relaxed text-fg-2">
                نکته: به‌نظر می‌رسد از{' '}
                <span className="font-semibold text-fg-1">Chrome Go</span>{' '}
                استفاده می‌کنی که از نصب خودکار پشتیبانی نمی‌کند. با دستور بالا
                می‌توانی به‌صورت دستی نصب کنی.
              </p>
            </div>
          ) : (
            <div className="glass-inner mt-3 flex items-start gap-2 rounded-xl p-2.5">
              <AlertCircle
                size={13}
                className="mt-0.5 shrink-0 text-primary"
                strokeWidth={2}
              />
              <p className="text-2xs leading-relaxed text-fg-2">
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

function InstallButton({ onInstall }) {
  return (
    <button
      type="button"
      onClick={onInstall}
      className="glass-strong mt-3 flex w-full items-center gap-3 rounded-2xl border-primary/25 p-4 text-right transition-all hover:border-primary/40 active:scale-[0.98] lg:mt-4 lg:p-5"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary lg:h-12 lg:w-12">
        <Smartphone size={20} strokeWidth={1.9} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="text-md font-bold text-fg-1 lg:text-base">
          نصب خزانه روی صفحه‌ی خانه
        </p>
        <p className="mt-1 text-xs text-fg-2 lg:text-sm">
          دسترسی سریع، بدون مرورگر، کاملاً آفلاین
        </p>
      </div>

      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.16] text-primary">
        <Download size={17} strokeWidth={2} />
      </div>
    </button>
  );
}

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