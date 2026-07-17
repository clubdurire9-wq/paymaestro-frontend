'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import Image from 'next/image';
import {
  LayoutDashboard,
  Wallet,
  ArrowUpRight,
  Phone,
  Repeat2,
  History,
  CreditCard,
  Bitcoin,
  Building,
  Globe,
  Gift,
  UserCheck,
  User,
  Code,
  ChevronLeft,
  PanelLeftClose,
  PanelLeft,
  LifeBuoy,
  BookOpen,
  Landmark,
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface SidebarProps {
  isExpanded: boolean;
  onToggle: () => void;
  isMobileOpen: boolean;
  onMobileClose: () => void;
}

export default function Sidebar({ isExpanded, onToggle, isMobileOpen, onMobileClose }: SidebarProps) {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();

  const navItems = [
    { href: `/${locale}/dashboard`, label: 'Dashboard', icon: LayoutDashboard },
    { href: `/${locale}/wallet`, label: 'Wallet', icon: Wallet },
    { href: `/${locale}/convert`, label: 'Conversion', icon: Repeat2 },
    { href: `/${locale}/paypal`, label: 'PayPal', icon: ArrowUpRight },
    { href: `/${locale}/Mobile-Money`, label: 'Mobile Money', icon: Phone },
    { href: `/${locale}/iban`, label: 'IBAN', icon: Building },
    { href: `/${locale}/history`, label: 'History', icon: History },
    { href: `/${locale}/cards`, label: 'Cards', icon: CreditCard },
    { href: `/${locale}/crypto`, label: 'Crypto', icon: Bitcoin },
    { href: `/${locale}/payment-page`, label: 'Payment Page', icon: Globe },
    { href: `/${locale}/bank`, label: 'Bank', icon: Landmark },
    { href: `/${locale}/referral`, label: 'Referral', icon: Gift },
    { href: `/${locale}/kyc`, label: 'Verification', icon: UserCheck },
    { href: `/${locale}/profile`, label: 'Profile', icon: User },
    { href: `/${locale}/developer`, label: 'Developer', icon: Code },
    { href: `/${locale}/docs`, label: 'Documentation', icon: BookOpen },
    { href: `/${locale}/contact`, label: 'Contact Support', icon: LifeBuoy },
  ];

  const isActive = (href: string) => pathname === href || (href !== `/${locale}/dashboard` && pathname.startsWith(href));

  const sidebarContent = (
    <nav className="flex-1 overflow-y-auto scroll-smooth">
      <div className="flex flex-col gap-1 py-4 px-2">
      {navItems.map((item) => {
        const active = isActive(item.href);
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onMobileClose}
            className={`
              flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200
              ${active
                ? 'bg-violet-50 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800'
              }
              ${!isExpanded && 'justify-center px-0'}
            `}
            title={!isExpanded ? item.label : undefined}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {isExpanded && <span className="truncate">{item.label}</span>}
          </Link>
        );
      })}
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`
          hidden md:flex flex-col border-r border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900
          transition-all duration-300 ease-in-out shrink-0 h-screen
          ${isExpanded ? 'w-56' : 'w-16'}
        `}
      >
        {/* Logo + Branding */}
        <div className={`flex items-center h-14 border-b border-slate-200 dark:border-slate-700 ${isExpanded ? 'px-4 justify-between' : 'justify-center'}`}>
          {isExpanded ? (
            <div className="flex items-center gap-3">
              <Image src="/PayMaestro_officiel_logo.png" alt="PayMaestro" width={40} height={40} className="shrink-0" />
              <span className="text-lg font-bold text-slate-900 dark:text-white">PayMaestro</span>
            </div>
          ) : (
            <Image src="/PayMaestro_officiel_logo.png" alt="PayMaestro" width={32} height={32} className="shrink-0" />
          )}
          <button
            onClick={onToggle}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={isExpanded ? 'Collapse' : 'Expand'}
          >
            {isExpanded ? <PanelLeftClose className="w-5 h-5" /> : <PanelLeft className="w-5 h-5" />}
          </button>
        </div>

        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Sidebar Panel */}
      <aside
        className={`
          fixed top-0 left-0 bottom-0 w-72 max-w-[80vw] bg-white dark:bg-slate-900 z-50 shadow-2xl
          flex flex-col md:hidden transition-transform duration-300 ease-out
          ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <Image src="/PayMaestro_officiel_logo.png" alt="PayMaestro" width={36} height={36} className="shrink-0" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">PayMaestro</span>
          </div>
          <button
            onClick={onMobileClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
        </div>

        {sidebarContent}
      </aside>

    </>
  );
}
