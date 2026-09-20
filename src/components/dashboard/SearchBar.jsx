import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';

export default function SearchBar({
  placeholder = 'جستجو در تراکنش‌ها...',
}) {
  const navigate = useNavigate();

  return (
    <button
      type="button"
      onClick={() => navigate('/search')}
      className="
        glass flex h-11 w-full items-center gap-2.5 rounded-2xl
        px-3.5 text-right
        transition-all hover:border-[#00D1A7]/30
        active:scale-[0.99]
        lg:h-10
      "
    >
      <Search size={17} strokeWidth={2} className="shrink-0 text-[#64748B]" />
      <span className="flex-1 truncate text-[12.5px] text-[#64748B]">
        {placeholder}
      </span>
    </button>
  );
}