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
        flex h-11 w-full items-center gap-2.5 rounded-2xl
        border border-white/[0.06] bg-[#0F211E] px-3.5 text-right
        transition-all hover:border-[#E3B341]/25
        active:scale-[0.99]
        lg:h-10
      "
    >
      <Search size={17} strokeWidth={2} className="shrink-0 text-[#5C736C]" />
      <span className="flex-1 truncate text-[12.5px] text-[#5C736C]">
        {placeholder}
      </span>
    </button>
  );
}