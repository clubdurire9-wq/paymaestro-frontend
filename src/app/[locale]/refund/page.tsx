'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Scale, AlertTriangle, FileText, Shield, RefreshCw, Clock, Ban, Mail, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, LucideIcon> = {
  general: Scale,
  responsibility: AlertTriangle,
  internalTypo: FileText,
  eligibility: RefreshCw,
  fees: Shield,
  method: Clock,
  antifraud: Ban,
  claim: Mail,
};

const sectionKeys = Object.keys(iconMap);

export default function RefundPage() {
  const t = useTranslations('refund');
  const locale = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('pageSubtitle')}</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 mb-8 text-center">
        <Scale className="w-8 h-8 text-amber-600 dark:text-amber-300 mx-auto mb-2" />
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">{t('banner')}</p>
      </div>

      <div className="space-y-4">
        {sectionKeys.map((key) => {
          const Icon = iconMap[key];
          return (
            <Card key={key} className="border-slate-100 dark:border-slate-700">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-amber-600 dark:text-amber-300" />
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
