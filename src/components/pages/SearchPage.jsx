import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';

import TransactionList from '../transactions/TransactionList';

import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { useAppStore } from '../store/appStore';
import { toEnglishDigits } from '../utils/formatting';

const FILTERS = [
  { id: 'all', label: 'همه' },
  { id: 'income', label: 'درآمد' },
  { id: 'expense', label: 'مصارف' },
];

// نرمال‌سازی برای جستجو: پایین‌سازی، یکسان‌سازی «ی/ک»، حذف کاراکترهای کنترلی
function normalizeText(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[\u200B-\u200D\uFEFF\u200E\u200F\u202A-\u202E]/g, '')
    .replace(/ي/g, 'ی')
    .replace(/ك/g, 'ک')
    .replace(/\s+/g, ' ')
    .trim();
}

function SearchPage() {
  const navigate = useNavigate();
  const dataVersion = useAppStore((s) => s.dataVersion);

  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [transactions, setTransactions] = useState([]);
  const [categoriesMap, setCategoriesMap] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const [txs, cats] = await Promise.all([
          getTransactions(),
          getCategories(),
        ]);
        if (cancelled) return;

        setTransactions(txs);
        const map = {};
        cats.forEach((c) => {
          map[c.id] = c;
        });
        setCategoriesMap(map);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [dataVersion]);

  const results = useMemo(() => {
    const q = normalizeText(toEnglishDigits(query));
    if (!q) return [];

    return transactions.filter((t) => {
      if (filter !== 'all' && t.type !== filter) return false;
      const cat = categoriesMap[t.categoryId];
      const haystack = normalizeText(
        `${cat?.name || ''} ${t.note || ''} ${t.amount || ''}`,
      );
      return haystack.includes(q);
    });
  }, [query, transactions, categoriesMap, filter]);

  const hasQuery = query.trim().length > 0;
  const showHint = !loading && !hasQuery;
  const showEmpty = !loading && hasQuery && results.length === 0;
  const showResults = !loading && hasQuery && results.length > 0;

  return (
    <div className="min-h-dvh pb-24 lg:pb-12">
      {/* هدر چسبان */}
      <div className="sticky top-0 z-30 border-b border-white/[0.06] bg-[#0A1614]/95 backdrop-blur-xl">
        <div className="px-4 pb-3 pt-4 lg:px-0 lg:pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label="بازگشت"
              className="
                flex h-11 w-11 shrink-0 items-center justify-center
                rounded-2xl border border-white/[0.06] bg-[#0F211E]
                text-[#8FA39D] active:scale-95
                lg:h-10 lg:w-10
              "
            >
              <ArrowRight size={18} strokeWidth={2} />
            </button>

            <div className="relative flex-1">
              <Search
                size={17}
                strokeWidth={2}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5C736C]"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="جستجو در دسته، توضیحات یا مبلغ..."
                autoFocus
                className="
                  w-full rounded-2xl border border-white/[0.06] bg-[#0F211E]
                  py-3 pr-10 pl-10 text-[13px] text-[#F2EFE9]
                  outline-none placeholder:text-[#5C736C]
                  focus:border-[#E3B341]/40
                  lg:py-2.5
                "
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="پاک کردن"
                  className="
                    absolute left-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2
                    items-center justify-center rounded-full text-[#5C736C]
                    transition-colors hover:bg-white/[0.05] hover:text-[#F2EFE9]
                  "
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          {/* فیلترها */}
          <div className="mt-3 flex gap-1.5">
            {FILTERS.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={[
                    'flex min-h-[34px] items-center rounded-xl px-3.5',
                    'text-[11.5px] font-semibold',
                    'transition-all active:scale-[0.97]',
                    active
                      ? 'bg-[#E3B341]/[0.14] text-[#E3B341]'
                      : 'bg-[#0F211E] text-[#8FA39D] hover:bg-[#153029]',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* نتایج */}
      <div className="px-4 pt-4 lg:px-0 lg:pt-6">
        {loading && (
          <p className="py-10 text-center text-[12px] text-[#5C736C]">
            در حال بارگذاری...
          </p>
        )}

        {showHint && (
          <div className="rounded-3xl border border-white/[0.06] bg-[#0F211E] px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#153029] text-[#E3B341]">
              <Search size={24} strokeWidth={1.8} />
            </div>
            <p className="text-[13.5px] font-semibold text-[#F2EFE9]">
              جستجو در تراکنش‌ها
            </p>
            <p className="mt-1.5 text-[11.5px] leading-relaxed text-[#8FA39D]">
              با تایپ نام دسته، توضیحات یا مبلغ، تراکنش مورد نظرت رو پیدا کن.
            </p>
          </div>
        )}

        {showEmpty && (
          <div className="rounded-3xl border border-white/[0.06] bg-[#0F211E] px-5 py-10 text-center">
            <p className="text-[13.5px] font-semibold text-[#8FA39D]">
              نتیجه‌ای پیدا نشد
            </p>
            <p className="mt-1.5 text-[11.5px] text-[#5C736C]">
              عبارت دیگری را امتحان کن یا فیلتر را تغییر بده.
            </p>
          </div>
        )}

        {showResults && (
          <>
            <p className="mb-3 text-[11px] text-[#5C736C]">
              {new Intl.NumberFormat('fa-AF').format(results.length)} نتیجه
            </p>
            <TransactionList
              transactions={results}
              categoriesMap={categoriesMap}
            />
          </>
        )}
      </div>
    </div>
  );
}

export default SearchPage;