import { z } from 'zod';

export const transactionSchema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'مبلغ را وارد کنید.' })
    .positive('مبلغ باید بیشتر از صفر باشد.'),
  note: z.string().optional(),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید.'),
});

export const categorySchema = z.object({
  name: z.string().trim().min(1, 'نام دسته الزامی است.'),
});

export const pinSchema = z
  .string()
  .min(4, 'رمز باید حداقل ۴ رقم باشد.')
  .max(6, 'رمز حداکثر ۶ رقم است.')
  .regex(/^\d+$/, 'رمز فقط شامل اعداد باشد.');