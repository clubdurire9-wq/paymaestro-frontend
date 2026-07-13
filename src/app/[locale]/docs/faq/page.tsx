'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { HelpCircle, BookOpen, ChevronDown, Search, Wallet, DollarSign, Smartphone, Shield, CreditCard, Users, Globe, Bitcoin, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqCategories = [
  {
    icon: Wallet,
    title: 'General',
    questions: [
      { q: 'What is PayMaestro?', a: 'PayMaestro is a financial platform that allows users to receive funds from PayPal, Mobile Money, bank transfer or crypto, store them in a secure wallet, and withdraw to the service of their choice.' },
      { q: 'Is PayMaestro legal?', a: 'Yes, PayMaestro operates in compliance with international financial regulations (PCI-DSS, KYC/AML) and respects GDPR for data protection.' },
      { q: 'In which countries is PayMaestro available?', a: 'PayMaestro is available in all 54 African countries. Available Mobile Money operators vary by country.' },
      { q: 'Can I have multiple accounts?', a: 'One account per person. Creating multiple accounts is prohibited and may result in suspension of your access.' },
    ],
  },
  {
    icon: DollarSign,
    title: 'PayPal Deposits',
    questions: [
      { q: 'What is the minimum deposit amount for PayPal?', a: 'The minimum amount is $10 USD. The maximum depends on your verification level.' },
      { q: 'How long does a PayPal deposit take?', a: 'The deposit is credited instantly to your wallet as soon as PayPal confirms the transaction.' },
      { q: 'What are the fees for a PayPal deposit?', a: 'The fee is 5% of the gross amount. For example, for $100 deposited, you receive $95 in your wallet.' },
      { q: 'Can I use a PayPal business account?', a: 'Yes, both personal and business PayPal accounts are accepted.' },
    ],
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    questions: [
      { q: 'Which Mobile Money operators are supported?', a: 'We support MTN Mobile Money, Orange Money, Wave, Moov, Airtel Money, M-Pesa, Free Money, Tigo Cash, Mobicash and Safaricom in 54 African countries.' },
      { q: 'How long does a Mobile Money deposit take?', a: 'The deposit is generally processed within minutes after confirmation on your phone.' },
      { q: 'Can I deposit in local currency?', a: 'Yes, depending on the country, you can choose between USD and the local currency (XOF, XAF, GHS, KES, NGN, etc.).' },
      { q: 'Why did my Mobile Money transaction fail?', a: 'Failures can be due to insufficient balance, a temporarily unavailable operator, or an incorrect number. Check your information and try again.' },
    ],
  },
  {
    icon: Globe,
    title: 'Bank Transfer / IBAN',
    questions: [
      { q: 'How do I create a virtual IBAN?', a: 'Go to the IBAN page from the sidebar, select your country from 14 SEPA countries, and create your IBAN. The first one is free.' },
      { q: 'How much does an additional IBAN cost?', a: 'Additional IBANs cost $5 each, deducted from your wallet.' },
      { q: 'Which SEPA countries are available?', a: 'France, Germany, Italy, Spain, Belgium, Netherlands, Portugal, Ireland, Austria, Finland, Greece, Luxembourg, Slovenia, Estonia.' },
      { q: 'How long does a SEPA transfer take?', a: 'SEPA transfers usually arrive within 1 to 3 business days.' },
    ],
  },
  {
    icon: Bitcoin,
    title: 'Crypto',
    questions: [
      { q: 'Which cryptocurrencies are supported?', a: 'BTC (Bitcoin), ETH (Ethereum), USDT (Tether), USDC (USD Coin), SOL (Solana), XRP (Ripple), BNB (Binance Coin), TRX (TRON).' },
      { q: 'What is the minimum deposit amount for crypto?', a: 'The minimum varies by cryptocurrency. Check the Crypto page in your dashboard for current limits.' },
      { q: 'How many confirmations are needed?', a: 'It depends on the network. Typically: BTC (2 confirmations), ETH (12), USDT/TRC20 (20).' },
      { q: 'Can I withdraw crypto from my wallet?', a: 'Yes, crypto withdrawals are available with a 2% fee. Note: withdrawals are reserved for administrators.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Virtual Cards',
    questions: [
      { q: 'How do I create a virtual card?', a: 'From the Cards page, click "Create a card". Choose the country, set a limit if desired, and confirm. Creation fee is $2.' },
      { q: 'Where can I use my virtual card?', a: 'Everywhere Visa/Mastercard is accepted online: subscriptions, purchases, digital services, etc.' },
      { q: 'How do I see my card number and CVV?', a: 'From the Cards page, click the "Show" button to reveal the number and CVV. You can also copy the information.' },
      { q: 'Can I cancel my card?', a: 'Yes, from the Cards page, click "Cancel card". This action is irreversible.' },
    ],
  },
  {
    icon: ArrowLeftRight,
    title: 'Transfers & Withdrawals',
    questions: [
      { q: 'What are the PM → PM transfer fees?', a: 'Transfers between PayMaestro users are free (0% fee).' },
      { q: 'How long does a withdrawal to Mobile Money take?', a: 'Withdrawals are generally processed within minutes.' },
      { q: 'Is there a withdrawal limit?', a: 'Yes, limits depend on your KYC verification level. The more complete your verification, the higher your limits.' },
      { q: 'Can I cancel a transaction?', a: 'Once confirmed, a transaction cannot be canceled automatically. Contact support for assistance.' },
    ],
  },
  {
    icon: Shield,
    title: 'Security & Account',
    questions: [
      { q: 'How do I enable 2FA?', a: 'Go to your Profile > Security tab, and enable two-factor authentication with Google Authenticator.' },
      { q: 'What if I forgot my password?', a: 'Use the "Forgot password" function on the login page to reset your password.' },
      { q: 'How do I update my personal information?', a: 'From the Profile page, you can edit your name, date of birth, country and address (limited to once every 30 days).' },
      { q: 'My account is frozen, what should I do?', a: 'Contact support via the chatbot or by email at support@paymaestro.com to unlock your account.' },
    ],
  },
  {
    icon: Users,
    title: 'Referral',
    questions: [
      { q: 'How does the referral program work?', a: 'Share your unique referral code. When a referred user signs up and makes their first paid transaction, you receive a commission.' },
      { q: 'Where can I find my referral code?', a: 'Your code is available on the Referral page from the sidebar.' },
    ],
  },
];

export default function FaqPage() {
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (title: string) => {
    setOpenCategory(prev => prev === title ? null : title);
  };

  const filteredFaqs = faqCategories
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.questions.length > 0);

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
            <span className="text-slate-600 dark:text-slate-300">FAQ</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Frequently Asked Questions</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search a question..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {(search ? filteredFaqs : faqCategories).map((category) => (
          <Card key={category.title} className="border-slate-100 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleCategory(category.title)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{category.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{category.questions.length} question{category.questions.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openCategory === category.title ? 'rotate-180' : ''}`} />
            </button>

            {openCategory === category.title && (
              <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                {category.questions.map((item, i) => (
                  <div key={i} className="p-5 space-y-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.q}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {(search ? filteredFaqs : faqCategories).length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>No questions found for &quot;{search}&quot;</p>
          </div>
        )}
      </div>

      {/* Still need help */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Still need help?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Our support team is available 24/7.</p>
        <Link href={`/${locale}/contact`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          Contact Support
        </Link>
      </section>
    </div>
  );
}
