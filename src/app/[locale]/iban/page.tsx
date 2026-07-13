'use client';

import { useState, useEffect } from 'react';
import { Building, Copy, CheckCircle2, Loader2, Globe, Shield, Trash2, ToggleLeft, ToggleRight, Plus, X } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastContainer, Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

interface IbanRecord {
  id: number;
  iban: string;
  country: string;
  status: 'ACTIVE' | 'INACTIVE' | 'DELETED';
  is_first: boolean;
  created_at: string;
}

const SEPA_COUNTRIES = [
  { code: 'FR', label: 'France' },
  { code: 'DE', label: 'Allemagne' },
  { code: 'BE', label: 'Belgique' },
  { code: 'ES', label: 'Espagne' },
  { code: 'IT', label: 'Italie' },
  { code: 'NL', label: 'Pays-Bas' },
  { code: 'PT', label: 'Portugal' },
  { code: 'IE', label: 'Irlande' },
  { code: 'AT', label: 'Autriche' },
  { code: 'PL', label: 'Pologne' },
  { code: 'GB', label: 'Royaume-Uni' },
  { code: 'CH', label: 'Suisse' },
  { code: 'LU', label: 'Luxembourg' },
  { code: 'MC', label: 'Monaco' },
];

export default function IBANPage() {
  const { user } = useAuth();
  const [ibans, setIbans] = useState<IbanRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('FR');
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedIban, setSelectedIban] = useState<IbanRecord | null>(null);

  useEffect(() => { loadIBANs(); }, []);

  const loadIBANs = async () => {
    try {
      const data = await api.stripe.getIBAN();
      setIbans(data?.ibans || []);
    } catch {}
    setLoading(false);
  };

  const handleCreateIBAN = async () => {
    setCreating(true);
    try {
      const alreadyHasIBAN = ibans.length > 0;
      if (!alreadyHasIBAN) {
        await api.stripe.createAccount();
      }
      setShowConfirm(true);
    } catch (e: any) {
      setToast({ message: e.message || 'Erreur lors de la création du compte', type: 'error' });
    }
    setCreating(false);
  };

  const handleConfirmCreateIBAN = async () => {
    setCreating(true);
    try {
      await api.stripe.createIBAN(selectedCountry);
      await loadIBANs();
      setShowConfirm(false);
      setToast({ message: 'Nouvel IBAN créé avec succès !', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message || 'Erreur lors de la création de l\'IBAN', type: 'error' });
    }
    setCreating(false);
  };

  const handleCopy = (id: number, iban: string) => {
    navigator.clipboard.writeText(iban);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDeactivate = async (id: number) => {
    try {
      await api.stripe.deactivateIBAN(id);
      setIbans(prev => prev.map(i => i.id === id ? { ...i, status: 'INACTIVE' } : i));
      setToast({ message: 'IBAN désactivé', type: 'info' });
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleActivate = async (id: number) => {
    try {
      await api.stripe.activateIBAN(id);
      setIbans(prev => prev.map(i => i.id === id ? { ...i, status: 'ACTIVE' } : i));
      setToast({ message: 'IBAN activé', type: 'success' });
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Supprimer cet IBAN ? Cette action est irréversible.')) return;
    try {
      await api.stripe.deleteIBAN(id);
      setIbans(prev => prev.filter(i => i.id !== id));
      setToast({ message: 'IBAN supprimé', type: 'info' });
    } catch (e: any) {
      setToast({ message: e.message, type: 'error' });
    }
  };

  const formatIban = (iban: string) => iban.replace(/(.{4})/g, '$1 ').trim();

  const handleViewDetails = (record: IbanRecord) => {
    setSelectedIban(record);
    setShowDetailsModal(true);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building className="w-8 h-8 text-violet-600" />
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mes IBANs</h1>
        </div>
        <Button onClick={handleCreateIBAN} disabled={creating}>
          {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4" /> Nouvel IBAN</>}
        </Button>
      </div>

      {ibans.length === 0 ? (
        <Card className="border-2 border-dashed border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20">
          <CardContent className="p-8 text-center space-y-4">
            <Globe className="w-16 h-16 text-violet-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Obtenez votre IBAN européen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Recevez des virements SEPA de vos clients européens directement sur votre compte PayMaestro.
              L&apos;argent sera automatiquement converti et crédité sur votre portefeuille.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 text-left max-w-xs mx-auto">
              <li>✅ Virements SEPA gratuits</li>
              <li>✅ IBAN personnel sécurisé</li>
              <li>✅ Conversion automatique en USD</li>
              <li>✅ Premier IBAN gratuit</li>
            </ul>
            <Button onClick={handleCreateIBAN} disabled={creating} size="lg">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Générer mon premier IBAN'}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {ibans.map((record) => {
            const isActive = record.status === 'ACTIVE';
            return (
              <Card key={record.id} className={`border-2 cursor-pointer transition-all hover:shadow-lg ${isActive ? 'border-green-300 dark:border-green-700' : 'border-slate-200 dark:border-slate-700 opacity-70'}`} onClick={() => handleViewDetails(record)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${isActive ? 'bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300' : 'bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400'}`}>
                          {isActive ? 'ACTIF' : 'INACTIF'}
                        </span>
                        {record.is_first && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">
                            GRATUIT
                          </span>
                        )}
                        <span className="text-xs text-slate-400 dark:text-slate-500">{record.country}</span>
                      </div>
                      <p className="text-xl font-mono font-bold text-slate-800 dark:text-white tracking-wider">
                        {formatIban(record.iban)}
                      </p>
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Créé le {new Date(record.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                        {!record.is_first && ` · 5$`}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => handleCopy(record.id, record.iban)}
                        className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                        title="Copier l'IBAN"
                      >
                        {copiedId === record.id ? <CheckCircle2 className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
                      </button>
                      {isActive ? (
                        <button
                          onClick={() => handleDeactivate(record.id)}
                          className="p-2 rounded-lg hover:bg-amber-50 dark:hover:bg-amber-900/20 text-slate-400 hover:text-amber-600 transition-colors"
                          title="Désactiver"
                        >
                          <ToggleRight className="w-5 h-5" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(record.id)}
                          className="p-2 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20 text-slate-400 hover:text-green-600 transition-colors"
                          title="Activer"
                        >
                          <ToggleLeft className="w-5 h-5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(record.id)}
                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white text-center">Nouvel IBAN</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 text-center mb-4">
              {ibans.length === 0
                ? 'Gratuit — Premier IBAN'
                : '5$ seront déduits de votre solde'
              }
            </p>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Pays de l&apos;IBAN :</span>
                <select
                  value={selectedCountry}
                  onChange={e => setSelectedCountry(e.target.value)}
                  className="font-bold text-slate-800 dark:text-white bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm"
                >
                  {SEPA_COUNTRIES.map(c => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-slate-500 dark:text-slate-400">Frais</span>
                <span className={`font-bold ${ibans.length === 0 ? 'text-green-600' : 'text-amber-600'}`}>
                  {ibans.length === 0 ? 'GRATUIT' : '5$'}
                </span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-200 mb-4">
              ⚠️ Assurez-vous que ces informations sont correctes.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowConfirm(false)}>Cancel</Button>
              <Button fullWidth onClick={handleConfirmCreateIBAN} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirm and create'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODALE DÉTAILS IBAN */}
      {showDetailsModal && selectedIban && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
            <button
              onClick={() => { setShowDetailsModal(false); setSelectedIban(null); }}
              className="absolute top-4 right-4 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4">
              <Building className="w-12 h-12 text-blue-500 mx-auto mb-3" />
              <h3 className="font-bold text-lg text-slate-900 dark:text-white">Détails du virement</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400">L'argent sera reçu sur ce compte :</p>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Titulaire :</span>
                <span className="font-bold text-slate-800 dark:text-white">{user?.name || 'Votre nom'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Email :</span>
                <span className="font-bold text-slate-800 dark:text-white">{user?.email || 'Votre email'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">IBAN :</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white text-xs">{formatIban(selectedIban.iban)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pays :</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedIban.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Frais :</span>
                <span className="font-bold text-slate-800 dark:text-white">2% de conversion</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Délai :</span>
                <span className="text-yellow-600 dark:text-yellow-400 font-semibold">1-5 jours ouvrés</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Devises :</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">Multi-devises (EUR, USD, GBP...)</span>
              </div>
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-xl p-3 text-xs text-green-800 dark:text-green-400 mb-4">
              ✅ Crédité automatiquement dès réception
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-sm text-blue-800 dark:text-blue-300 space-y-2 mb-4">
              <p className="font-semibold">📋 Instructions :</p>
              <p>1. Copiez votre IBAN ci-dessus</p>
              <p>2. Faites un virement SEPA ou SWIFT depuis votre banque vers cet IBAN</p>
              <p>3. Le montant sera crédité automatiquement sur votre wallet</p>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-400 space-y-1 mb-4">
              <p><strong>⚠️ Délais :</strong></p>
              <p>• Virement SEPA (Europe) : 1-2 jours ouvrés</p>
              <p>• Virement SWIFT (International) : 3-5 jours ouvrés</p>
              <p><strong>💰 Frais :</strong> 2% de conversion</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => { setShowDetailsModal(false); setSelectedIban(null); }}>
                Fermer
              </Button>
              <Button fullWidth onClick={() => { handleCopy(selectedIban.id, selectedIban.iban); }}>
                <Copy className="w-4 h-4 mr-2" />
                {copiedId === selectedIban.id ? 'Copié !' : "Copier l'IBAN"}
              </Button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <ToastContainer>
          <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />
        </ToastContainer>
      )}
    </div>
  );
}
