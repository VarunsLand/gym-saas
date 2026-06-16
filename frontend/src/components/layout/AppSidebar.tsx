'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Users,
  Settings,
  Target,
  X,
  Hexagon,
  // BarChart3, // Future-proofing: Reports
  // Puzzle, // Future-proofing: Integrations
  // CreditCard, // Future-proofing: Billing
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const NAVIGATION_ITEMS = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Leads', href: '/leads', icon: Target },
  { name: 'Users', href: '/users', icon: Users },
  { name: 'Settings', href: '/settings', icon: Settings },
  // Placeholders for future routes
  // { name: 'Reports', href: '/reports', icon: BarChart3 },
  // { name: 'Integrations', href: '/integrations', icon: Puzzle },
  // { name: 'Billing', href: '/billing', icon: CreditCard },
];

export function AppSidebar({ isOpen, onClose }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 lg:hidden transition-opacity" 
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card text-card-foreground border-r flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:h-screen lg:shrink-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 shrink-0 items-center justify-between px-6 border-b">
          <Link href="/" className="flex items-center gap-3 font-bold text-xl tracking-tight transition-opacity hover:opacity-80" onClick={onClose}>
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
              <Hexagon className="text-white w-5 h-5" fill="currentColor" />
            </div>
            SaaS CRM
          </Link>
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {NAVIGATION_ITEMS.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-all relative",
                  isActive 
                    ? "bg-slate-100 dark:bg-slate-800/50 text-indigo-600 dark:text-indigo-400" 
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 hover:text-slate-900 dark:hover:bg-slate-800/30 dark:hover:text-slate-200"
                )}
              >
                {isActive && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-indigo-600 dark:bg-indigo-400 rounded-r-full" />
                )}
                <Icon className={cn("h-5 w-5", isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300")} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}
