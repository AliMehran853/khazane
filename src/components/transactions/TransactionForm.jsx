import { useEffect, useRef, useState } from 'react';
import { Plus, X, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import ConfirmDialog from '../common/ConfirmDialog';
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
import {
  NOTE_MAX_LENGTH,
  NOTE_WARN_THRESHOLD,
  NOTE_DANGER_THRESHOLD,
  MEMBER_ID,
} from '../utils/constants';
import { toEnglishDigits } from '../utils/formatting';

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
      ? 'text-expense'
      : noteLength >= NOTE_WARN_THRESHOLD
        ? 'text-orange'
        : 'text-fg-3';

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
      setTimeout(() => newCategoryInputRef.current?.focus(), 100);
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
        amount: toEnglishDigits(data.amount),
        note: (data.note || '').trim(),
        categoryId: data.categoryId,
        type,
        memberId: MEMBER_ID,
      };

      if (isEditing && editingTransaction) {
        await updateTransaction(editingTransaction.id, {
          ...payload,
          date: editingTransaction.date,
        });
      } else {
        const dateToUse = prefilledDate ? new Date(prefilledDate) : new Date();
        await createTransaction({ ...payload, date: dateToUse });
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

  const submitTone = isIncome ? 'kh-btn-primary' : 'kh-btn-danger';

  return (
    <>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex min-h-0 flex-1 flex-col"
      >
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 pb-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-fg-2">
              مبلغ ({isIncome ? 'درآمد' : 'مصرف'})
            </label>
            <input
              {...register('amount')}
              inputMode="decimal"
              placeholder="0"
              autoFocus
              className="glass-inner w-full rounded-2xl px-4 py-3 text-center text-4xl font-extrabold tracking-tight text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
            />
            {errors.amount && (
              <p className="mt-1 text-xs text-expense">
                {errors.amount.message}
              </p>
            )}
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="text-xs font-medium text-fg-2">
                دسته‌بندی
              </label>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory((v) => !v);
                  setCategoryError('');
                }}
                className="flex min-h-[28px] items-center gap-1 rounded-lg border border-primary/30 bg-primary/15 px-2.5 text-2xs font-semibold text-primary active:scale-95"
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
                            ? 'border-primary/50 bg-primary/15 text-primary'
                            : 'border-expense/50 bg-expense/15 text-expense'
                          : 'border-border-1 bg-fill-1 text-fg-2',
                        isDeleting ? 'opacity-40' : '',
                      ].join(' ')}
                    >
                      <span className="text-center text-xs font-semibold leading-tight">
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
                        className="absolute left-1 top-1 z-10 flex h-[22px] w-[22px] items-center justify-center rounded-full bg-black/40 text-expense/70 backdrop-blur-md transition-all hover:bg-expense/25 hover:text-expense active:scale-90"
                      >
                        <Trash2 size={11} strokeWidth={2.2} />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>

            {errors.categoryId && (
              <p className="mt-1 text-xs text-expense">
                {errors.categoryId.message}
              </p>
            )}

            {categoryError && (
              <p className="mt-1.5 text-xs text-expense">{categoryError}</p>
            )}

            {showNewCategory && (
              <div className="mt-2.5 rounded-xl border border-primary/25 bg-primary/[0.08] p-2.5 backdrop-blur-md">
                <p className="mb-1.5 text-2xs font-semibold text-primary">
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
                  className="glass-inner w-full rounded-lg px-3 py-2.5 text-sm text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
                />

                <button
                  type="button"
                  onClick={addNewCategory}
                  disabled={saving || !newCategoryName.trim()}
                  className="kh-btn kh-btn-primary mt-2 w-full py-2.5 text-sm"
                >
                  {saving ? 'در حال ذخیره...' : 'ذخیره دسته'}
                </button>
              </div>
            )}
          </div>

          {selectedCategory && (
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <label className="text-xs font-medium text-fg-2">
                  توضیحات (اختیاری)
                </label>
                <span
                  className={[
                    'text-2xs font-medium tabular-nums transition-colors',
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
                className="glass-inner w-full rounded-xl px-3.5 py-2.5 text-sm text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50"
              />
              {errors.note && (
                <p className="mt-1 text-xs text-expense">
                  {errors.note.message}
                </p>
              )}
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 pb-5 pt-4">
          {submitError && (
            <div className="mb-2 rounded-xl border border-expense/25 bg-expense/10 px-3 py-2 text-xs text-expense backdrop-blur-md">
              {submitError}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className={['kh-btn w-full py-3.5 text-base', submitTone].join(' ')}
          >
            {saving ? 'در حال ذخیره...' : submitLabel}
          </button>
        </div>
      </form>

      <ConfirmDialog
        open={Boolean(confirmDelete)}
        onClose={() => setConfirmDelete(null)}
        icon={Trash2}
        iconTone="danger"
        title="حذف دسته‌بندی"
        description={
          confirmDelete ? (
            <>
              آیا مطمئنی می‌خواهی دسته‌ی
              <span className="mx-1 font-bold text-primary">
                «{confirmDelete.name}»
              </span>
              را حذف کنی؟
            </>
          ) : null
        }
        confirmLabel="حذف کن"
        onConfirm={() => handleDeleteCategory(confirmDelete)}
      />
    </>
  );
}

export default TransactionForm;