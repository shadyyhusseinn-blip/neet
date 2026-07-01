import { Search } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SearchInputProps {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'بحث...',
  className,
}: SearchInputProps) {
  return (
    <div className={cn('relative', className)}>
      <Search
        size={17}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none"
      />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="field-input h-11 pr-10"
      />
    </div>
  );
}
