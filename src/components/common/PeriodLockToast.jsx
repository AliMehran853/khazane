import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import Toast from './Toast';
import { useAppStore } from '../store/appStore';
import { PERIOD_LOCK_TOAST_DURATION } from '../utils/constants';

export default function PeriodLockToast() {
  const { t } = useTranslation();
  const open = useAppStore((s) => s.periodLockToastOpen);
  const hideToast = useAppStore((s) => s.hidePeriodLockToast);

  return (
    <Toast
      open={open}
      onClose={hideToast}
      icon={<Info size={22} strokeWidth={2} />}
      title={t('errors.periodLocked')}
      duration={PERIOD_LOCK_TOAST_DURATION}
      zIndex={200}
    >
      {t('errors.periodLockedHint')}
    </Toast>
  );
}