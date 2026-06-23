import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GoogleAuthProvider } from '@/components/auth/GoogleAuthProvider';
import { ToastProvider } from '@/hooks/useToast';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { OnboardingGuard } from '@/middleware/onboarding-guard';

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <NextIntlClientProvider messages={messages} locale={locale}>
      <GoogleAuthProvider>
        <ToastProvider>
          <OnboardingGuard>
            <Header />
            <main style={{ minHeight: '80vh' }}>{children}</main>
            <Footer />
          </OnboardingGuard>
          <ChatWidget />
        </ToastProvider>
      </GoogleAuthProvider>
    </NextIntlClientProvider>
  );
}