'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Send, CheckCircle2, 
  Loader2, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordModal } from '@/components/wallet/PasswordModal';

export default function TransferPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [step, setStep] = useState<'source' | 'lookup' | 'pm-amount' | 'done'>('source');
  const [source, setSource] = useState<'pm'>('pm');
  const [balance, setBalance] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  
  // États pour PayMaestro → PayMaestro
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);

  // Pré-sélection de la source si le paramètre est présent
  useEffect(() => {
    if (sourceParam === 'pm') {
      setSource('pm');
      setStep('lookup');
    }
  }, [sourceParam]);

  useEffect(() => {
    if (source === 'wallet') {
      fetch(`${API_URL}/wallet/balance`, { headers })
        .then(r => r.json())
        .then(d => setBalance(d.data));
    }
  }, [source]);

  const handleLookupRecipient = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/wallet/lookup-recipient`, {
      method: 'POST', headers,
      body: JSON.stringify({
        phoneNumber: `${selectedCountry?.countryCode}${targetPhone}`,
        currencyCode: selectedCountry?.code,
        operator: selectedOperator,
      }),
    });
    const data = await res.json();
    setLoading(false);
    if (data.success) {
      setRecipientName(data.name);
      setStep('confirm');
    } else {
      setError('Numéro introuvable');
    }
  };

  const handleLookupUser = async () => {
    setLookingUp(true);
    const res = await fetch(`${API_URL}/wallet/lookup-user`, {
      method: 'POST', headers,
      body: JSON.stringify({ email: lookupEmail }),
    });
    const d = await res.json();
    setLookupResult(d);
    setLookingUp(false);
  };

  const handlePMTransfer = async () => {
    if (!lookupResult || !amount) return;
    setShowPassword(true);
  };

  const handlePMTransferWithPassword = async (password: string) => {
    setLoading(true);
    setError('');
    try {
      const stepUpRes = await fetch(`${API_URL}/auth/step-up`, {
        method: 'POST', headers,
        body: JSON.stringify({ password }),
      });
      const stepUpData = await stepUpRes.json();
      if (!stepUpData.success) throw new Error(stepUpData.error || 'Mot de passe incorrect');

      const res = await fetch(`${API_URL}/wallet/pm-to-pm`, {
        method: 'POST', headers,
        body: JSON.stringify({ recipientEmail: lookupEmail, amount: parseFloat(amount), stepUpToken: stepUpData.stepUpToken }),
      });
      const d = await res.json();
      if (d.success) {
        setResult(d.data);
        setShowPassword(false);
        setStep('done');
      } else {
        setShowPassword(false);
        setError(d.error || d.message || 'Erreur lors du transfert. Veuillez réessayer.');
      }
    } catch {
      setError('Erreur de connexion. Veuillez réessayer.');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Send className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900">Transfert depuis le Wallet</h1>
      </div>

      {/* ÉTAPE 1 : Source — PM to PM uniquement */}
      {step === 'source' && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
              <Users className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">Transfert PayMaestro → PayMaestro</h3>
            <p className="text-sm text-green-600 dark:text-green-400 font-semibold">0% de frais — Gratuit !</p>
            <Button onClick={() => { setSource('pm'); setStep('lookup'); }} className="w-full">
              Commencer un transfert
            </Button>
            <Button variant="ghost" onClick={() => router.push(`/${locale}/wallet`)}>← Retour au portefeuille</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE LOOKUP (PayMaestro → PayMaestro) */}
      {step === 'lookup' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">🔍 Rechercher un utilisateur PayMaestro</h3>
            <p className="text-sm text-slate-500">Entrez l'email du destinataire pour vérifier son compte.</p>
            
            <div className="flex gap-3">
              <input
                type="email"
                value={lookupEmail}
                onChange={(e) => setLookupEmail(e.target.value)}
                placeholder="destinataire@email.com"
                className="flex-1 px-4 py-3 border rounded-xl text-sm"
              />
              <Button onClick={handleLookupUser} disabled={lookingUp || !lookupEmail}>
                {lookingUp ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Rechercher'}
              </Button>
            </div>

            {lookupResult?.found && (
              <div className="space-y-4">
                {/* Profil complet du destinataire */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-300 rounded-2xl p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-14 h-14 bg-green-500 rounded-full flex items-center justify-center text-white text-xl font-bold">
                      {lookupResult.user.firstName?.charAt(0) || '?'}{lookupResult.user.lastName?.charAt(0) || '?'}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">{lookupResult.user.fullName}</h3>
                      <p className="text-sm text-green-700">{lookupResult.user.email}</p>
                      {lookupResult.user.isVerified && (
                        <Badge className="mt-1 bg-green-100 text-green-700">✅ Profil vérifié</Badge>
                      )}
                    </div>
                  </div>

                  {/* Grille d'informations */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Nom</p>
                      <p className="font-bold text-slate-800">{lookupResult.user.lastName}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Prénom</p>
                      <p className="font-bold text-slate-800">{lookupResult.user.firstName}</p>
                    </div>
                    {lookupResult.user.middleName && lookupResult.user.middleName !== 'Non renseigné' && (
                      <div className="bg-white rounded-xl p-3">
                        <p className="text-xs text-slate-400 uppercase font-semibold">Post-nom</p>
                        <p className="font-bold text-slate-800">{lookupResult.user.middleName}</p>
                      </div>
                    )}
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Date de naissance</p>
                      <p className="font-bold text-slate-800">
                        {lookupResult.user.dateOfBirth !== 'Non renseignée' 
                          ? new Date(lookupResult.user.dateOfBirth).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' })
                          : 'Non renseignée'}
                      </p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Pays</p>
                      <p className="font-bold text-slate-800">{lookupResult.user.country}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Ville</p>
                      <p className="font-bold text-slate-800">{lookupResult.user.city}</p>
                    </div>
                    <div className="bg-white rounded-xl p-3 md:col-span-2">
                      <p className="text-xs text-slate-400 uppercase font-semibold">Adresse</p>
                      <p className="font-bold text-slate-800">{lookupResult.user.address}</p>
                    </div>
                  </div>

                  {/* Statut du compte */}
                  <div className="bg-white rounded-xl p-3 mb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Profil légal</p>
                        <p className={`font-bold ${lookupResult.user.hasLegalProfile ? 'text-green-600' : 'text-red-600'}`}>
                          {lookupResult.user.profileCompleteness === 'COMPLET' ? '✅ Complété' : '❌ Incomplet'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">KYC</p>
                        <p className={`font-bold ${lookupResult.user.isKYCApproved ? 'text-green-600' : 'text-yellow-600'}`}>
                          {lookupResult.user.isKYCApproved ? '✅ Vérifié' : '⚠️ Non vérifié'}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400 uppercase font-semibold">Membre depuis</p>
                        <p className="font-bold text-slate-800">
                          {new Date(lookupResult.user.memberSince).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Avertissements */}
                  {lookupResult.warnings?.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 space-y-1 mb-4">
                      {lookupResult.warnings.map((w: string, i: number) => (
                        <p key={i} className="text-xs text-yellow-800">{w}</p>
                      ))}
                    </div>
                  )}

                  {/* Transfert gratuit */}
                  <div className="bg-green-100 rounded-xl p-4 text-center">
                    <p className="text-3xl font-extrabold text-green-700">🎉 0% DE FRAIS</p>
                    <p className="text-sm text-green-600">Transfert interne PayMaestro → PayMaestro gratuit !</p>
                  </div>
                </div>

                {/* Boutons d'action */}
                <div className="flex gap-3">
                  <Button variant="outline" fullWidth onClick={() => { setLookupResult(null); setLookupEmail(''); }}>
                    ❌ Annuler — Ce n'est pas la bonne personne
                  </Button>
                  <Button fullWidth onClick={() => { setStep('pm-amount'); setError(''); }} className="bg-green-600 hover:bg-green-700">
                    ✅ C'est bien la bonne personne — Continuer
                  </Button>
                </div>
              </div>
            )}

            {lookupResult && !lookupResult.found && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-red-700">{lookupResult.error}</p>
              </div>
            )}
            
            <Button variant="ghost" onClick={() => router.push(`/${locale}/wallet`)}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE PM-AMOUNT (Montant PayMaestro → PayMaestro) */}
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold text-lg">💸 Montant à envoyer</h3>
            
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
              <p className="text-sm text-green-700">Destinataire : <strong>{lookupResult?.user?.fullName || lookupResult?.name}</strong></p>
              <p className="text-3xl font-extrabold text-green-600 mt-2">0% DE FRAIS</p>
            </div>

            <div>
              <label className="text-sm font-semibold">Montant (USD)</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-lg font-bold mt-1" placeholder="100" />
            </div>

            {amount && (
              <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Montant envoyé :</span>
                  <span className="font-bold">${parseFloat(amount).toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Frais :</span>
                  <span className="font-bold">GRATUIT 🎉</span>
                </div>
                <div className="flex justify-between border-t pt-1">
                  <span className="font-bold">Le destinataire reçoit :</span>
                  <span className="font-bold text-green-600">${parseFloat(amount).toFixed(2)}</span>
                </div>
              </div>
            )}

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <span className="text-red-500 shrink-0 mt-0.5">⚠️</span>
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <Button onClick={handlePMTransfer} fullWidth disabled={!amount || loading} loading={loading}>
              <Send className="w-4 h-4 mr-2" />
              {loading ? 'Envoi en cours...' : `Envoyer ${amount || '0'} à ${lookupResult?.user?.fullName || lookupResult?.name}`}
            </Button>
            
            <Button variant="ghost" onClick={() => router.push(`/${locale}/wallet`)}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 6 : Terminé */}
      {step === 'done' && result && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Transfert effectué !</h3>
            <p className="text-slate-600">${parseFloat(amount || '0').toFixed(2)} envoyés à {lookupResult?.user?.fullName || lookupResult?.name}</p>
            <p className="text-xs text-slate-400">Email : {lookupEmail}</p>
            <Button onClick={() => router.push(`/${locale}/wallet`)}>Retour au portefeuille</Button>
          </CardContent>
        </Card>
      )}

      {/* Modal mot de passe */}
      {showPassword && (
        <PasswordModal
          onVerify={handlePMTransferWithPassword}
          onClose={() => setShowPassword(false)}
        />
      )}
    </div>
  );
}