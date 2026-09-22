import { useLocation } from 'react-router-dom';

import { useAppStore } from '../store/appStore';
import { useHaptic } from './useHaptic';
import { getPeriodBaseDate } from '../utils/dates';
import { ROUTES } from '../utils/constants';

/**
 * منطق مشترک ثبت تراکنش — بین FAB و Sidebar
 * - daily:    مستقیم sheet را باز می‌کند با تاریخ روز
 * - weekly:   اول DateChoiceModal را باز می‌کند
 * - monthly:  قفل است و toast نشان می‌دهد
 * - yearly:   قفل است و toast نشان می‌دهد
 */
export function useRecordTransaction() {
  const location = useLocation();
  const haptic = useHaptic();

  const openTransactionSheet = useAppStore((s) => s.openTransactionSheet);
  const openDateChoice = useAppStore((s) => s.openDateChoice);
  const showPeriodLockToast = useAppStore((s) => s.showPeriodLockToast);
  const period = useAppStore((s) => s.period);
  const periodOffset = useAppStore((s) => s.periodOffset);

  const type = location.pathname === ROUTES.income ? 'income' : 'expense';
  const buttonLabel = type === 'income' ? 'ثبت درآمد' : 'ثبت مصرف';
  const isDisabled = period === 'monthly' || period === 'yearly';

  function trigger() {
    if (isDisabled) {
      haptic.warning();
      showPeriodLockToast();
      return;
    }

    haptic.medium();

    if (period === 'daily') {
      const date = getPeriodBaseDate('daily', periodOffset);
      openTransactionSheet(type, null, date);
      return;
    }

    if (period === 'weekly') {
      openDateChoice(type);
      return;
    }

    openTransactionSheet(type);
  }

  return { type, buttonLabel, isDisabled, trigger };
}