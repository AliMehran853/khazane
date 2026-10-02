import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Search, X } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import TransactionList from '../transactions/TransactionList';

import { getTransactions } from '../services/transactionService';
import { getCategories } from '../services/categoryService';
import { useAppStore } from '../store/appStore';
import { toEnglishDigits, formatNumber } from '../utils/formatting';

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
  const { t } = useTranslation();
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

  const filters = [
    { id: 'all', label: t('search.filters.all') },
    { id: 'income', label: t('search.filters.income') },
    { id: 'expense', label: t('search.filters.expense') },
  ];

  const results = useMemo(() => {
    const q = normalizeText(toEnglishDigits(query));
    if (!q) return [];

    return transactions.filter((tx) => {
      if (filter !== 'all' && tx.type !== filter) return false;
      const cat = categoriesMap[tx.categoryId];
      const haystack = normalizeText(
        `${cat?.name || ''} ${tx.note || ''} ${tx.amount || ''}`,
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
      <div className="glass-strong sticky top-0 z-30 rounded-none border-x-0 border-t-0">
        <div className="px-4 pb-3 pt-4 lg:px-0 lg:pt-6">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => navigate(-1)}
              aria-label={t('common.back')}
              className="glass flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-fg-2 active:scale-95 lg:h-10 lg:w-10"
            >
              <ArrowRight size={18} strokeWidth={2} className="rtl:block ltr:rotate-180" />
            </button>

            <div className="relative flex-1">
              <Search
                size={17}
                strokeWidth={2}
                className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-fg-3 rtl:right-3.5 ltr:left-3.5"
              />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('search.placeholder')}
                autoFocus
                className="glass-inner w-full rounded-2xl py-3 pr-10 pl-10 text-base text-fg-1 outline-none placeholder:text-fg-3 focus:border-primary/50 lg:py-2.5"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  aria-label="clear"
                  className="absolute left-2.5 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-fg-3 transition-colors hover:bg-fill-3 hover:text-fg-1 rtl:left-2.5 ltr:right-2.5"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="mt-3 flex gap-1.5">
            {filters.map((f) => {
              const active = filter === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setFilter(f.id)}
                  className={[
                    'flex min-h-[34px] items-center rounded-xl px-3.5 text-xs font-semibold backdrop-blur-md transition-all active:scale-[0.97]',
                    active
                      ? 'border border-primary/30 bg-primary/[0.14] text-primary'
                      : 'border border-border-1 bg-fill-1 text-fg-2 hover:bg-fill-2',
                  ].join(' ')}
                >
                  {f.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="px-4 pt-4 lg:px-0 lg:pt-6">
        {loading && (
          <p className="py-10 text-center text-sm text-fg-3">
            {t('common.loading')}
          </p>
        )}

        {showHint && (
          <div className="glass rounded-3xl px-5 py-10 text-center">
            <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-primary/25 bg-primary/[0.14] text-primary">
              <Search size={24} strokeWidth={1.8} />
            </div>
            <p className="text-base font-semibold text-fg-1">
              {t('search.hintTitle')}
            </p>
            <p className="mt-1.5 text-xs leading-relaxed text-fg-2">
              {t('search.hintText')}
            </p>
          </div>
        )}

        {showEmpty && (
          <div className="glass rounded-3xl px-5 py-10 text-center">
            <p className="text-base font-semibold text-fg-2">
              {t('search.noResults')}
            </p>
            <p className="mt-1.5 text-xs text-fg-3">
              {t('search.noResultsHint')}
            </p>
          </div>
        )}

        {showResults && (
          <>
            <p className="mb-3 text-xs text-fg-3">
              {t('search.resultCount', {
                count: formatNumber(results.length),
              })}
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