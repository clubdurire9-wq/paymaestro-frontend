// src/components/ui/LanguageSwitcher.tsx
'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from '@/i18n/routing';
import { useState, useRef, useEffect } from 'react';

const locales = ['fr', 'en'];
const localeNames: Record<string, string> = { fr: 'Français', en: 'English' };
const localeFlagUrls: Record<string, string> = { fr: 'https://flagcdn.com/24x18/fr.png', en: 'https://flagcdn.com/24x18/gb.png' };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchLanguage = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50"
      >
        <img crossOrigin="anonymous" src={localeFlagUrls[locale]} alt={localeNames[locale]} className="w-6 h-4 object-cover rounded" />
        <span>{localeNames[locale] || locale.toUpperCase()}</span>
        <span>{isOpen ? '▲' : '▼'}</span>
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-40 bg-white border border-gray-200 rounded-lg shadow-lg z-50">
          {locales.map((loc) => (
            <button
              key={loc}
              onClick={() => switchLanguage(loc)}
              className={`w-full flex items-center gap-2 px-4 py-2 text-sm hover:bg-gray-50 ${
                locale === loc ? 'text-violet-600 font-medium bg-violet-50' : 'text-gray-700'
              }`}
            >
              <img crossOrigin="anonymous" src={localeFlagUrls[loc]} alt={localeNames[loc]} className="w-6 h-4 object-cover rounded" />
              <span>{localeNames[loc]}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}