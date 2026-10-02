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
import { useTranslation } from 'react-i18next';

import { useInstallPrompt } from '../hooks/useInstallPrompt';

function InstalledCard() {
  const { t } = useTranslation();
  return (
    <div className="mt-3 flex items-center gap-3 rounded-2xl border border-primary/25 bg-primary/[0.08] px-4 py-3.5 backdrop-blur-md lg:mt-4 lg:px-5 lg:py-4">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-primary/25 bg-primary/[0.16] text-primary">
        <CheckCircle2 size={19} strokeWidth={1.9} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-semibold text-primary lg:text-md">
          {t('install.installed')}
        </p>
        <p className="mt-0.5 text-xs text-fg-3 lg:text-sm">
          {t('install.installedHint')}
        </p>
      </div>
    </div>
  );
}

function InAppBrowserCard() {
  const { t } = useTranslation();
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
            {t('install.inAppTitle')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2 lg:text-sm">
            {t('install.inAppText')}
          </p>

          <button
            type="button"
            onClick={copyLink}
            className="mt-3 flex items-center gap-2 rounded-xl border border-primary/30 bg-primary/[0.12] px-3.5 py-2.5 text-sm font-semibold text-primary backdrop-blur-md active:scale-95"
          >
            {copied ? <Check size={14} /> : <Copy size={14} />}
            {copied ? t('install.copied') : t('install.copyLink')}
          </button>
        </div>
      </div>
    </div>
  );
}

function IOSInstructionsCard() {
  const { t } = useTranslation();

  return (
    <div className="glass-strong mt-3 rounded-2xl border-primary/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-bold text-fg-1">
            {t('install.iosTitle')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2">
            {t('install.iosText')}
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۱
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.iosStep1')}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۲
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.iosStep2')}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۳
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.iosStep3')}
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
              {t('install.iosNote')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function AndroidInstructionsCard({ isChromeGo }) {
  const { t } = useTranslation();

  return (
    <div className="glass-strong mt-3 rounded-2xl border-primary/25 p-4 lg:mt-4 lg:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.16] text-primary">
          <Smartphone size={20} strokeWidth={1.9} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-md font-bold text-fg-1">
            {t('install.androidTitle')}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-fg-2">
            {t('install.androidText')}
          </p>

          <ol className="mt-3 space-y-2.5">
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۱
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.androidStep1')}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۲
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.androidStep2')}
              </p>
            </li>
            <li className="flex items-start gap-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-primary/25 bg-primary/[0.16] text-xs font-bold text-primary">
                ۳
              </span>
              <p className="text-xs leading-relaxed text-fg-1">
                {t('install.androidStep3')}
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
              {isChromeGo
                ? t('install.androidChromeGo')
                : t('install.androidChromeHint')}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function InstallButton({ onInstall }) {
  const { t } = useTranslation();

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
          {t('install.installButton')}
        </p>
        <p className="mt-1 text-xs text-fg-2 lg:text-sm">
          {t('install.installButtonHint')}
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