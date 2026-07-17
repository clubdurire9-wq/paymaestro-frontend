'use client';

import React, { useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Menu,
  Wallet,
  LogOut,
  LogIn,
  Loader2,
  ShieldCheck,
  User,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import ThemeSwitcher from '@/components/ui/ThemeSwitcher';
import { useAuth } from '@/hooks/useAuth';

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const t = useTranslations('nav');
  const locale = useLocale();
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, isAuthenticated, isLoading, login, logout } = useAuth();

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      await login();
    } catch {
    } finally {
      setIsLoggingIn(false);
    }
  };

  const userInitials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase()
    : '?';

  const kycBadgeColor =
    user?.kycStatus === 'APPROVED'
      ? 'text-emerald-500'
      : user?.kycStatus === 'PENDING_AI' || user?.kycStatus === 'PENDING_HUMAN'
      ? 'text-amber-500'
      : 'text-slate-400';

  const kycBadgeLabel =
    user?.kycStatus === 'APPROVED'
      ? 'Vérifié'
      : user?.kycStatus === 'PENDING_AI' || user?.kycStatus === 'PENDING_HUMAN'
      ? 'En attente'
      : 'Non vérifié';

  return (
    <header className="border-b border-slate-100 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md sticky top-0 z-30">
      <div className="flex items-center justify-between h-14 px-4 sm:px-6">
        {/* Left: Hamburger + Logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors md:hidden"
            aria-label="Ouvrir le menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors hidden md:flex"
            aria-label="Menu latéral"
          >
            <Menu className="w-5 h-5" />
          </button>
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-9 h-9 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200 dark:shadow-violet-900/30 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-700">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors hidden sm:block">
              PayMaestro
            </span>
          </Link>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          <LanguageSwitcher />

          {isLoading ? (
            <Loader2 className="w-5 h-5 text-slate-400 dark:text-slate-500 animate-spin" />
          ) : isAuthenticated && user ? (
            <div className="relative group">
              <Link
                href={`/${locale}/profile`}
                className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                <Avatar src={user.avatar} alt={user.name} fallback={userInitials} size="sm" />
                <div className="text-left hidden lg:block">
                  <p className="text-xs font-semibold text-slate-900 dark:text-white leading-none mb-0.5">
                    {user.name.split(' ')[0]}
                  </p>
                  <p className={`text-[10px] font-medium flex items-center gap-0.5 ${kycBadgeColor}`}>
                    {user.kycStatus === 'APPROVED' && <ShieldCheck className="w-2.5 h-2.5" />}
                    {kycBadgeLabel}
                  </p>
                </div>
              </Link>
              <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user.name}</p>
                  <p className="text-xs text-slate-400 dark:text-slate-500 truncate">{user.email}</p>

                </div>
                <div className="p-1.5">
                  <Link
                    href={`/${locale}/profile`}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mon profil
                  </Link>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    {t('logout')}
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <button
              onClick={handleLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-violet-600 text-white text-sm font-medium hover:bg-violet-700 active:scale-95 transition-all duration-200 disabled:opacity-70"
            >
              {isLoggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogIn className="w-4 h-4" />
              )}
              {t('login')}
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
