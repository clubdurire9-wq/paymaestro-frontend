'use client';

import { useState, useEffect } from 'react';
import { Building, Copy, CheckCircle2, Loader2, Globe, ArrowRight, Shield } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ToastContainer, Toast } from '@/components/ui/toast';
import { useAuth } from '@/hooks/useAuth';
import { api } from '@/lib/api';

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
  const [iban, setIban] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState('FR');
  const [stripeDetails, setStripeDetails] = useState<any>(null);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);

  useEffect(() => { loadIBAN(); }, []);

  const loadIBAN = async () => {
    try {
      const data = await api.stripe.getIBAN();
      setIban(data?.iban);
    } catch {}
    setLoading(false);
  };

  const handleCreateIBAN = async () => {
    setCreating(true);
    try {
      await api.stripe.createAccount();
      setStripeDetails({
        email: user?.email,
        name: user?.name,
        country: selectedCountry,
        estimatedTime: 'Immédiat',
        fees: 'Gratuit (réception) / 2% (conversion)',
      });
      setShowConfirm(true);
    } catch (e: any) {
      setToast({ message: e.message || 'Erreur lors de la création du compte', type: 'error' });
    }
    setCreating(false);
  };

  const handleConfirmCreateIBAN = async () => {
    setCreating(true);
    try {
      const d = await api.stripe.createIBAN(selectedCountry);
      setIban(d.iban);
      setShowConfirm(false);
    } catch (e: any) {
      setToast({ message: e.message || 'Erreur lors de la création de l\'IBAN', type: 'error' });
    }
    setCreating(false);
  };

  const handleCopy = () => {
    if (iban) {
      navigator.clipboard.writeText(iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Building className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Votre IBAN Européen</h1>
      </div>

      {!iban ? (
        <Card className="border-2 border-dashed border-violet-300 dark:border-violet-600 bg-violet-50 dark:bg-violet-900/20">
          <CardContent className="p-8 text-center space-y-4">
            <Globe className="w-16 h-16 text-violet-400 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Obtenez votre IBAN européen</h2>
            <p className="text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto">
              Recevez des virements SEPA de vos clients européens directement sur votre compte PayMaestro.
              L'argent sera automatiquement converti et crédité sur votre portefeuille.
            </p>
            <ul className="text-xs text-slate-500 dark:text-slate-400 space-y-1 text-left max-w-xs mx-auto">
              <li>✅ Virements SEPA gratuits</li>
              <li>✅ IBAN personnel sécurisé</li>
              <li>✅ Conversion automatique en USD</li>
              <li>✅ Retrait vers Mobile Money possible</li>
            </ul>
            <Button onClick={handleCreateIBAN} disabled={creating} size="lg">
              {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Générer mon IBAN <ArrowRight className="w-4 h-4 ml-2" /></>}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-300 dark:border-green-600">
          <CardContent className="p-8 text-center space-y-6">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Votre IBAN est prêt !</h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Partagez cet IBAN pour recevoir des paiements</p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 border-2 border-slate-200 dark:border-slate-700">
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase font-semibold mb-2">Votre IBAN</p>
              <p className="text-2xl font-mono font-bold text-slate-800 dark:text-white tracking-wider break-all">
                {iban?.replace(/(.{4})/g, '$1 ').trim()}
              </p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleCopy} icon={copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                {copied ? 'Copié !' : 'Copier l\'IBAN'}
              </Button>
            </div>

            <div className="bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left text-sm text-blue-800 dark:text-blue-200">
              <p className="font-semibold mb-1">💡 Comment ça marche ?</p>
              <p>1. Partagez cet IBAN à votre client</p>
              <p>2. Le client fait un virement SEPA</p>
              <p>3. L'argent arrive sur votre portefeuille PayMaestro en USD</p>
              <p>4. Vous pouvez le retirer vers Mobile Money quand vous voulez</p>
            </div>
          </CardContent>
        </Card>
      )}

      {showConfirm && stripeDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <Shield className="w-12 h-12 text-blue-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">Confirmer la création de l'IBAN</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              Vérifiez les informations avant de générer votre IBAN européen :
            </p>

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-left space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Compte :</span>
                <span className="font-bold text-slate-800 dark:text-white">{stripeDetails.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Titulaire :</span>
                <span className="font-bold text-slate-800 dark:text-white">{stripeDetails.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 dark:text-slate-400">Pays de l'IBAN :</span>
                <select
                  value={selectedCountry}
                  onChange={(e) => {
                    setSelectedCountry(e.target.value);
                    setStripeDetails({ ...stripeDetails, country: e.target.value });
                  }}
                  className="font-bold text-slate-800 dark:text-white bg-transparent border border-slate-300 dark:border-slate-600 rounded-lg px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {SEPA_COUNTRIES.map((c) => (
                    <option key={c.code} value={c.code}>{c.label}</option>
                  ))}
                </select>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Frais de réception :</span>
                <span className="text-green-600 dark:text-green-400 font-bold">{stripeDetails.fees}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Disponibilité :</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">{stripeDetails.estimatedTime}</span>
              </div>
            </div>

            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-xl p-3 text-xs text-yellow-800 dark:text-yellow-200 mb-4">
              ⚠️ Assurez-vous que ces informations sont correctes.
              L'IBAN sera lié à votre compte PayMaestro de façon permanente.
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowConfirm(false)}>
                Annuler
              </Button>
              <Button fullWidth onClick={handleConfirmCreateIBAN} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Confirmer et créer'}
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