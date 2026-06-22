'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Menu,
  X,
  LayoutDashboard,
  ArrowUpRight,
  History,
  UserCheck,
  User,
  Wallet,
  LogOut,
  LogIn,
  Loader2,
  ShieldCheck,
  Settings,
} from 'lucide-react';
import { Avatar } from '@/components/ui/avatar';
import LanguageSwitcher from '@/components/ui/LanguageSwitcher';
import { useAuth } from '@/hooks/useAuth';

export default function Header() {
  const t = useTranslations('nav');
  const locale = useLocale();
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const { user, isAuthenticated, isLoading, login, loginMock, logout } = useAuth();

  const navItems = [
    { href: `/${locale}/dashboard`, label: t('dashboard'), icon: LayoutDashboard },
    { href: `/${locale}/withdraw`, label: t('withdraw'), icon: ArrowUpRight },
    { href: `/${locale}/history`, label: t('history'), icon: History },
    { href: `/${locale}/kyc`, label: t('kyc'), icon: UserCheck },
    { href: `/${locale}/profile`, label: t('profile'), icon: User },
  ];

  const isActive = (href: string) => pathname === href;

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      // Déclenche la vraie popup Google OAuth
      await login();
    } catch {
      // Si Google OAuth échoue, on ne fait rien (pas de mock auto)
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
  };

  // --- User Badge ---
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
    <header className="border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center shadow-md shadow-violet-200 transition-all duration-300 group-hover:scale-105 group-hover:bg-violet-700">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-violet-600 transition-colors">
              PayMaestro
            </span>
          </Link>

          {/* Desktop Navigation — only when authenticated */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                const active = isActive(item.href);
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`
                      flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200
                      ${active
                        ? 'bg-violet-50 text-violet-700'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                      }
                    `}
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}

          {/* Right Actions */}
          <div className="hidden md:flex items-center gap-4">
            <LanguageSwitcher />
            <div className="h-6 w-px bg-slate-200" />

            {isLoading ? (
              <Loader2 className="w-5 h-5 text-slate-400 animate-spin" />
            ) : isAuthenticated && user ? (
              /* Authenticated user chip */
              <div className="relative group">
                <Link
                  href={`/${locale}/profile`}
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  <Avatar src={user.avatar} alt={user.name} fallback={userInitials} size="sm" />
                  <div className="text-left hidden lg:block">
                    <p className="text-xs font-semibold text-slate-900 leading-none mb-0.5">
                      {user.name.split(' ')[0]}
                    </p>
                    <p className={`text-[10px] font-medium flex items-center gap-0.5 ${kycBadgeColor}`}>
                      {user.kycStatus === 'APPROVED' && <ShieldCheck className="w-2.5 h-2.5" />}
                      {kycBadgeLabel}
                    </p>
                  </div>
                </Link>
                {/* Dropdown */}
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 translate-y-1 group-hover:translate-y-0">
                  <div className="px-4 py-3 border-b border-slate-100">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-400 truncate">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <Link
                      href={`/${locale}/profile`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Mon profil
                    </Link>
                    <Link
                      href={`/${locale}/admin`}
                      className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
                    >
                      <Settings className="w-4 h-4" />
                      Administration
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-red-500 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      {t('logout')}
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              /* Login button */
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

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-3 md:hidden">
            <LanguageSwitcher />
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 focus:outline-none transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Overlay */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/25 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Mobile Drawer Panel */}
      <div
        className={`
          fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] bg-white z-50 shadow-2xl p-6 flex flex-col md:hidden transition-transform duration-300 ease-out
          ${isMenuOpen ? 'translate-x-0' : 'translate-x-full'}
        `}
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center">
              <Wallet className="w-4 h-4 text-white" />
            </div>
            <span className="text-lg font-bold text-slate-900">PayMaestro</span>
          </div>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card inside Drawer */}
        {isAuthenticated && user ? (
          <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-2xl mb-6">
            <Avatar src={user.avatar} alt={user.name} fallback={userInitials} size="md" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
              <p className={`text-xs font-medium flex items-center gap-1 ${kycBadgeColor}`}>
                {user.kycStatus === 'APPROVED' && <ShieldCheck className="w-3 h-3" />}
                {kycBadgeLabel}
              </p>
            </div>
          </div>
        ) : (
          <button
            onClick={() => { handleLogin(); setIsMenuOpen(false); }}
            className="flex items-center justify-center gap-2 w-full p-3 bg-violet-600 text-white rounded-2xl text-sm font-medium hover:bg-violet-700 transition-colors mb-6"
          >
            <LogIn className="w-4 h-4" />
            {t('login')}
          </button>
        )}

        {/* Mobile Navigation Links */}
        {isAuthenticated && (
          <nav className="flex flex-col gap-1.5 flex-1">
            {navItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200
                    ${active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                    }
                  `}
                >
                  <Icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        )}

        {/* Footer Actions inside Drawer */}
        {isAuthenticated && (
          <div className="border-t border-slate-100 pt-6 mt-auto">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              {t('logout')}
            </button>
          </div>
        )}
      </div>
    </header>
  );
}