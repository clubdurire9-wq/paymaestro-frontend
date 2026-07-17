'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Header from './Header';
import Sidebar from './Sidebar';
import Footer from './Footer';
import KYCWarningBanner from '@/components/kyc/KYCWarningBanner';
import PageTransition from '@/components/ui/PageTransition';
import { AdminAuthProvider } from '@/hooks/AdminAuthContext';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('paymaestro_sidebar_expanded');
    if (saved !== null) {
      setIsExpanded(saved === 'true');
    }
  }, []);

  const toggleSidebar = () => {
    setIsExpanded((prev) => {
      const next = !prev;
      localStorage.setItem('paymaestro_sidebar_expanded', String(next));
      return next;
    });
  };

  const openMobile = () => setIsMobileOpen(true);
  const closeMobile = () => setIsMobileOpen(false);

  return (
    <AdminAuthProvider>
      <div className="flex flex-col min-h-screen bg-slate-50/50 dark:bg-[#0b1120]">
        <Header onMenuToggle={openMobile} />
        <KYCWarningBanner />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar
            isExpanded={isExpanded}
            onToggle={toggleSidebar}
            isMobileOpen={isMobileOpen}
            onMobileClose={closeMobile}
          />
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8 overflow-y-auto transition-colors">
            <PageTransition>{children}</PageTransition>
          </main>
        </div>
        <Footer />
      </div>
    </AdminAuthProvider>
  );
}
