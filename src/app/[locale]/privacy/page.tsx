'use client';

import { useLocale } from 'next-intl';
import { Shield, Lock, Eye, Database, Globe, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  const locale = useLocale();

  const sections = [
    {
      icon: Database,
      title: '1. Data Collected',
      content: 'We collect the following information: email (via Google OAuth), first and last name, Mobile Money phone number, ID document (for KYC), transaction history, IP address and browsing data.',
    },
    {
      icon: Eye,
      title: '2. Use of Data',
      content: 'Your data is used to: process your transactions, verify your identity (KYC), prevent fraud, improve our services, contact you in case of issues, and comply with our legal obligations.',
    },
    {
      icon: Lock,
      title: '3. Storage and Security',
      content: 'Your data is stored on secure servers with AES-256 encryption. Passwords are hashed with bcrypt. Connections are secured by SSL/TLS. We perform regular security audits.',
    },
    {
      icon: Globe,
      title: '4. International Transfer',
      content: 'Your data may be transferred and stored in different countries where we operate. These transfers are carried out in accordance with applicable data protection laws.',
    },
    {
      icon: Shield,
      title: '5. Sharing with Third Parties',
      content: 'We only share your data with: Flutterwave (for Mobile Money transfers), PayPal (for withdrawals), Google (for OAuth authentication). These partners are required to maintain the confidentiality of your data.',
    },
    {
      icon: Trash2,
      title: '6. Retention and Deletion',
      content: 'Your data is retained for the duration of your account plus 5 years (legal obligation). You can request the deletion of your account at any time. Transaction data is anonymized after 10 years.',
    },
    {
      icon: Lock,
      title: '7. Your Rights',
      content: 'You have the right to access, rectify and delete your data. You can also object to processing and request portability. Contact support@paymaestro.com to exercise these rights.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Privacy Policy</h1>
        <p className="text-slate-500 dark:text-slate-400">Last updated: June 2026</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-2xl p-6 mb-8 text-center">
        <Shield className="w-8 h-8 text-violet-600 dark:text-violet-300 mx-auto mb-2" />
        <p className="text-sm text-violet-800 dark:text-violet-300 font-medium">
          At PayMaestro, protecting your data is our priority. We are committed to handling your personal information with the utmost care.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>For any questions about our privacy policy: support@paymaestro.com</p>
      </div>
    </div>
  );
}