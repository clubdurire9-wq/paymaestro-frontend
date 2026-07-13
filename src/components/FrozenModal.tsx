'use client';

import { useTranslations, useLocale } from 'next-intl';
import { Snowflake, ShieldAlert, Clock, User, Ban, Lock } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface FrozenData {
  reason: string;
  frozenBy: string;
  frozenAt: string;
  freezeType: string;
}

interface FrozenModalProps {
  isOpen: boolean;
  data: FrozenData | null;
  onClose: () => void;
}

export function FrozenModal({ isOpen, data, onClose }: FrozenModalProps) {
  if (!data) return null;

  const t = useTranslations('freeze');
  const locale = useLocale();

  const freezeTypeLabels: Record<string, { label: string; color: string }> = {
    ALL: { label: t('type.ALL'), color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
    MOBILE_MONEY: { label: t('type.MOBILE_MONEY'), color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
    BANK: { label: t('type.BANK'), color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
    PAYPAL: { label: t('type.PAYPAL'), color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
    CRYPTO: { label: t('type.CRYPTO'), color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
    INTERNAL: { label: t('type.INTERNAL'), color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
  };

  const typeInfo = freezeTypeLabels[data.freezeType] || { label: data.freezeType, color: 'bg-slate-100 text-slate-700' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="text-center">
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
          <Snowflake className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          {t('accountBlocked')}
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          {t('securityReason')}
        </p>

        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 text-left mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('reason')}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{data.reason}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('restrictionType')}</p>
              <Badge className={`mt-0.5 ${typeInfo.color}`}>{typeInfo.label}</Badge>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('blockedBy')}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{data.frozenBy}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{t('date')}</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                {new Date(data.frozenAt).toLocaleDateString(locale, {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                {t('operationsSuspended')}
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {t('operationsDesc')}
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth variant="primary" onClick={onClose}>
          {t('understood')}
        </Button>
      </div>
    </Modal>
  );
}
