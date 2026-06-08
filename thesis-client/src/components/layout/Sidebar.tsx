'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import {
  LayoutDashboard, BookOpen, ClipboardList, TrendingUp,
  Star, BarChart2, Users, UserCheck, Calendar,
  GraduationCap, ChevronLeft, ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/features/auth/store/authStore';
import type { Role } from '@/types/api.types';

interface NavItem {
  key: string;
  href: string;
  icon: React.ElementType;
  roles: Role[];
}

const NAV_ITEMS: NavItem[] = [
  { key: 'dashboard',      href: '/dashboard',                 icon: LayoutDashboard, roles: ['STUDENT','LECTURER','ADMIN'] },
  { key: 'topics',         href: '/topics',                    icon: BookOpen,        roles: ['STUDENT','LECTURER','ADMIN'] },
  { key: 'registrations',  href: '/registrations',             icon: ClipboardList,   roles: ['STUDENT','LECTURER'] },
  { key: 'progress',       href: '/progress',                  icon: TrendingUp,      roles: ['STUDENT','LECTURER'] },
  { key: 'grading',        href: '/grading',                   icon: Star,            roles: ['LECTURER'] },
  { key: 'results',        href: '/results',                   icon: BarChart2,       roles: ['STUDENT'] },
  { key: 'users',          href: '/admin/users',               icon: Users,           roles: ['ADMIN'] },
  { key: 'assignReviewer', href: '/admin/assign-reviewer',     icon: UserCheck,       roles: ['ADMIN'] },
  { key: 'adminGrading',   href: '/admin/grading',             icon: Star,            roles: ['ADMIN'] }, 
  { key: 'timeline',       href: '/admin/timeline',            icon: Calendar,        roles: ['ADMIN'] },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  const t = useTranslations('nav');
  const pathname = usePathname();
  const locale = useLocale();
  const user = useAuthStore((s) => s.user);

  const visibleItems = NAV_ITEMS.filter(
    (item) => user?.role && item.roles.includes(user.role)
  );

  const isActive = (href: string) =>
    pathname === `/${locale}${href}` ||
    pathname.startsWith(`/${locale}${href}/`);

  return (
    <aside
      className={cn(
        'relative flex h-full flex-col border-r border-gray-200 bg-white transition-all duration-300',
        collapsed ? 'w-16' : 'w-60'
      )}
    >
      {/* Logo */}
      <div className={cn(
        'flex h-16 items-center border-b border-gray-200 px-4',
        collapsed ? 'justify-center' : 'gap-3'
      )}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-blue-600">
          <GraduationCap className="h-4 w-4 text-white" />
        </div>
        {!collapsed && (
          <span className="text-sm font-bold text-gray-900 leading-tight">
            Thesis<br />
            <span className="text-blue-600">Management</span>
          </span>
        )}
      </div>

      {/* Nav */}
      <nav className="flex flex-1 flex-col gap-1 overflow-y-auto p-2">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          return (
            <Link
              key={item.key}
              href={`/${locale}${item.href}`}
              className={cn(
                'group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors',
                active
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
                collapsed && 'justify-center px-2'
              )}
              title={collapsed ? t(item.key) : undefined}
            >
              <Icon
                className={cn(
                  'h-4 w-4 shrink-0 transition-colors',
                  active ? 'text-blue-600' : 'text-gray-400 group-hover:text-gray-600'
                )}
              />
              {!collapsed && <span>{t(item.key)}</span>}
              {active && !collapsed && (
                <div className="ml-auto h-1.5 w-1.5 rounded-full bg-blue-600" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Toggle button */}
      <button
        onClick={onToggle}
        className={cn(
          'absolute -right-3 top-20 z-10 flex h-6 w-6 items-center justify-center',
          'rounded-full border border-gray-200 bg-white shadow-sm',
          'text-gray-400 transition-colors hover:text-gray-700'
        )}
      >
        {collapsed
          ? <ChevronRight className="h-3 w-3" />
          : <ChevronLeft className="h-3 w-3" />
        }
      </button>

      {/* User info */}
      {user && (
        <div className={cn(
          'flex items-center gap-3 border-t border-gray-200 p-3',
          collapsed && 'justify-center'
        )}>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-700">
            {user.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          {!collapsed && (
            <div className="min-w-0">
              <p className="truncate text-xs font-medium text-gray-900">{user.name ?? 'User'}</p>
              <p className="truncate text-xs text-gray-400">{user.role ?? 'Role'}</p>
            </div>
          )}
        </div>
      )}
    </aside>
  );
}