import { useTranslation } from 'react-i18next';

import { useAppStore } from '../store/appStore';

export function useCurrencyLabel() {
  const { t } = useTranslation();
  const currencyCode = useAppStore((s) => s.currencyCode);
  return t(`currencies.${currencyCode}.label`);
}

export function useCurrencySymbol() {
  const { t } = useTranslation();
  const currencyCode = useAppStore((s) => s.currencyCode);
  return t(`currencies.${currencyCode}.symbol`);
}