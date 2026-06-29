import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { ThemeProvider } from '@/contexts/ThemeContext';
import AppShell from '@/components/layout/AppShell';
import { GoogleAuthProvider } from '@/components/auth/GoogleAuthProvider';
import { ToastProvider } from '@/hooks/useToast';
import { ActivityProvider } from '@/contexts/ActivityContext';
import LockScreen from '@/components/auth/LockScreen';
import ChatWidget from '@/components/chatbot/ChatWidget';
import { OnboardingGuard } from '@/middleware/onboarding-guard';
import '../globals.css';

export const metadata: Metadata = {
  title: {
    default: 'PayMaestro — PayPal vers Mobile Money en Afrique',
    template: '%s | PayMaestro',
  },
  description:
    'Retirez vos fonds PayPal instantanément vers votre compte Mobile Money en Afrique. MTN, Orange, Wave, Moov, Airtel, Safaricom. Transfert en moins de 5 minutes.',
  keywords: [
    'PayPal Afrique',
    'Mobile Money',
    'retrait PayPal',
    'MTN Money',
    'Orange Money',
    'Wave',
    'transfert argent',
  ],
  openGraph: {
    title: 'PayMaestro — PayPal vers Mobile Money',
    description: 'La passerelle sécurisée pour retirer vos fonds PayPal vers Mobile Money en Afrique.',
    type: 'website',
  },
};

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
    <html lang={locale} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <ThemeProvider>
          <NextIntlClientProvider messages={messages} locale={locale}>
            <GoogleAuthProvider>
              <ActivityProvider>
                <ToastProvider>
                  <OnboardingGuard>
                    <AppShell>{children}</AppShell>
                    <LockScreen />
                  </OnboardingGuard>
                  <ChatWidget />
                </ToastProvider>
              </ActivityProvider>
            </GoogleAuthProvider>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}