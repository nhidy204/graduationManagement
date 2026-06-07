'use client';

import { useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const toggle = (nextLocale: string) => {
    // Remove locale prefix if it exists
    let pathWithoutLocale = pathname;
    
    // Remove /en or /vi prefix from the start of path
    if (pathname.startsWith('/en/') || pathname === '/en') {
      pathWithoutLocale = pathname.replace(/^\/en/, '') || '/';
    } else if (pathname.startsWith('/vi/') || pathname === '/vi') {
      pathWithoutLocale = pathname.replace(/^\/vi/, '') || '/';
    }
    
    // Build new path with new locale
    const newPath = `/` + nextLocale + pathWithoutLocale;
    
    router.push(newPath);
  };

  return (
    <div className="flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50 p-0.5">
      {(['vi', 'en'] as const).map((lang) => (
        <button
          key={lang}
          onClick={() => toggle(lang)}
          className={cn(
            'rounded-md px-2.5 py-1 text-xs font-medium transition-colors',
            locale === lang
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          {lang.toUpperCase()}
        </button>
      ))}
    </div>
  );
}