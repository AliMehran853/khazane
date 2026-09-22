import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

import { ROUTES } from '../utils/constants';

export default function SearchBar({
  placeholder = 'جستجو در تراکنش‌ها...',
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate(ROUTES.search)}
      className="glass flex h-11 w-full items-center gap-2.5 rounded-2xl px-3.5 text-right transition-all hover:border-primary/30 active:scale-[0.99] lg:h-10"
    >
      <Search size={17} strokeWidth={2} className="shrink-0 text-fg-3" />
      <span className="flex-1 truncate text-sm text-fg-3">{placeholder}</span>
    </button>
  );
}