'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { 
  Send, Search, CheckCircle2, 
  Loader2, Wallet, Building, Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PasswordModal } from '@/components/wallet/PasswordModal';
import { ALL_COUNTRIES } from '@/data/countries';

const DOUBLE_ACCOUNT_COUNTRIES = ['CD', 'ZW', 'SS', 'LR', 'SL', 'GN', 'SO', 'BI'];

export default function TransferPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const sourceParam = searchParams.get('source');
  
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` };

  const [step, setStep] = useState<'source' | 'country' | 'operator' | 'amount' | 'confirm' | 'done' | 'lookup' | 'pm-amount'>('source');
  const [source, setSource] = useState<'wallet' | 'mobile' | 'stripe' | 'pm'>('wallet');
  const [balance, setBalance] = useState<any>(null);
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [selectedOperator, setSelectedOperator] = useState('');
  const [accountType, setAccountType] = useState<'USD' | 'LOCAL'>('LOCAL');
  const [amount, setAmount] = useState('');
  const [targetPhone, setTargetPhone] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);
  
  // États pour PayMaestro → PayMaestro
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupResult, setLookupResult] = useState<any>(null);
  const [lookingUp, setLookingUp] = useState(false);

  const hasDoubleAccount = selectedCountry && DOUBLE_ACCOUNT_COUNTRIES.includes(selectedCountry.countryCode);

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

  const handleTransfer = async (password: string) => {
    const endpoint = source === 'wallet'
      ? `${API_URL}/wallet/transfer-to-mobile`
      : `${API_URL}/wallet/stripe-to-mobile`;

    const body = {
      amount: parseFloat(amount),
      currencyCode: selectedCountry?.code,
      targetPhone: `${selectedCountry?.countryCode}${targetPhone}`,
      targetOperator: selectedOperator,
      targetCountry: selectedCountry?.country,
      accountType,
      exchangeRate: selectedCountry?.rate || 600,
      ...(source === 'wallet' ? { password } : {}),
    };

    const res = await fetch(endpoint, { 
      method: 'POST', 
      headers, 
      body: JSON.stringify(body) 
    });
    const data = await res.json();
    
    if (data.success) {
      setResult(data.data);
      setStep('done');
      setShowPassword(false);
      return true;
    } else {
      setError(data.message || 'Erreur lors du transfert');
      return false;
    }
  };

  const handlePMTransfer = async () => {
    setLoading(true);
    const res = await fetch(`${API_URL}/wallet/pm-to-pm`, {
      method: 'POST', headers,
      body: JSON.stringify({ recipientEmail: lookupEmail, amount: parseFloat(amount) }),
    });
    const d = await res.json();
    if (d.success) {
      setResult(d.data);
      setStep('done');
    }
    setLoading(false);
  };

  const operators = selectedCountry?.operators || [];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Send className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900">Transfert depuis le Wallet</h1>
      </div>

      {/* ÉTAPE 1 : Source */}
      {step === 'source' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">D'où vient l'argent ?</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button onClick={() => { setSource('wallet'); setStep('country'); }}
                className="p-6 rounded-2xl border-2 border-violet-600 bg-violet-50 text-center hover:shadow-lg transition-all">
                <Wallet className="w-8 h-8 text-violet-600 mx-auto mb-2" />
                <p className="font-semibold">Mon Portefeuille</p>
                <p className="text-xs text-slate-500">Solde : ${balance?.USD?.toFixed(2) || '0'}</p>
              </button>

              <button onClick={() => { setSource('stripe'); setStep('country'); }}
                className="p-6 rounded-2xl border-2 border-blue-200 hover:border-blue-400 text-center hover:shadow-lg transition-all">
                <Building className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="font-semibold">IBAN Stripe</p>
                <p className="text-xs text-slate-500">Virement SEPA reçu</p>
              </button>
              <button onClick={() => { setSource('pm'); setStep('lookup'); }}
                className="p-6 rounded-2xl border-2 border-green-200 hover:border-green-400 text-center hover:shadow-lg transition-all">
                <Users className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="font-semibold">PayMaestro → PayMaestro</p>
                <p className="text-xs text-green-600 font-bold mt-1">GRATUIT - 0% frais !</p>
              </button>
            </div>
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
                  <Button fullWidth onClick={() => setStep('pm-amount')} className="bg-green-600 hover:bg-green-700">
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
            
            <Button variant="ghost" onClick={() => setStep('source')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE PM-AMOUNT (Montant PayMaestro → PayMaestro) */}
      {step === 'pm-amount' && (
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

            <Button onClick={handlePMTransfer} fullWidth disabled={!amount}>
              <Send className="w-4 h-4 mr-2" />
              Envoyer ${amount || '0'} à {lookupResult?.user?.fullName || lookupResult?.name}
            </Button>
            
            <Button variant="ghost" onClick={() => setStep('lookup')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 2 : Pays destinataire */}
      {step === 'country' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Pays du destinataire</h3>
            <div className="grid grid-cols-3 md:grid-cols-5 gap-2 max-h-[400px] overflow-y-auto">
              {ALL_COUNTRIES.map(c => (
                <button key={c.code + c.country} onClick={() => { setSelectedCountry(c); setStep('operator'); setSelectedOperator(''); }}
                  className="p-3 rounded-xl border-2 text-center hover:border-violet-300 transition-all">
                  <span className="text-2xl">{c.flag}</span>
                  <p className="text-[9px] font-semibold mt-1">{c.country}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('source')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 3 : Opérateur */}
      {step === 'operator' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Opérateur - {selectedCountry?.country}</h3>
            <div className="grid grid-cols-2 gap-3">
              {operators.map((op: string) => (
                <button key={op} onClick={() => { setSelectedOperator(op); setStep('amount'); }}
                  className={`p-4 rounded-xl border-2 text-center font-semibold transition-all ${
                    selectedOperator === op ? 'border-violet-600 bg-violet-50' : 'border-slate-200 hover:border-violet-300'
                  }`}>
                  {op}
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('country')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 4 : Montant + Type compte + Numéro */}
      {step === 'amount' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-semibold">Détails du transfert - {selectedOperator}</h3>
            
            {/* Double compte */}
            {hasDoubleAccount && (
              <div>
                <label className="text-sm font-semibold">Type de compte destinataire</label>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setAccountType('LOCAL')}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold ${accountType === 'LOCAL' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}>
                    Compte {selectedCountry?.code} (Local)
                  </button>
                  <button onClick={() => setAccountType('USD')}
                    className={`flex-1 p-3 rounded-xl border-2 text-sm font-semibold ${accountType === 'USD' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}>
                    Compte USD ($)
                  </button>
                </div>
              </div>
            )}

            {/* Montant */}
            <div>
              <label className="text-sm font-semibold">Montant ({accountType === 'USD' ? 'USD' : selectedCountry?.code})</label>
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                className="w-full px-4 py-3 border rounded-xl text-lg font-bold mt-1" placeholder="100" />
            </div>

            {/* Numéro destinataire */}
            <div>
              <label className="text-sm font-semibold">Numéro du destinataire</label>
              <div className="flex gap-2 mt-1">
                <span className="px-3 py-3 bg-slate-100 rounded-xl font-semibold text-sm">{selectedCountry?.countryCode}</span>
                <input type="tel" value={targetPhone} onChange={(e) => setTargetPhone(e.target.value)}
                  className="flex-1 px-4 py-3 border rounded-xl text-sm" placeholder="0123456789" />
              </div>
            </div>

            {/* Résumé */}
            {amount && (
              <div className="bg-slate-50 p-4 rounded-xl text-sm space-y-1">
                <p>De : {source === 'wallet' ? 'Portefeuille' : 'IBAN Stripe (SEPA)'}</p>
                <p>Vers : {selectedCountry?.flag} {selectedCountry?.country} - {selectedOperator}</p>
                <p>Compte : {accountType === 'USD' ? 'USD ($)' : `${selectedCountry?.code} (Local)`}</p>
              </div>
            )}

            <Button onClick={handleLookupRecipient} fullWidth disabled={!amount || !targetPhone} icon={<Search />}>
              Vérifier le destinataire
            </Button>
            <Button variant="ghost" onClick={() => setStep('operator')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {/* ÉTAPE 5 : Confirmation */}
      {step === 'confirm' && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-xl font-bold">Confirmer le transfert</h3>
            <div className="bg-slate-50 p-4 rounded-xl text-left space-y-2">
              <p><strong>Destinataire :</strong> {recipientName}</p>
              <p><strong>Téléphone :</strong> {selectedCountry?.countryCode} {targetPhone}</p>
              <p><strong>Opérateur :</strong> {selectedOperator}</p>
              <p><strong>Montant :</strong> {amount} {accountType === 'USD' ? 'USD' : selectedCountry?.code}</p>
              <p><strong>Frais :</strong> 3%</p>
              {source === 'stripe' && (
                <p><strong>Source :</strong> IBAN Stripe (Virement SEPA)</p>
              )}
            </div>
            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep('amount')}>Annuler</Button>
              <Button fullWidth onClick={() => setShowPassword(true)} icon={<Send />}>
                Confirmer et envoyer
              </Button>
            </div>
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
            <p className="text-slate-600">{result.amountLocal?.toLocaleString('fr-FR')} {selectedCountry?.code} envoyés à {recipientName}</p>
            <p className="text-xs text-slate-400">Réf : {result.reference}</p>
            <Button onClick={() => router.push(`/${locale}/wallet`)}>Retour au portefeuille</Button>
          </CardContent>
        </Card>
      )}

      {/* Modal mot de passe */}
      {showPassword && (
        <PasswordModal
          onVerify={handleTransfer}
          onClose={() => setShowPassword(false)}
        />
      )}
    </div>
  );
}