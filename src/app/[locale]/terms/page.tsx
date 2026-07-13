'use client';

import { useLocale } from 'next-intl';
import { Shield, FileText, Lock, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  const locale = useLocale();

  const sections = [
    {
      icon: Shield,
      title: '1. Acceptance of Terms',
      content: 'By accessing and using PayMaestro, you agree to be bound by these terms of service. If you do not accept these terms, please do not use our services.',
    },
    {
      icon: FileText,
      title: '2. Service Description',
      content: 'PayMaestro is a financial platform that allows users to store, send and withdraw funds through a centralized secure wallet in 54 African countries. Deposit from PayPal, Mobile Money, bank or crypto, then withdraw to Mobile Money, bank, PayPal, crypto or virtual card.',
    },
    {
      icon: Scale,
      title: '3. Fees and Commissions',
      content: 'Our fees are transparent and displayed before each transaction: PayPal → Wallet (5%), Mobile Money → Wallet (3%), Bank → Wallet (2%), Crypto → Wallet (2%), Wallet → Mobile Money (3%), Wallet → Bank (2-5%), Wallet → PayPal (3%), Wallet → Card (1%+2%FX). All fees are calculated on the gross amount in USD.',
    },
    {
      icon: Lock,
      title: '4. Data Protection',
      content: 'We only collect data necessary to provide our services (email, phone number, ID for KYC). Your data is encrypted and stored securely. We never share your data with third parties without your explicit consent.',
    },
    {
      icon: Shield,
      title: '5. Identity Verification (KYC)',
      content: 'To use all PayMaestro services, you must verify your identity by providing a valid ID (passport, national ID, driving license or voter card). This verification is required for withdrawals and transfers.',
    },
    {
      icon: FileText,
      title: '6. Limitation of Liability',
      content: 'PayMaestro acts as a payment intermediary. We are not responsible for incorrect phone numbers or bank details entered by the user. In case of error, contact our support immediately for a refund.',
    },
    {
      icon: Scale,
      title: '7. Refunds',
      content: 'Refund requests are handled on a case-by-case basis by our team. A refund can be made to your wallet, Mobile Money, PayPal account or bank account. Service fees are non-refundable.',
    },
    {
      icon: Lock,
      title: '8. Account Security',
      content: 'You are responsible for the security of your login credentials. Enable two-factor authentication when available. PayMaestro will never ask for your password by email or phone.',
    },
    {
      icon: Shield,
      title: '9. Modification of Terms',
      content: 'PayMaestro reserves the right to modify these terms at any time. Users will be notified of important changes by email. Continued use of our services after modification constitutes acceptance.',
    },
    {
      icon: Scale,
      title: '10. Contact',
      content: 'For any questions regarding these terms, contact our support team via the chatbot on our platform or by email at support@paymaestro.com.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Terms of Service</h1>
        <p className="text-slate-500 dark:text-slate-400">Last updated: June 2026</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>By using PayMaestro, you accept these terms of service.</p>
      </div>
    </div>
  );
}