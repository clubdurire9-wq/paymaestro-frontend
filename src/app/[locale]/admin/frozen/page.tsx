'use client';

import { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import Link from 'next/link';
import {
  Lock, Unlock, Loader2, AlertTriangle, Search, User,
  ArrowLeft, Snowflake, RefreshCw, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function FrozenAccountsPage() {
  const locale = useLocale();
  const tAdmin = useTranslations('admin');
  const { success, error: toastError } = useToast();

  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [showFreezeModal, setShowFreezeModal] = useState(false);
  const [freezeUserId, setFreezeUserId] = useState('');
  const [freezeUserName, setFreezeUserName] = useState('');
  const [freezeReason, setFreezeReason] = useState('');
  const [freezeType, setFreezeType] = useState('ALL');

  // User search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => { loadAccounts(); }, []);

  const loadAccounts = async () => {
    setLoading(true);
    try {
      const data = await api.admin.getFrozenAccounts();
      setAccounts(data || []);
    } catch (e: any) {
      toastError(e.message || 'Erreur de chargement');
    }
    setLoading(false);
  };

  const handleFreeze = async () => {
    if (!freezeUserId.trim() || !freezeReason.trim()) return;
    setActionLoading('freeze');
    try {
      await api.admin.freeze(freezeUserId.trim(), freezeReason.trim(), freezeType);
      success(tAdmin('accountFrozen'));
      setShowFreezeModal(false);
      setFreezeUserId('');
      setFreezeReason('');
      setFreezeType('ALL');
      loadAccounts();
    } catch (e: any) {
      toastError(e.message || 'Erreur de gel');
    }
    setActionLoading(null);
  };

  const handleUnfreeze = async (userId: string) => {
    setActionLoading(userId);
    try {
      await api.admin.unfreeze(userId);
      success(tAdmin('accountUnfrozen'));
      loadAccounts();
    } catch (e: any) {
      toastError(e.message || 'Erreur de dégel');
    }
    setActionLoading(null);
  };

  const searchUsers = async (q: string) => {
    setSearchQuery(q);
    if (!q.trim()) { setSearchResults([]); return; }
    setSearching(true);
    try {
      const res = await api.admin.searchUsers(q.trim());
      setSearchResults(res || []);
    } catch { setSearchResults([]); }
    setSearching(false);
  };

  const selectUser = (u: any) => {
    setFreezeUserId(u.id);
    setFreezeUserName(`${u.name || ''} (${u.email || ''})`);
    setSearchQuery('');
    setSearchResults([]);
  };

  const freezeTypes = [
    { value: 'ALL', label: '🔒 Tout bloquer' },
    { value: 'MOBILE_MONEY', label: '📱 Mobile Money' },
    { value: 'BANK', label: '🏦 Banque / Stripe' },
    { value: 'PAYPAL', label: '💳 PayPal' },
    { value: 'CRYPTO', label: '₿ Crypto' },
    { value: 'INTERNAL', label: '↔️ PM→PM' },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">
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
              <Snowflake className="w-6 h-6 text-blue-500" />
              {tAdmin('frozenAccounts')}
            </h1>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              {accounts.length} compte(s) gelé(s)
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={loadAccounts} disabled={loading} icon={
            loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />
          }>
            Actualiser
          </Button>
          <Button onClick={() => setShowFreezeModal(true)} icon={<Lock className="w-4 h-4" />} variant="danger">
            Geler un compte
          </Button>
        </div>
      </div>

      {/* Liste des comptes gelés */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-violet-600" />
            </div>
          ) : accounts.length === 0 ? (
            <div className="py-16 text-center">
              <Snowflake className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Aucun compte gelé</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Les comptes gelés apparaîtront ici</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-slate-700">
              {accounts.map((acc) => (
                <div key={acc.id} className="flex items-center justify-between p-4 md:px-6 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-slate-900 dark:text-white truncate">{acc.user_name}</p>
                      <Badge className="bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 text-[10px]">
                        {acc.freeze_type}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{acc.user_email}</p>
                    <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-400 dark:text-slate-500">
                      <span>par <strong className="text-slate-600 dark:text-slate-300">{acc.frozen_by}</strong></span>
                      <span>•</span>
                      <span>{new Date(acc.frozen_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="text-xs text-red-600 dark:text-red-400 mt-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg px-2 py-1 inline-block">
                      {acc.reason}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => handleUnfreeze(acc.user_id)}
                    disabled={actionLoading === acc.user_id}
                    icon={actionLoading === acc.user_id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                    className="ml-4 shrink-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-900/20"
                  >
                    {actionLoading === acc.user_id ? '...' : 'Dégeler'}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modale de gel */}
      {showFreezeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => !actionLoading && setShowFreezeModal(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Lock className="w-5 h-5 text-red-500" />
                Geler un compte
              </h2>
              <button onClick={() => setShowFreezeModal(false)} className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                  Utilisateur à geler
                </label>
                {freezeUserId ? (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                    <div className="flex items-center gap-2 min-w-0">
                      <User className="w-4 h-4 text-red-500 shrink-0" />
                      <span className="text-sm font-semibold text-slate-800 dark:text-white truncate">{freezeUserName}</span>
                    </div>
                    <button onClick={() => { setFreezeUserId(''); setFreezeUserName(''); }} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-800 transition-colors">
                      <X className="w-4 h-4 text-red-400" />
                    </button>
                  </div>
                ) : (
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => searchUsers(e.target.value)}
                      placeholder="Rechercher par email ou nom..."
                      className="w-full pl-9 pr-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                    />
                    {searching && <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 animate-spin text-slate-400" />}
                    {searchResults.length > 0 && (
                      <div className="absolute z-10 mt-1 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                        {searchResults.map((u) => (
                          <button
                            key={u.id}
                            onClick={() => selectUser(u)}
                            className="w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 flex items-center gap-3 border-b border-slate-100 dark:border-slate-700 last:border-0"
                          >
                            <User className="w-4 h-4 text-slate-400 shrink-0" />
                            <div className="min-w-0">
                              <p className="font-semibold text-slate-800 dark:text-white truncate">{u.name || 'Sans nom'}</p>
                              <p className="text-xs text-slate-400 truncate">{u.email} {u.phone_number ? `• ${u.phone_number}` : ''}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Motif du gel</label>
                <textarea
                  value={freezeReason}
                  onChange={(e) => setFreezeReason(e.target.value)}
                  rows={3}
                  placeholder="Raison du blocage..."
                  className="w-full px-4 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 block mb-1">Type de blocage</label>
                <div className="grid grid-cols-2 gap-2">
                  {freezeTypes.map(ft => (
                    <button
                      key={ft.value}
                      onClick={() => setFreezeType(ft.value)}
                      className={`p-2.5 rounded-xl border text-xs font-semibold transition-all ${
                        freezeType === ft.value
                          ? 'border-red-500 bg-red-50 dark:bg-red-900/20 dark:border-red-500 text-red-700 dark:text-red-300'
                          : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600'
                      }`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 text-xs text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>
                  Cette action bloquera l&apos;utilisateur en temps réel. Selon le type choisi,
                  certaines opérations seront immédiatement refusées.
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowFreezeModal(false)}>
                Cancel
              </Button>
              <Button
                fullWidth
                onClick={handleFreeze}
                disabled={actionLoading === 'freeze' || !freezeUserId.trim() || !freezeReason.trim()}
                icon={actionLoading === 'freeze' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                variant="danger"
              >
                {actionLoading === 'freeze' ? 'Gel en cours...' : 'Geler le compte'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
