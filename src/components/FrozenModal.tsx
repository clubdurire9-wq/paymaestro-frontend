'use client';

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

const freezeTypeLabels: Record<string, { label: string; color: string }> = {
  ALL: { label: 'Tout bloquer', color: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300' },
  MOBILE_MONEY: { label: 'Mobile Money', color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300' },
  BANK: { label: 'Banque / Stripe', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300' },
  PAYPAL: { label: 'PayPal', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300' },
  CRYPTO: { label: 'Crypto', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300' },
  INTERNAL: { label: 'PM→PM', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300' },
};

export function FrozenModal({ isOpen, data, onClose }: FrozenModalProps) {
  if (!data) return null;

  const typeInfo = freezeTypeLabels[data.freezeType] || { label: data.freezeType, color: 'bg-slate-100 text-slate-700' };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      <div className="text-center">
        {/* Icône principale */}
        <div className="mx-auto w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg mb-4">
          <Snowflake className="w-8 h-8 text-white" />
        </div>

        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Compte temporairement bloqué
        </h2>

        <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">
          Pour des raisons de sécurité, votre compte a été suspendu.
          Veuillez contacter le support pour plus d&apos;informations.
        </p>

        {/* Détails du blocage */}
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-5 space-y-4 text-left mb-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-start gap-3">
            <ShieldAlert className="w-5 h-5 text-red-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Motif</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{data.reason}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Ban className="w-5 h-5 text-indigo-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Type de restriction</p>
              <Badge className={`mt-0.5 ${typeInfo.color}`}>{typeInfo.label}</Badge>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bloqué par</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">{data.frozenBy}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Clock className="w-5 h-5 text-slate-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date du blocage</p>
              <p className="text-sm font-semibold text-slate-800 dark:text-white mt-0.5">
                {new Date(data.frozenAt).toLocaleDateString('fr-FR', {
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

        {/* Message support */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
          <div className="flex items-start gap-3">
            <Lock className="w-5 h-5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
            <div className="text-left">
              <p className="text-sm font-bold text-amber-800 dark:text-amber-200">
                Opérations suspendues
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                Les transferts, retraits et envois d&apos;argent sont temporairement désactivés.
                Vous pouvez toujours consulter votre solde et votre historique.
              </p>
            </div>
          </div>
        </div>

        <Button fullWidth variant="primary" onClick={onClose}>
          J&apos;ai compris
        </Button>
      </div>
    </Modal>
  );
}
