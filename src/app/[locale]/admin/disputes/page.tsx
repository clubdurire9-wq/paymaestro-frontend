'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, AlertTriangle, RotateCcw, Send, Loader2,
  CheckCircle, X, User, ShieldAlert
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

type Tab = 'pm2pm' | 'withdrawal';

export default function AdminDisputesPage() {
  const locale = useLocale();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<Tab>('pm2pm');

  // PM→PM Redirect
  const [pmTxId, setPmTxId] = useState('');
  const [pmCorrectEmail, setPmCorrectEmail] = useState('');
  const [pmReason, setPmReason] = useState('');
  const [pmResult, setPmResult] = useState<any>(null);
  const [pmLoading, setPmLoading] = useState(false);

  // Withdrawal Compensation
  const [wdTxId, setWdTxId] = useState('');
  const [wdAmount, setWdAmount] = useState('');
  const [wdReason, setWdReason] = useState('');
  const [wdResult, setWdResult] = useState<any>(null);
  const [wdLoading, setWdLoading] = useState(false);

  const handleRedirectPm = async () => {
    if (!pmTxId.trim() || !pmCorrectEmail.trim() || !pmReason.trim()) return;
    setPmLoading(true);
    setPmResult(null);
    try {
      const res = await api.admin.redirectPmToPm(pmTxId.trim(), pmCorrectEmail.trim(), pmReason.trim());
      setPmResult(res);
      success(`Redirection réussie ! ${res.data?.amount}$ redirigés`);
    } catch (e: any) {
      toastError(e.message || 'Erreur de redirection');
    }
    setPmLoading(false);
  };

  const handleCompensate = async () => {
    if (!wdTxId.trim() || !wdReason.trim()) return;
    setWdLoading(true);
    setWdResult(null);
    try {
      const amount = wdAmount.trim() ? parseFloat(wdAmount) : undefined;
      const res = await api.admin.compensate(wdTxId.trim(), wdReason.trim(), amount);
      setWdResult(res);
      success(`Compensation réussie ! ${res.data?.amount}$ crédités au wallet`);
    } catch (e: any) {
      toastError(e.message || 'Erreur de compensation');
    }
    setWdLoading(false);
  };

  const resetPm = () => { setPmTxId(''); setPmCorrectEmail(''); setPmReason(''); setPmResult(null); };
  const resetWd = () => { setWdTxId(''); setWdAmount(''); setWdReason(''); setWdResult(null); };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link
            href={`/${locale}/admin`}
            className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-slate-700 dark:text-slate-400 dark:hover:bg-slate-700 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-6 h-6 text-amber-500" />
              Litiges & Corrections
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Compensez un retrait échoué ou redirigez un transfert vers le bon destinataire
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab('pm2pm')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            tab === 'pm2pm'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" />
          Erreur d&apos;envoi PM→PM
        </button>
        <button
          onClick={() => setTab('withdrawal')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            tab === 'withdrawal'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Litige retrait Mobile Money
        </button>
      </div>

      {tab === 'pm2pm' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-900/30">
                <Send className="w-5 h-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Rediriger un transfert PM→PM</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  L&apos;utilisateur a envoyé au mauvais email. Récupérez l&apos;argent du mauvais destinataire
                  et créditez le bon compte.
                </p>
              </div>
            </div>

            {!pmResult ? (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ID de la transaction PM→PM
                  </label>
                  <input
                    type="text"
                    value={pmTxId}
                    onChange={(e) => setPmTxId(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email du BON destinataire
                  </label>
                  <input
                    type="email"
                    value={pmCorrectEmail}
                    onChange={(e) => setPmCorrectEmail(e.target.value)}
                    placeholder="bon.destinataire@email.com"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Raison
                  </label>
                  <select
                    value={pmReason}
                    onChange={(e) => setPmReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="Email erroné de la part de l'utilisateur">Email erroné de la part de l&apos;utilisateur</option>
                    <option value="Faute de frappe dans l'email">Faute de frappe dans l&apos;email</option>
                    <option value="Utilisateur a mal recopié l'email">Utilisateur a mal recopié l&apos;email</option>
                    <option value="Confusion entre deux comptes">Confusion entre deux comptes</option>
                  </select>
                  <input
                    type="text"
                    value={pmReason}
                    onChange={(e) => setPmReason(e.target.value)}
                    placeholder="Ou tapez une raison personnalisée..."
                    className="w-full px-4 py-2.5 mt-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <Button
                  onClick={handleRedirectPm}
                  disabled={pmLoading || !pmTxId.trim() || !pmCorrectEmail.trim() || !pmReason.trim()}
                  icon={pmLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  variant="primary"
                >
                  {pmLoading ? 'Redirection en cours...' : 'Rediriger le transfert'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Redirection réussie</h3>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{pmResult.message}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-sm">
                  <p className="text-slate-500 dark:text-slate-400">
                    Montant : <span className="font-bold text-slate-900 dark:text-white">{pmResult.data?.amount}$</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Ancien destinataire : <span className="font-mono text-slate-700 dark:text-slate-300">{pmResult.data?.wrongRecipient}</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Nouveau destinataire : <span className="font-mono text-slate-700 dark:text-slate-300">{pmResult.data?.correctRecipient}</span>
                  </p>
                </div>
                <Button variant="outline" onClick={resetPm} icon={<RotateCcw className="w-4 h-4" />}>
                  Effectuer une autre redirection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'withdrawal' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-red-100 dark:bg-red-900/30">
                <ShieldAlert className="w-5 h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Compenser un retrait échoué</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  L&apos;utilisateur a retiré son argent mais le wallet a été débité sans que l&apos;argent
                  n&apos;arrive sur Mobile Money. Créditez son wallet depuis la trésorerie.
                </p>
              </div>
            </div>

            {!wdResult ? (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ID de la transaction de retrait
                  </label>
                  <input
                    type="text"
                    value={wdTxId}
                    onChange={(e) => setWdTxId(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Montant à compenser <span className="text-xs text-slate-400 font-normal">(laissez vide pour le total)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={wdAmount}
                      onChange={(e) => setWdAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Raison de la compensation
                  </label>
                  <select
                    value={wdReason}
                    onChange={(e) => setWdReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="Retrait Mobile Money non reçu">Retrait Mobile Money non reçu</option>
                    <option value="Erreur de la plateforme Mobile Money">Erreur de la plateforme Mobile Money</option>
                    <option value="Timeout du fournisseur de paiement">Timeout du fournisseur de paiement</option>
                    <option value="Transaction annulée par l'opérateur">Transaction annulée par l&apos;opérateur</option>
                    <option value="Fonds bloqués chez le fournisseur">Fonds bloqués chez le fournisseur</option>
                  </select>
                  <input
                    type="text"
                    value={wdReason}
                    onChange={(e) => setWdReason(e.target.value)}
                    placeholder="Ou tapez une raison personnalisée..."
                    className="w-full px-4 py-2.5 mt-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <Button
                  onClick={handleCompensate}
                  disabled={wdLoading || !wdTxId.trim() || !wdReason.trim()}
                  icon={wdLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
                  variant="danger"
                >
                  {wdLoading ? 'Compensation en cours...' : 'Compenser le retrait'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Compensation effectuée</h3>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">{wdResult.message}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-sm">
                  <p className="text-slate-500 dark:text-slate-400">
                    Montant crédité : <span className="font-bold text-slate-900 dark:text-white">{wdResult.data?.amount}$</span>
                  </p>
                  <p className="text-slate-500 dark:text-slate-400">
                    Transaction : <span className="font-mono text-slate-700 dark:text-slate-300">#{wdResult.data?.originalTransactionId}</span>
                  </p>
                </div>
                <Button variant="outline" onClick={resetWd} icon={<RotateCcw className="w-4 h-4" />}>
                  Effectuer une autre compensation
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
