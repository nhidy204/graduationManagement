'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { useAuthStore } from '@/features/auth/store/authStore';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const prevPathnameRef = useRef<string | undefined>(undefined);

  const router = useRouter();
  const locale = useLocale();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();

  // Đợi zustand hydrate từ localStorage
  useEffect(() => {
    setHydrated(true);
  }, []);

  // Guard: chưa login → redirect về login
  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      router.replace(`/${locale}/login`);
    }
  }, [isAuthenticated, hydrated, locale, router]);

  // Đóng mobile menu khi đổi route
  useEffect(() => {
    if (prevPathnameRef.current !== pathname) {
      setMobileOpen(false);
      prevPathnameRef.current = pathname;
    }
  }, [pathname]);

  // Chưa hydrate hoặc chưa auth → không render
  if (!hydrated || !isAuthenticated) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex">
        <Sidebar collapsed={collapsed} onToggle={() => setCollapsed((v) => !v)} />
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-30 lg:hidden">
            <Sidebar collapsed={false} onToggle={() => setMobileOpen(false)} />
          </div>
        </>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onMobileMenuOpen={() => setMobileOpen(true)} />
        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}