import { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import { createCategory, getCategories } from '../services/categoryService';
import { createTransaction } from '../services/transactionService';
import { useAppStore } from '../store/appStore';

const schema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'مبلغ را وارد کنید.' })
    .positive('مبلغ باید بیشتر از صفر باشد.'),
  note: z.string().optional(),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید.'),
});

function TransactionForm({ type = 'expense', onSuccess }) {
  const refreshData = useAppStore((state) => state.refreshData);

  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { amount: '', note: '', categoryId: '' },
  });

  const selectedCategory = watch('categoryId');
  const isIncome = type === 'income';

  useEffect(() => {
    let cancelled = false;
    async function loadCategories() {
      try {
        setCategoryError('');
        const data = await getCategories(type);
        if (cancelled) return;
        setCategories(data);
      } catch (error) {
        console.error(error);
        setCategoryError('دریافت دسته‌بندی‌ها ناموفق بود.');
      }
    }
    loadCategories();
    return () => {
      cancelled = true;
    };
  }, [type]);

  async function addNewCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError('نام دسته را وارد کنید.');
      return;
    }
    try {
      setCategoryError('');
      const category = await createCategory({ name, type });
      const updated = await getCategories(type);
      setCategories(updated);
      setValue('categoryId', category.id, { shouldValidate: true });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      setCategoryError(error?.message || 'افزودن دسته‌بندی ناموفق بود.');
    }
  }

  async function onSubmit(data) {
    try {
      setSubmitError('');
      setSaving(true);

      await createTransaction({
        amount: data.amount,
        note: data.note || '',
        categoryId: data.categoryId,
        type,
        memberId: 'self',
        date: new Date(),
      });

      refreshData();
      reset({ amount: '', note: '', categoryId: '' });
      onSuccess?.();
    } catch (error) {
      console.error('Transaction save failed:', error);
      setSubmitError(error?.message || 'ذخیره تراکنش انجام نشد.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pb-2">
      {/* مبلغ */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-[#8FA39D]">
          مبلغ ({isIncome ? 'درآمد' : 'مصرف'})
        </label>
        <input
          {...register('amount')}
          inputMode="decimal"
          placeholder="0"
          autoFocus
          className="
            w-full rounded-2xl border border-white/[0.07] bg-[#153029]
            px-4 py-4 text-center text-[32px] font-extrabold tracking-tight
            text-[#F2EFE9] outline-none placeholder:text-[#5C736C]
            focus:border-[#E3B341]/40
          "
        />
        {errors.amount && (
          <p className="mt-1 text-[11px] text-[#E2574C]">
            {errors.amount.message}
          </p>
        )}
      </div>

      {/* دسته‌بندی */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="text-[11px] font-medium text-[#8FA39D]">
            دسته‌بندی
          </label>
          <button
            type="button"
            onClick={() => setShowNewCategory((v) => !v)}
            className="flex min-h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-semibold text-[#E3B341]"
          >
            {showNewCategory ? <X size={14} /> : <Plus size={14} />}
            {showNewCategory ? 'انصراف' : 'دسته جدید'}
          </button>
        </div>

        {/* گرید ۲ ستونه - دکمه‌ها دیگر بریده نمی‌شوند */}
        <div className="grid grid-cols-2 gap-2">
          {categories.map((category) => {
            const active = selectedCategory === category.id;
            return (
              <button
                key={category.id}
                type="button"
                onClick={() =>
                  setValue('categoryId', category.id, { shouldValidate: true })
                }
                className={[
                  'flex min-h-[48px] items-center justify-center rounded-2xl border px-3 py-2 transition-all active:scale-95',
                  active
                    ? isIncome
                      ? 'border-[#4FD1BE]/40 bg-[#4FD1BE]/10 text-[#4FD1BE]'
                      : 'border-[#E2574C]/40 bg-[#E2574C]/10 text-[#E2574C]'
                    : 'border-white/[0.06] bg-[#0F211E] text-[#8FA39D]',
                ].join(' ')}
              >
                <span className="text-center text-[12px] font-semibold leading-tight">
                  {category.name}
                </span>
              </button>
            );
          })}
        </div>

        {errors.categoryId && (
          <p className="mt-1 text-[11px] text-[#E2574C]">
            {errors.categoryId.message}
          </p>
        )}

        {showNewCategory && (
          <div className="mt-3 rounded-2xl border border-white/[0.06] bg-[#0F211E] p-3">
            <input
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              placeholder="مثلاً اینترنت"
              className="
                w-full rounded-xl border border-white/[0.07] bg-[#153029]
                px-3 py-3 text-[12px] text-[#F2EFE9] outline-none
                placeholder:text-[#5C736C]
              "
            />
            {categoryError && (
              <p className="mt-2 text-[11px] text-[#E2574C]">{categoryError}</p>
            )}
            <button
              type="button"
              onClick={addNewCategory}
              className="mt-2 w-full rounded-xl bg-[#1B3A32] py-3 text-[12px] font-semibold text-[#E3B341] active:scale-[0.98]"
            >
              ذخیره دسته
            </button>
          </div>
        )}
      </div>

      {/* توضیحات */}
      <div>
        <label className="mb-2 block text-[11px] font-medium text-[#8FA39D]">
          توضیحات (اختیاری)
        </label>
        <input
          {...register('note')}
          placeholder={isIncome ? 'مثلاً معاش این ماه' : 'مثلاً نهار برنج'}
          className="
            w-full rounded-2xl border border-white/[0.07] bg-[#153029]
            px-4 py-3 text-[13px] text-[#F2EFE9] outline-none
            placeholder:text-[#5C736C] focus:border-[#E3B341]/40
          "
        />
      </div>

      {submitError && (
        <div className="rounded-xl border border-[#E2574C]/20 bg-[#E2574C]/[0.08] px-3 py-2 text-[11px] text-[#E2574C]">
          {submitError}
        </div>
      )}

      <button
        type="submit"
        disabled={saving}
        className={[
          'w-full rounded-2xl py-4 text-[13px] font-bold transition-all active:scale-[0.98]',
          isIncome
            ? 'bg-[linear-gradient(155deg,#4FD1BE,#2FAF9D)] text-[#0A1614]'
            : 'bg-[linear-gradient(155deg,#E2574C,#B8392F)] text-white',
          saving ? 'cursor-not-allowed opacity-60' : '',
        ].join(' ')}
      >
        {saving ? 'در حال ذخیره...' : isIncome ? 'ثبت درآمد' : 'ثبت مصرف'}
      </button>
    </form>
  );
}

export default TransactionForm;