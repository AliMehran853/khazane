import { useEffect, useRef, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  createCategory,
  getCategories,
  deleteCategory,
} from '../services/categoryService';
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
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const newCategoryInputRef = useRef(null);

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

  useEffect(() => {
    if (showNewCategory) {
      setTimeout(() => {
        newCategoryInputRef.current?.focus();
      }, 100);
    }
  }, [showNewCategory]);

  async function reloadCategories() {
    const updated = await getCategories(type);
    setCategories(updated);
    return updated;
  }

  async function addNewCategory() {
    const name = newCategoryName.trim();
    if (!name) {
      setCategoryError('نام دسته را وارد کنید.');
      return;
    }
    try {
      setCategoryError('');
      setSaving(true);
      const category = await createCategory({ name, type });
      await reloadCategories();
      setValue('categoryId', category.id, { shouldValidate: true });
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      setCategoryError(error?.message || 'افزودن دسته‌بندی ناموفق بود.');
    } finally {
      setSaving(false);
    }
  }

  function handleNewCategoryKeyDown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      addNewCategory();
    }
  }

  async function handleDeleteCategory(category) {
    setConfirmDelete(null);
    setDeletingId(category.id);
    try {
      await deleteCategory(category.id);
      await reloadCategories();
      if (selectedCategory === category.id) {
        setValue('categoryId', '', { shouldValidate: false });
      }
    } catch (error) {
      setCategoryError(error?.message || 'حذف دسته ناموفق بود.');
      setTimeout(() => setCategoryError(''), 3500);
    } finally {
      setDeletingId(null);
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
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        {/* ==================== ناحیه اسکرول‌شدنی ==================== */}
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {/* مبلغ */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[#8FA39D]">
              مبلغ ({isIncome ? 'درآمد' : 'مصرف'})
            </label>
            <input
              {...register('amount')}
              inputMode="decimal"
              placeholder="0"
              autoFocus
              className="
                w-full rounded-2xl border border-white/[0.07] bg-[#153029]
                px-4 py-3 text-center text-[28px] font-extrabold tracking-tight
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
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#8FA39D]">
                دسته‌بندی
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory((v) => !v);
                  setCategoryError('');
                }}
                className="
                  flex min-h-[28px] items-center gap-1 rounded-lg
                  bg-[#E3B341]/[0.10] px-2.5 text-[10.5px] font-semibold text-[#E3B341]
                  active:scale-95
                "
              >
                {showNewCategory ? <X size={12} /> : <Plus size={12} />}
                {showNewCategory ? 'انصراف' : 'دسته جدید'}
              </button>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {categories.map((category) => {
                const active = selectedCategory === category.id;
                const canDelete = !category.isDefault;
                const isDeleting = deletingId === category.id;

                return (
                  <div key={category.id} className="relative">
                    <button
                      type="button"
                      onClick={() =>
                        setValue('categoryId', category.id, { shouldValidate: true })
                      }
                      disabled={isDeleting}
                      className={[
                        'flex min-h-[48px] w-full items-center justify-center rounded-xl border px-2 py-2 transition-all active:scale-95',
                        canDelete ? 'pr-7' : '',
                        active
                          ? isIncome
                            ? 'border-[#4FD1BE]/40 bg-[#4FD1BE]/10 text-[#4FD1BE]'
                            : 'border-[#E2574C]/40 bg-[#E2574C]/10 text-[#E2574C]'
                          : 'border-white/[0.06] bg-[#0F211E] text-[#8FA39D]',
                        isDeleting ? 'opacity-40' : '',
                      ].join(' ')}
                    >
                      <span className="text-center text-[11.5px] font-semibold leading-tight">
                        {category.name}
                      </span>
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setConfirmDelete(category);
                        }}
                        disabled={isDeleting}
                        aria-label="حذف دسته"
                        className="
                          absolute left-1 top-1 z-10 flex items-center justify-center
                          rounded-full bg-[#0A1614]/80
                          text-[#E2574C]/70
                          transition-all hover:bg-[#E2574C]/20 hover:text-[#E2574C]
                          active:scale-90
                        "
                        style={{ width: '22px', height: '22px' }}
                      >
                        <Trash2 size={11} strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.categoryId && (
              <p className="mt-1 text-[11px] text-[#E2574C]">
                {errors.categoryId.message}
              </p>
            )}

            {categoryError && (
              <p className="mt-1.5 text-[11px] text-[#E2574C]">{categoryError}</p>
            )}

            {showNewCategory && (
              <div className="mt-2.5 rounded-xl border border-[#E3B341]/20 bg-[#E3B341]/[0.04] p-2.5">
                <p className="mb-1.5 text-[10.5px] font-semibold text-[#E3B341]">
                  نام دسته جدید
                </p>

                <input
                  ref={newCategoryInputRef}
                  value={newCategoryName}
                  onChange={(e) => {
                    setNewCategoryName(e.target.value);
                    setCategoryError('');
                  }}
                  onKeyDown={handleNewCategoryKeyDown}
                  placeholder="مثلاً اینترنت"
                  enterKeyHint="done"
                  className="
                    w-full rounded-lg border border-white/[0.07] bg-[#153029]
                    px-3 py-2.5 text-[12.5px] text-[#F2EFE9] outline-none
                    placeholder:text-[#5C736C] focus:border-[#E3B341]/40
                  "
                />

                <button
                  type="button"
                  onClick={addNewCategory}
                  disabled={saving || !newCategoryName.trim()}
                  className="
                    mt-2 w-full rounded-lg
                    bg-[linear-gradient(155deg,#E3B341,#B9862A)]
                    py-2.5 text-[12px] font-bold text-[#0A1614]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره دسته'}
                </button>
              </div>
            )}
          </div>

          {/* توضیحات */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[#8FA39D]">
              توضیحات (اختیاری)
            </label>
            <input
              {...register('note')}
              placeholder={isIncome ? 'مثلاً معاش این ماه' : 'مثلاً نهار برنج'}
              className="
                w-full rounded-xl border border-white/[0.07] bg-[#153029]
                px-3.5 py-2.5 text-[12.5px] text-[#F2EFE9] outline-none
                placeholder:text-[#5C736C] focus:border-[#E3B341]/40
              "
            />
          </div>
        </div>

        {/* ==================== ناحیه دکمه (چسبیده به Sheet) ==================== */}
        <div className="shrink-0 px-4 pb-5 pt-4">
          {submitError && (
            <div className="mb-2 rounded-xl border border-[#E2574C]/20 bg-[#E2574C]/[0.08] px-3 py-2 text-[11px] text-[#E2574C]">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={[
              'w-full rounded-xl py-3.5 text-[13px] font-bold transition-all active:scale-[0.98]',
              isIncome
                ? 'bg-[linear-gradient(155deg,#4FD1BE,#2FAF9D)] text-[#0A1614]'
                : 'bg-[linear-gradient(155deg,#E2574C,#B8392F)] text-white',
              saving ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            {saving ? 'در حال ذخیره...' : isIncome ? 'ثبت درآمد' : 'ثبت مصرف'}
          </button>
        </div>
      </form>

      {/* ==================== مودال حذف دسته ==================== */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-[3px]"
            onClick={() => setConfirmDelete(null)}
          />
          <div
            className="relative z-10 w-full max-w-[300px] rounded-[22px] border border-white/[0.08] bg-[#0F211E] p-5"
            dir="rtl"
          >
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#E2574C]/[0.14] text-[#E2574C]">
                <Trash2 size={22} strokeWidth={1.9} />
              </div>
            </div>

            <h3 className="mt-3 text-center text-[14px] font-extrabold text-[#F2EFE9]">
              حذف دسته‌بندی
            </h3>

            <p className="mt-2 text-center text-[11.5px] leading-relaxed text-[#8FA39D]">
              آیا مطمئنی می‌خواهی دسته‌ی
              <span className="mx-1 font-bold text-[#E3B341]">
                «{confirmDelete.name}»
              </span>
              را حذف کنی؟
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-white/[0.08] bg-[#153029] py-2.5 text-[12px] font-semibold text-[#8FA39D]"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(confirmDelete)}
                className="rounded-xl bg-[linear-gradient(155deg,#E2574C,#B8392F)] py-2.5 text-[12px] font-bold text-white"
              >
                حذف کن
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default TransactionForm;