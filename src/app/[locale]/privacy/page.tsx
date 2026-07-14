'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Shield, Lock, Eye, Database, Globe, Trash2, LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const iconMap: Record<string, LucideIcon> = {
  dataCollected: Database,
  useOfData: Eye,
  storage: Lock,
  international: Globe,
  sharing: Shield,
  retention: Trash2,
  rights: Lock,
};

const sectionKeys = Object.keys(iconMap);

export default function PrivacyPage() {
  const t = useTranslations('privacy');
  const locale = useLocale();

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">{t('pageTitle')}</h1>
        <p className="text-slate-500 dark:text-slate-400">{t('pageSubtitle')}</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-2xl p-6 mb-8 text-center">
        <Shield className="w-8 h-8 text-violet-600 dark:text-violet-300 mx-auto mb-2" />
        <p className="text-sm text-violet-800 dark:text-violet-300 font-medium">{t('banner')}</p>
      </div>

      <div className="space-y-4">
        {sectionKeys.map((key) => {
          const Icon = iconMap[key];
          return (
            <Card key={key} className="border-slate-100 dark:border-slate-700">
              <CardContent className="p-6 space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <Icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
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