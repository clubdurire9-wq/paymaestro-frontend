'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Rocket, Wallet, CreditCard, Shield, Smartphone, DollarSign, Globe, Bitcoin, ArrowLeftRight, Users, Building, LifeBuoy, CheckCircle, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    id: 'intro',
    icon: Rocket,
    title: 'What is PayMaestro?',
    content: [
      'PayMaestro is an all-in-one financial platform that lets you receive funds from PayPal, Mobile Money, bank transfer or crypto, store them in a centralized secure wallet, and withdraw to the service of your choice.',
      'Our mission: to offer African creators and the diaspora simple, fast access to digital financial services, without the constraints of traditional banks.',
    ],
  },
  {
    id: 'account',
    icon: CheckCircle,
    title: 'Create an Account',
    steps: [
      'Go to the registration page',
      'Sign in with your Google account or create an account with your email',
      'Set your password',
      'Enable two-factor authentication (recommended)',
      'Your wallet is automatically created with a balance of $0',
    ],
  },
  {
    id: 'kyc',
    icon: Shield,
    title: 'KYC Verification',
    warning: 'KYC verification is required to make withdrawals and transfers.',
    steps: [
      'Go to the "Verification" section from the sidebar',
      'Fill in your legal information (last name, first name, date of birth, country, address)',
      'Upload a valid ID document (passport, national ID, driving license, voter card)',
      'Submit your request',
      'Our team processes your file within 24 to 48 hours',
      'You will receive an email notification once approved',
    ],
  },
  {
    id: 'paypal',
    icon: DollarSign,
    title: 'PayPal Deposit → Wallet',
    steps: [
      'From the sidebar, click on "PayPal"',
      'Enter the amount you wish to deposit (min $10)',
      'Click on "Pay with PayPal"',
      'You are redirected to PayPal to validate the payment',
      'Funds are automatically credited to your PayMaestro wallet',
      'Fee: 5% of the gross amount',
    ],
  },
  {
    id: 'mobile-money',
    icon: Smartphone,
    title: 'Mobile Money Deposit → Wallet',
    steps: [
      'Go to the Wallet page from the sidebar',
      'Select the "Mobile Money Deposit" tab',
      'Choose your country from the list (54 countries available)',
      'Select your operator (Orange, MTN, Airtel, Wave, etc.)',
      'Enter your phone number',
      'Enter the amount in local currency',
      'You can choose USD or local currency depending on available options',
      'Confirm the transaction',
      'Check your phone to authorize the payment',
      'Fee: 3% of the amount',
    ],
  },
  {
    id: 'iban',
    icon: Globe,
    title: 'SEPA Transfer / IBAN',
    steps: [
      'Go to the IBAN page from the sidebar',
      'Select your country from 14 available SEPA countries',
      'Create your virtual IBAN (first IBAN free, $5 for additional)',
      'Use this IBAN to receive transfers from Europe',
      'Funds arrive in your PayMaestro wallet',
      'Fee: 2% of the amount',
    ],
  },
  {
    id: 'crypto',
    icon: Bitcoin,
    title: 'Crypto Deposit → Wallet',
    steps: [
      'Go to the Crypto page from the sidebar',
      'Select the crypto (BTC, ETH, USDT, USDC, SOL, XRP, BNB, TRX)',
      'Generate a deposit address',
      'Scan the QR code or copy the address',
      'Send your funds from your external wallet',
      'The transaction is detected automatically (NowPayments)',
      'Funds are credited to your wallet after network confirmation',
      'Fee: 2% of the amount',
    ],
  },
  {
    id: 'pm-transfer',
    icon: ArrowLeftRight,
    title: 'PayMaestro → PayMaestro Transfer',
    steps: [
      'Go to the Wallet page',
      'Select "PM → PM Transfer"',
      'Enter the recipient\'s email or phone number',
      'Enter the amount',
      'Confirm the transaction',
      'The recipient receives the funds instantly',
      'Fee: 0% (free)',
    ],
  },
  {
    id: 'withdraw-mobile',
    icon: Smartphone,
    title: 'Withdraw Wallet → Mobile Money',
    steps: [
      'In the Wallet page, select the "Mobile Money Withdrawal" tab',
      'Choose the country and operator',
      'Enter the recipient\'s phone number',
      'Enter the amount',
      'Confirm the transaction',
      'Funds are sent within minutes',
      'Fee: 3% of the amount',
    ],
  },
  {
    id: 'cards',
    icon: CreditCard,
    title: 'Virtual Cards',
    steps: [
      'Go to the Cards page from the sidebar',
      'Click on "Create a card"',
      'Choose the card country',
      'Set the spending limit (optional)',
      'Confirm creation ($2 fee)',
      'Your Visa/Mastercard is created instantly',
      'You can view, copy or hide the card number and CVV',
      'Use it for online payments anywhere in the world',
    ],
  },
  {
    id: 'referral',
    icon: Users,
    title: 'Referral Program',
    steps: [
      'Go to the Referral page from the sidebar',
      'Your unique referral code is automatically generated',
      'Share your link with your friends',
      'When a referred user makes their first paid transaction, you receive a commission',
      'Track your earnings and network from the Referral page',
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Account Security',
    items: [
      { label: 'Authentication', value: '2FA via Google Authenticator available in Profile > Security' },
      { label: 'Encryption', value: 'AES-256-GCM for sensitive data, SHA-256 for audits' },
      { label: 'Protection', value: 'Real-time fraud detection, VPN/proxy IP blocking, rate limiting' },
      { label: 'Compliance', value: 'PCI-DSS, KYC/AML, GDPR' },
      { label: 'Notifications', value: 'Email alerts for every login, transaction, password change' },
    ],
  },
];

export default function GettingStartedPage() {
  const locale = useLocale();

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/${locale}/docs`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <BookOpen className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <Link href={`/${locale}/docs`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Documentation</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">Quick Start</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Quick Start Guide</h1>
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 -mt-4">
        Learn how to use PayMaestro from A to Z. Create an account, verify your identity and make your first transactions.
      </p>

      {/* Table of contents */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">In this guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.title}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <Card className="border-slate-100 dark:border-slate-700 scroll-mt-20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
              </div>

              {'content' in section && Array.isArray(section.content) && (
                <div className="space-y-2">
                  {section.content.map((p, i) => (
                    <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p}</p>
                  ))}
                </div>
              )}

              {'warning' in section && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">{section.warning}</p>
                </div>
              )}

              {'steps' in section && (
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}

              {'items' in section && Array.isArray(section.items) && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between py-2 gap-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ))}

      {/* Next */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Finished the guide?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Check out the API documentation to integrate PayMaestro into your application.</p>
        <Link href={`/${locale}/docs/api`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          Developer API <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
