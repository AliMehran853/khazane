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
import {
  createTransaction,
  updateTransaction,
} from '../services/transactionService';
import { useAppStore } from '../store/appStore';

const NOTE_MAX_LENGTH = 200;
const NOTE_WARN_THRESHOLD = 140;
const NOTE_DANGER_THRESHOLD = 180;

const schema = z.object({
  amount: z.coerce
    .number({ invalid_type_error: 'مبلغ را وارد کنید.' })
    .positive('مبلغ باید بیشتر از صفر باشد.'),
  note: z.string().max(NOTE_MAX_LENGTH).optional(),
  categoryId: z.string().min(1, 'دسته‌بندی را انتخاب کنید.'),
});

function TransactionForm({
  type: typeProp = 'expense',
  editingTransaction = null,
  prefilledDate = null,
  onSuccess,
}) {
  const refreshData = useAppStore((state) => state.refreshData);

  const isEditing = Boolean(editingTransaction);
  const type = isEditing ? editingTransaction.type : typeProp;
  const isIncome = type === 'income';

  const [categories, setCategories] = useState([]);
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState('');
  const [submitError, setSubmitError] = useState('');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const newCategoryInputRef = useRef(null);

  const getDefaultValues = () => {
    if (isEditing && editingTransaction) {
      return {
        amount: String(editingTransaction.amount ?? ''),
        note: editingTransaction.note || '',
        categoryId: editingTransaction.categoryId || '',
      };
    }
    return { amount: '', note: '', categoryId: '' };
  };

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(),
  });

  const selectedCategory = watch('categoryId');
  const noteValue = watch('note') || '';

  const selectedCategoryData = categories.find(
    (c) => c.id === selectedCategory,
  );

  const notePlaceholder =
    selectedCategoryData?.placeholder ||
    (isIncome ? 'توضیح این درآمد...' : 'توضیح این مصرف...');

  const noteLength = noteValue.length;
  const counterColor =
    noteLength >= NOTE_DANGER_THRESHOLD
      ? 'text-[#F43F5E]'
      : noteLength >= NOTE_WARN_THRESHOLD
        ? 'text-[#00D1A7]'
        : 'text-[#64748B]';

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
        setValue('note', '', { shouldValidate: false });
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

      const payload = {
        amount: data.amount,
        note: (data.note || '').trim(),
        categoryId: data.categoryId,
        type,
        memberId: 'self',
      };

      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          ...payload,
          date: editingTransaction.date,
        });
      } else {
        const dateToUse = prefilledDate
          ? new Date(prefilledDate)
          : new Date();

        await createTransaction({
          ...payload,
          date: dateToUse,
        });
      }

      refreshData();

      if (!isEditing) {
        reset({ amount: '', note: '', categoryId: '' });
      }

      onSuccess?.();
    } catch (error) {
      console.error('Transaction save failed:', error);
      setSubmitError(error?.message || 'ذخیره تراکنش انجام نشد.');
    } finally {
      setSaving(false);
    }
  }

  const submitLabel = isEditing
    ? 'ذخیره تغییرات'
    : isIncome
      ? 'ثبت درآمد'
      : 'ثبت مصرف';

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          {/* مبلغ */}
          <div>
            <label className="mb-1.5 block text-[11px] font-medium text-[#94A3B8]">
              مبلغ ({isIncome ? 'درآمد' : 'مصرف'})
            </label>
            <input
              {...register('amount')}
              inputMode="decimal"
              placeholder="0"
              autoFocus
              className="
                glass-inner w-full rounded-2xl
                px-4 py-3 text-center text-[28px] font-extrabold tracking-tight
                text-[#F8FAFC] outline-none placeholder:text-[#64748B]
                focus:border-[#00D1A7]/50
              "
            />
            {errors.amount && (
              <p className="mt-1 text-[11px] text-[#F43F5E]">
                {errors.amount.message}
              </p>
            )}
          </div>

          {/* دسته‌بندی */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-[11px] font-medium text-[#94A3B8]">
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
                  border border-[#00D1A7]/30 bg-[#00D1A7]/[0.12]
                  px-2.5 text-[10.5px] font-semibold text-[#00D1A7]
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
                        setValue('categoryId', category.id, {
                          shouldValidate: true,
                        })
                      }
                      disabled={isDeleting}
                      className={[
                        'flex min-h-[48px] w-full items-center justify-center rounded-xl border px-2 py-2 backdrop-blur-md transition-all active:scale-95',
                        canDelete ? 'pr-7' : '',
                        active
                          ? isIncome
                            ? 'border-[#00D1A7]/50 bg-[#00D1A7]/[0.14] text-[#00D1A7]'
                            : 'border-[#F43F5E]/50 bg-[#F43F5E]/[0.14] text-[#F43F5E]'
                          : 'border-white/[0.08] bg-white/[0.04] text-[#94A3B8]',
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
                          rounded-full bg-black/40 backdrop-blur-md
                          text-[#F43F5E]/70
                          transition-all hover:bg-[#F43F5E]/25 hover:text-[#F43F5E]
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
              <p className="mt-1 text-[11px] text-[#F43F5E]">
                {errors.categoryId.message}
              </p>
            )}

            {categoryError && (
              <p className="mt-1.5 text-[11px] text-[#F43F5E]">
                {categoryError}
              </p>
            )}

            {showNewCategory && (
              <div className="mt-2.5 rounded-xl border border-[#00D1A7]/25 bg-[#00D1A7]/[0.06] p-2.5 backdrop-blur-md">
                <p className="mb-1.5 text-[10.5px] font-semibold text-[#00D1A7]">
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
                    glass-inner w-full rounded-lg
                    px-3 py-2.5 text-[12.5px] text-[#F8FAFC] outline-none
                    placeholder:text-[#64748B] focus:border-[#00D1A7]/50
                  "
                />

                <button
                  type="button"
                  onClick={addNewCategory}
                  disabled={saving || !newCategoryName.trim()}
                  className="
                    mt-2 w-full rounded-lg
                    bg-[linear-gradient(155deg,#00D1A7,#00A88A)]
                    py-2.5 text-[12px] font-bold text-[#0F172A]
                    shadow-[0_4px_16px_rgba(0,209,167,0.28)]
                    active:scale-[0.98]
                    disabled:cursor-not-allowed disabled:opacity-40
                  "
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره دسته'}
                </button>
              </div>
            )}
          </div>

          {selectedCategory && (
            <div className="animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-[11px] font-medium text-[#94A3B8]">
                  توضیحات (اختیاری)
                </label>
                <span
                  className={[
                    'text-[10px] font-medium tabular-nums transition-colors',
                    counterColor,
                  ].join(' ')}
                >
                  {noteLength}/{NOTE_MAX_LENGTH}
                </span>
              </div>
              <input
                {...register('note')}
                maxLength={NOTE_MAX_LENGTH}
                placeholder={notePlaceholder}
                className="
                  glass-inner w-full rounded-xl
                  px-3.5 py-2.5 text-[12.5px] text-[#F8FAFC] outline-none
                  placeholder:text-[#64748B] focus:border-[#00D1A7]/50
                "
              />
              {errors.note && (
                <p className="mt-1 text-[11px] text-[#F43F5E]">
                  {errors.note.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-5 pt-4">
          {submitError && (
            <div className="mb-2 rounded-xl border border-[#F43F5E]/25 bg-[#F43F5E]/[0.10] px-3 py-2 text-[11px] text-[#F43F5E] backdrop-blur-md">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={[
              'w-full rounded-xl py-3.5 text-[13px] font-bold transition-all active:scale-[0.98]',
              isIncome
                ? 'bg-[linear-gradient(155deg,#00D1A7,#00A88A)] text-[#0F172A] shadow-[0_6px_24px_rgba(0,209,167,0.30)]'
                : 'bg-[linear-gradient(155deg,#F43F5E,#BE123C)] text-white shadow-[0_6px_24px_rgba(244,63,94,0.30)]',
              saving ? 'cursor-not-allowed opacity-60' : '',
            ].join(' ')}
          >
            {saving ? 'در حال ذخیره...' : submitLabel}
          </button>
        </div>
      </form>

      {confirmDelete && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-5">
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={() => setConfirmDelete(null)}
          />
          <div
            className="glass-strong relative z-10 w-full max-w-[300px] rounded-[22px] p-5"
            dir="rtl"
          >
            <div className="flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-[#F43F5E]/25 bg-[#F43F5E]/[0.14] text-[#F43F5E]">
                <Trash2 size={22} strokeWidth={1.9} />
              </div>
            </div>

            <h3 className="mt-3 text-center text-[14px] font-extrabold text-[#F8FAFC]">
              حذف دسته‌بندی
            </h3>

            <p className="mt-2 text-center text-[11.5px] leading-relaxed text-[#94A3B8]">
              آیا مطمئنی می‌خواهی دسته‌ی
              <span className="mx-1 font-bold text-[#00D1A7]">
                «{confirmDelete.name}»
              </span>
              را حذف کنی؟
            </p>

            <div className="mt-4 grid grid-cols-2 gap-2.5">
              <button
                type="button"
                onClick={() => setConfirmDelete(null)}
                className="rounded-xl border border-white/[0.10] bg-white/[0.06] py-2.5 text-[12px] font-semibold text-[#94A3B8]"
              >
                انصراف
              </button>
              <button
                type="button"
                onClick={() => handleDeleteCategory(confirmDelete)}
                className="rounded-xl bg-[linear-gradient(155deg,#F43F5E,#BE123C)] py-2.5 text-[12px] font-bold text-white"
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