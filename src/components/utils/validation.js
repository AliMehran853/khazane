// ============================================================
// Validation utilities — i18n-aware
// ============================================================

import { z } from 'zod';
import i18n from '../../i18n';

const t = (key, opts = {}) => i18n.t(key, opts);

export function getTransactionSchema() {
  return z.object({
    amount: z.coerce
      .number({ invalid_type_error: t('errors.amountRequired') })
      .positive(t('errors.amountPositive')),
    note: z.string().optional(),
    categoryId: z.string().min(1, t('errors.categoryRequired')),
  });
}

export function getCategorySchema() {
  return z.object({
    name: z.string().trim().min(1, t('errors.categoryNameRequired')),
  });
}

export function getPinSchema() {
  return z
    .string()
    .min(4, t('errors.pinLength'))
    .max(6, t('errors.pinLength'))
    .regex(/^\d+$/, t('errors.pinLength'));
}