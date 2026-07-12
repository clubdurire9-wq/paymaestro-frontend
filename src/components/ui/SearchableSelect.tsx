'use client';

import { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown } from 'lucide-react';

export interface SearchableOption {
  value: string;
  label: string;
  flag?: string;
}

interface SearchableSelectProps {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  options: SearchableOption[];
  placeholder?: string;
  required?: boolean;
  error?: string;
}

export default function SearchableSelect({
  label,
  value,
  onChange,
  options,
  placeholder = 'Rechercher...',
  required = false,
  error,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const selected = options.find((o) => o.value === value);

  const filtered = search
    ? options.filter((o) =>
        o.label.toLowerCase().includes(search.toLowerCase())
      )
    : options;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleSelect(option: SearchableOption) {
    onChange(option.value);
    setSearch('');
    setIsOpen(false);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Escape') setIsOpen(false);
    if (e.key === 'Enter' && filtered.length === 1) {
      handleSelect(filtered[0]);
    }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-1.5">
          {label}
          {required && <span className="text-red-500 ml-0.5">*</span>}
        </label>
      )}
      <div
        className={`
          w-full px-3.5 py-2 text-xs font-semibold border rounded-xl cursor-pointer flex items-center gap-2
          transition-all duration-200
          bg-white dark:bg-slate-800
          ${error ? 'border-red-300 dark:border-red-500' : 'border-slate-200 dark:border-slate-600'}
          ${isOpen ? 'ring-2 ring-violet-500/20 border-violet-500' : 'hover:border-slate-300 dark:hover:border-slate-500'}
        `}
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
      >
        {selected ? (
          <>
            <img crossOrigin="anonymous"
              src={`https://flagcdn.com/16x12/${selected.value.toLowerCase()}.png`}
              alt={selected.label}
              className="w-5 h-4 object-cover rounded-[2px] shrink-0"
              loading="lazy"
            />
            <span className="flex-1 text-slate-800 dark:text-slate-100">{selected.label}</span>
          </>
        ) : (
          <span className="flex-1 text-slate-400 dark:text-slate-500">{placeholder}</span>
        )}
        <ChevronDown className={`w-4 h-4 text-slate-400 dark:text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-lg max-h-64 flex flex-col">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-100 dark:border-slate-700">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tapez le nom du pays..."
              className="flex-1 text-xs text-slate-800 dark:text-slate-100 bg-transparent outline-none placeholder:text-slate-400 dark:placeholder:text-slate-500"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.length === 0 ? (
              <div className="px-3 py-4 text-xs text-slate-400 dark:text-slate-500 text-center">Aucun pays trouvé</div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.value}
                  type="button"
                  className={`
                    w-full flex items-center gap-2 px-3 py-2 text-xs text-left transition-colors
                    ${option.value === value ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 font-semibold' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'}
                  `}
                  onClick={() => handleSelect(option)}
                >
                  <img crossOrigin="anonymous"
                    src={`https://flagcdn.com/16x12/${option.value.toLowerCase()}.png`}
                    alt={option.label}
                    className="w-5 h-4 object-cover rounded-[2px] shrink-0"
                    loading="lazy"
                  />
                  <span>{option.label}</span>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {error && <p className="text-[10px] text-red-500 dark:text-red-400 mt-1 font-semibold">{error}</p>}
    </div>
  );
}
