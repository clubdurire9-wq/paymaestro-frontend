'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { ShieldAlert, ArrowRight, Clock, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function KYCWarningBanner() {
  const locale = useLocale();
  const t = useTranslations('kyc.banner');
  const { user } = useAuth();

  if (!user) return null;

  const status = user.kycStatus;
  const remaining = typeof (user as any).kycRemainingAttempts === 'number' ? (user as any).kycRemainingAttempts : 3;

  if (status === 'APPROVED') return null;

  const isPending = status === 'PENDING_AI' || status === 'PENDING_HUMAN';
  const isRejected = status === 'REJECTED';

  const bgColor = isRejected
    ? 'bg-red-600'
    : isPending
    ? 'bg-amber-500'
    : 'bg-red-600';

  const Icon = isRejected
    ? AlertTriangle
    : isPending
    ? Clock
    : ShieldAlert;

  const title = isRejected
    ? t('rejected')
    : isPending
    ? t('pendingTitle')
    : t('unverified');

  const message = isRejected
    ? remaining > 0
      ? t('rejectedMessage', { remaining })
      : t('exhaustedMessage')
    : isPending
    ? t('pendingMessage')
    : t('unverifiedMessage');

  return (
    <div className={`${bgColor} text-white`}>
      <div className="max-w-5xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <Icon className="w-5 h-5 shrink-0" />
          <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
            <span className="text-sm font-semibold whitespace-nowrap">{title} :</span>
            <span className="text-sm text-white/90">{message}</span>
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {!isPending && remaining > 0 && (
            <Link
              href={isRejected ? `/${locale}/kyc` : `/${locale}/profile?trigger=kyc`}
              className="flex items-center gap-1 text-sm font-semibold text-white hover:text-white/80 transition-colors whitespace-nowrap"
            >
              {isRejected ? t('contestDecision') : t('verifyNow')}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
