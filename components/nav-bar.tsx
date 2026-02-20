'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { LayoutDashboard, List, GraduationCap, Settings, LogOut, Monitor } from 'lucide-react';

export function NavBar() {
  const pathname = usePathname();
  const { data: session } = useSession() || {};

  const navItems = [
    { href: '/dashboard', label: 'DASHBOARD', icon: LayoutDashboard },
    { href: '/bots', label: 'BOT LIST', icon: List },
    { href: '/educational', label: 'TIPS', icon: GraduationCap },
    { href: '/settings', label: 'SETTINGS', icon: Settings },
  ];

  if (!session) return null;

  return (
    <nav className="terminal-nav">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        <Link href="/dashboard" className="flex items-center gap-2 text-terminal-green hover:text-terminal-bright">
          <Monitor className="w-5 h-5" />
          <span className="font-bold tracking-wider">TREWMONITOR</span>
        </Link>
        
        <div className="flex items-center gap-1">
          {(navItems ?? [])?.map?.((item) => {
            const Icon = item?.icon;
            const isActive = pathname === item?.href || pathname?.startsWith?.(`${item?.href}/`);
            return (
              <Link
                key={item?.href}
                href={item?.href ?? '/'}
                className={`nav-item ${isActive ? 'active' : ''}`}
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span className="hidden sm:inline">{item?.label ?? ''}</span>
              </Link>
            );
          })}
          <button
            onClick={() => signOut?.({ callbackUrl: '/login' })}
            className="nav-item text-red-500 hover:bg-red-500 hover:text-black"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">LOGOUT</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
