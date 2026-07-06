'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import {
  ArrowLeft, AlertTriangle, RotateCcw, Send, Loader2,
  CheckCircle, Wallet, User, Search
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

type Tab = 'pm2pm' | 'credit';

export default function AdminDisputesPage() {
  const locale = useLocale();
  const { success, error: toastError } = useToast();

  const [tab, setTab] = useState<Tab>('pm2pm');

  // PM→PM Redirect
  const [pmTxId, setPmTxId] = useState('');
  const [pmTxLookup, setPmTxLookup] = useState<any>(null);
  const [pmTxLookupLoading, setPmTxLookupLoading] = useState(false);
  const [pmTxLookupError, setPmTxLookupError] = useState('');
  const [pmCorrectEmail, setPmCorrectEmail] = useState('');
  const [pmCorrectUser, setPmCorrectUser] = useState<any>(null);
  const [pmCorrectLookupLoading, setPmCorrectLookupLoading] = useState(false);
  const [pmReason, setPmReason] = useState('');
  const [pmResult, setPmResult] = useState<any>(null);
  const [pmLoading, setPmLoading] = useState(false);

  // Wallet Credit Compensation (crypto, PayPal, IBAN, Mobile Money…)
  const [crTxId, setCrTxId] = useState('');
  const [crAmount, setCrAmount] = useState('');
  const [crReason, setCrReason] = useState('');
  const [crResult, setCrResult] = useState<any>(null);
  const [crLoading, setCrLoading] = useState(false);

  // Lookup transaction details when ID changes
  useEffect(() => {
    if (!pmTxId.trim() || pmTxId === pmTxLookup?.transaction?.id?.toString()) return;
    const timer = setTimeout(async () => {
      setPmTxLookupLoading(true);
      setPmTxLookupError('');
      setPmTxLookup(null);
      try {
        const res = await api.admin.getPmToPmDetails(pmTxId.trim());
        if (res?.transaction) {
          setPmTxLookup(res);
        } else {
          setPmTxLookupError('Transaction non trouvée ou pas un transfert PM→PM');
        }
      } catch (e: any) {
        setPmTxLookupError(e.message || 'Transaction introuvable');
      }
      setPmTxLookupLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [pmTxId]);

  // Lookup correct email user
  useEffect(() => {
    if (!pmCorrectEmail.trim() || !pmCorrectEmail.includes('@')) { setPmCorrectUser(null); return; }
    const timer = setTimeout(async () => {
      setPmCorrectLookupLoading(true);
      setPmCorrectUser(null);
      try {
        const users = await api.admin.searchUsers(pmCorrectEmail.trim());
        const found = users?.find((u: any) => u.email === pmCorrectEmail.trim());
        setPmCorrectUser(found || { notFound: true, email: pmCorrectEmail.trim() });
      } catch {
        setPmCorrectUser({ notFound: true, email: pmCorrectEmail.trim() });
      }
      setPmCorrectLookupLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [pmCorrectEmail]);

  const handleRedirectPm = async () => {
    if (!pmTxId.trim() || !pmCorrectEmail.trim() || !pmReason.trim()) return;
    setPmLoading(true);
    setPmResult(null);
    try {
      const res = await api.admin.redirectPmToPm(pmTxId.trim(), pmCorrectEmail.trim(), pmReason.trim());
      setPmResult(res);
      success(`Redirection réussie ! ${res?.amount}$ redirigés`);
    } catch (e: any) {
      toastError(e.message || 'Erreur de redirection');
    }
    setPmLoading(false);
  };

  const handleCredit = async () => {
    if (!crTxId.trim() || !crReason.trim()) return;
    setCrLoading(true);
    setCrResult(null);
    try {
      const amount = crAmount.trim() ? parseFloat(crAmount) : undefined;
      const res = await api.admin.compensate(crTxId.trim(), crReason.trim(), amount);
      setCrResult(res);
      success(`Crédit réussi ! ${res?.amount}$ crédités au wallet`);
    } catch (e: any) {
      toastError(e.message || 'Erreur de compensation');
    }
    setCrLoading(false);
  };

  const resetPm = () => { setPmTxId(''); setPmTxLookup(null); setPmCorrectEmail(''); setPmCorrectUser(null); setPmReason(''); setPmResult(null); };
  const resetCr = () => { setCrTxId(''); setCrAmount(''); setCrReason(''); setCrResult(null); };

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
          onClick={() => setTab('credit')}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2 ${
            tab === 'credit'
              ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200'
          }`}
        >
          <Wallet className="w-4 h-4" />
          Crédit wallet (crypto, PayPal, IBAN…)
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
                {/* Transaction ID with lookup */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ID de la transaction PM→PM
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={pmTxId}
                      onChange={(e) => setPmTxId(e.target.value)}
                      placeholder="Ex: 156"
                      className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                    {pmTxLookupLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                  {pmTxLookupError && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> {pmTxLookupError}
                    </p>
                  )}
                  {pmTxLookup && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-slate-400 uppercase">Transaction #{pmTxLookup.transaction.id}</span>
                        <Badge variant={
                          pmTxLookup.transaction.status === 'COMPLETED' ? 'success' :
                          pmTxLookup.transaction.status === 'REVERSED' ? 'error' : 'warning'
                        }>{pmTxLookup.transaction.status}</Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span className="text-sm font-semibold text-slate-800 dark:text-white">{pmTxLookup.sender.name}</span>
                        <span className="text-xs text-slate-400">({pmTxLookup.sender.email})</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Montant</span>
                        <span className="font-bold text-slate-900 dark:text-white">{pmTxLookup.transaction.amount}$</span>
                      </div>
                      {pmTxLookup.recipient ? (
                        <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                          <p className="text-xs text-slate-400 mb-1">Destinataire actuel (mauvais)</p>
                          <div className="flex items-center gap-2">
                            <User className="w-3.5 h-3.5 text-amber-500" />
                            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">{pmTxLookup.recipient.name}</span>
                            <span className="text-xs text-slate-400">({pmTxLookup.recipient.email})</span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Solde : <span className={`font-semibold ${pmTxLookup.canRefund ? 'text-emerald-600' : 'text-red-500'}`}>
                              {pmTxLookup.recipient.balance}$
                            </span>
                            {!pmTxLookup.canRefund && (
                              <span className="text-red-500 ml-1">
                                — Fonds insuffisants pour rembourser
                              </span>
                            )}
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-600">Destinataire d'origine introuvable</p>
                      )}
                      {pmTxLookup.transaction.notes && (
                        <p className="text-xs text-slate-400 italic">{pmTxLookup.transaction.notes}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Correct email with user lookup */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Email du BON destinataire
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="email"
                      value={pmCorrectEmail}
                      onChange={(e) => setPmCorrectEmail(e.target.value)}
                      placeholder="bon.destinataire@email.com"
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                    />
                    {pmCorrectLookupLoading && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
                  </div>
                  {pmCorrectUser && !pmCorrectUser.notFound && (
                    <div className="mt-2 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-700">
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        <div>
                          <p className="text-sm font-bold text-emerald-800 dark:text-emerald-200">{pmCorrectUser.name || 'Utilisateur'}</p>
                          <p className="text-xs text-emerald-600 dark:text-emerald-400">{pmCorrectUser.email}{pmCorrectUser.phone_number ? ` • ${pmCorrectUser.phone_number}` : ''}</p>
                        </div>
                      </div>
                      {pmCorrectUser.kyc_status && (
                        <Badge variant={pmCorrectUser.kyc_status === 'APPROVED' ? 'success' : 'warning'} className="mt-1">
                          KYC {pmCorrectUser.kyc_status}
                        </Badge>
                      )}
                    </div>
                  )}
                  {pmCorrectUser?.notFound && (
                    <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3" /> Aucun compte trouvé avec cet email
                    </p>
                  )}
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
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    Action tracée dans la blockchain d&apos;audit avec votre identité
                    (<strong className="text-slate-700 dark:text-slate-300">{'{'}email, ID, IP{'}'}</strong>).
                    Votre geste admin est horodaté et infalsifiable.
                  </span>
                </div>
                <Button
                  onClick={handleRedirectPm}
                  disabled={pmLoading || !pmTxLookup?.recipient || !pmCorrectUser?.id || pmCorrectUser?.id === pmTxLookup?.recipient?.id || !pmReason.trim()}
                  title={
                    !pmTxLookup?.recipient ? 'Vérifiez d\'abord la transaction' :
                    !pmCorrectUser?.id ? 'Vérifiez d\'abord le destinataire' :
                    pmCorrectUser?.id === pmTxLookup?.recipient?.id ? 'Le destinataire est identique à l\'actuel' :
                    ''
                  }
                  icon={pmLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  variant="primary"
                >
                  {pmLoading ? 'Redirection en cours...' :
                   !pmTxLookup?.recipient ? 'Vérifiez la transaction' :
                   !pmCorrectUser?.id ? 'Vérifiez le destinataire' :
                   pmCorrectUser?.id === pmTxLookup?.recipient?.id ? 'Même destinataire' :
                   'Rediriger le transfert'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Redirection réussie</h3>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Redirection de {pmResult?.amount}$ de {pmResult?.wrongRecipient} vers {pmResult?.correctRecipient}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Montant</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{pmResult?.amount}$</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Ancien</span>
                    <span className="font-mono text-sm text-red-600 dark:text-red-400">{pmResult?.wrongRecipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Nouveau</span>
                    <span className="font-mono text-sm text-emerald-600 dark:text-emerald-400">{pmResult?.correctRecipient}</span>
                  </div>
                  {pmResult?.reference && (
                    <div className="flex items-center gap-2 pt-2 mt-2 border-t border-slate-200 dark:border-slate-700">
                      <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Réf.</span>
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-400">{pmResult.reference}</span>
                    </div>
                  )}
                </div>
                <Button variant="outline" onClick={resetPm} icon={<RotateCcw className="w-4 h-4" />}>
                  Effectuer une autre redirection
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {tab === 'credit' && (
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-xl bg-violet-100 dark:bg-violet-900/30">
                <Wallet className="w-5 h-5 text-violet-600 dark:text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Créditer le wallet (tous services)</h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  L&apos;utilisateur a déposé des fonds (crypto, PayPal, IBAN, Mobile Money…) mais
                  l&apos;argent n&apos;est pas arrivé sur son wallet. Créditez-le depuis la trésorerie.
                </p>
              </div>
            </div>

            {!crResult ? (
              <div className="space-y-4 max-w-lg">
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    ID de la transaction
                  </label>
                  <input
                    type="text"
                    value={crTxId}
                    onChange={(e) => setCrTxId(e.target.value)}
                    placeholder="Ex: 1234"
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Montant à créditer <span className="text-xs text-slate-400 font-normal">(laissez vide pour le total)</span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                    <input
                      type="number"
                      value={crAmount}
                      onChange={(e) => setCrAmount(e.target.value)}
                      className="w-full pl-8 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                      placeholder="0.00"
                      min="0.01"
                      step="0.01"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                    Raison
                  </label>
                  <select
                    value={crReason}
                    onChange={(e) => setCrReason(e.target.value)}
                    className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  >
                    <option value="">Sélectionnez...</option>
                    <option value="Dépôt crypto non reçu (capture écran fournie)">Dépôt crypto non reçu (capture écran fournie)</option>
                    <option value="Dépôt PayPal non reçu (capture écran fournie)">Dépôt PayPal non reçu (capture écran fournie)</option>
                    <option value="Dépôt IBAN non reçu (capture écran fournie)">Dépôt IBAN non reçu (capture écran fournie)</option>
                    <option value="Retrait Mobile Money non reçu">Retrait Mobile Money non reçu</option>
                    <option value="Timeout du fournisseur de paiement">Timeout du fournisseur de paiement</option>
                    <option value="Fonds bloqués chez le fournisseur">Fonds bloqués chez le fournisseur</option>
                    <option value="Litige client résolu en sa faveur">Litige client résolu en sa faveur</option>
                  </select>
                  <input
                    type="text"
                    value={crReason}
                    onChange={(e) => setCrReason(e.target.value)}
                    placeholder="Ou tapez une raison personnalisée..."
                    className="w-full px-4 py-2.5 mt-2 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500"
                  />
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400 flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0 text-amber-500" />
                  <span>
                    Cette action sera enregistrée dans la blockchain d&apos;audit avec votre identité
                    d&apos;admin (<strong className="text-slate-700 dark:text-slate-300">email, ID, IP</strong>).
                    Toute modification est tracée et vérifiable.
                  </span>
                </div>
                <Button
                  onClick={handleCredit}
                  disabled={crLoading || !crTxId.trim() || !crReason.trim()}
                  icon={crLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Wallet className="w-4 h-4" />}
                  variant="primary"
                >
                  {crLoading ? 'Crédit en cours...' : 'Créditer le wallet'}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <h3 className="font-bold text-emerald-800 dark:text-emerald-200">Wallet crédité avec succès</h3>
                  </div>
                  <p className="text-sm text-emerald-700 dark:text-emerald-300">Compensation de {crResult?.amount}$ effectuée sur la transaction #{crResult?.originalTransactionId}</p>
                </div>
                <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 space-y-1 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Montant</span>
                    <span className="font-bold text-lg text-slate-900 dark:text-white">{crResult?.amount}$</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider min-w-[90px]">Transaction</span>
                    <span className="font-mono text-sm text-slate-700 dark:text-slate-300">#{crResult?.originalTransactionId}</span>
                  </div>
                </div>
                <Button variant="outline" onClick={resetCr} icon={<RotateCcw className="w-4 h-4" />}>
                  Effectuer un autre crédit
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
