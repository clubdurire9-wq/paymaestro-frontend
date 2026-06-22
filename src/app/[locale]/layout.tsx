import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import { GoogleAuthProvider } from '@/components/auth/GoogleAuthProvider';
import { ToastProvider } from '@/hooks/useToast';
import ChatWidget from '@/components/chatbot/ChatWidget';
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
    <html lang={locale}>
      <head>
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body>
        <NextIntlClientProvider messages={messages} locale={locale}>
          <GoogleAuthProvider>
            <ToastProvider>
              <Header />
              <main style={{ minHeight: '80vh' }}>{children}</main>
              <Footer />
              <ChatWidget />
            </ToastProvider>
          </GoogleAuthProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}