'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Shield, FileText, Lock, Scale, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, LucideIcon> = {
  acceptance: Shield,
  service: FileText,
  fees: Scale,
  dataProtection: Lock,
  kyc: Shield,
  liability: FileText,
  refunds: Scale,
  security: Lock,
  modifications: Shield,
  contact: Scale,
};

const sectionKeys = Object.keys(iconMap);

export default function TermsPage() {
  const t = useTranslations('terms');
  const locale = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('pageSubtitle')}</p>
      </div>

      <div className="space-y-6">
        {sectionKeys.map((key) => {
          const Icon = iconMap[key];
          return (
            <Card key={key} className="border-slate-100 dark:border-slate-700">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                  </div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{t(`sections.${key}.title`)}</h3>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{t(`sections.${key}.content`)}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>{t('footer')}</p>
      </div>
    </div>
  );
}