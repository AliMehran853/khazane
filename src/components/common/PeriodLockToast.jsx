import { Info } from 'lucide-react';

import Toast from './Toast';
import { useAppStore } from '../store/appStore';
import { PERIOD_LOCK_TOAST_DURATION } from '../utils/constants';

export default function PeriodLockToast() {
  const open = useAppStore((s) => s.periodLockToastOpen);
  const hideToast = useAppStore((s) => s.hidePeriodLockToast);

  return (
    <Toast
      open={open}
      onClose={hideToast}
      icon={<Info size={22} strokeWidth={2} />}
      title="امکان ثبت در این دوره نیست"
      duration={PERIOD_LOCK_TOAST_DURATION}
      zIndex={200}
    >
      برای ثبت تراکنش، از حالت{' '}
      <span className="font-bold text-primary">روزانه</span> یا{' '}
      <span className="font-bold text-primary">هفتگی</span> استفاده کن.
    </Toast>
  );
}