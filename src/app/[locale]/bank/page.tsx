'use client';

import { useState } from 'react';
import { 
  Building, ArrowRight, ArrowLeft, Send, Loader2, 
  CheckCircle2, Globe, FileText, Shield, DollarSign,
  Wallet
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { ALL_COUNTRIES } from '@/data/countries';

const CURRENCY_OPTIONS: Record<string, string[]> = {
  XOF: ['XOF', 'USD', 'EUR'],
  XAF: ['XAF', 'USD', 'EUR'],
  GHS: ['GHS', 'USD', 'EUR'],
  KES: ['KES', 'USD', 'EUR'],
  NGN: ['NGN', 'USD', 'EUR'],
  UGX: ['UGX', 'USD', 'EUR'],
  RWF: ['RWF', 'USD', 'EUR'],
  TZS: ['TZS', 'USD', 'EUR'],
  CDF: ['CDF', 'USD', 'EUR'],
  ZAR: ['ZAR', 'USD', 'EUR'],
};

export default function BankPage() {
  const { user } = useAuth();
  const toast = useToast();
  const isGatewayAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [step, setStep] = useState<'choose' | 'country' | 'form' | 'done'>('choose');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('OUT');
  const [sourceType, setSourceType] = useState<'WALLET' | 'MOBILE_MONEY' | 'PAYPAL'>('WALLET');
  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');
  const [form, setForm] = useState({
    amount: '', iban: '', swift: '',
    accountNumber: '', bankName: '', accountHolder: '',
  });
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [bankDetails, setBankDetails] = useState<any>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [result, setResult] = useState<any>(null);

  const getFee = () => {
    if (direction === 'IN') return 0;
    if (sourceType === 'WALLET') return 0.02;
    if (sourceType === 'MOBILE_MONEY') return 0.03;
    if (sourceType === 'PAYPAL') return 0.05;
    return 0;
  };

  const fee = parseFloat(form.amount || '0') * getFee();
  const net = parseFloat(form.amount || '0') - fee;

  const handleVerifyBank = async () => {
    if (!form.iban) return;
    setVerifying(true);
    try {
      const data = await api.bank.verifyAccount({
        iban: form.iban,
        swift: form.swift,
        accountHolder: form.accountHolder,
        country: (selectedCountry?.iso2 || selectedCountry?.code || '').toUpperCase(),
      });
      setBankDetails(data);
      setVerifying(false);
      if (data.verified) {
        setShowConfirm(true);
      } else {
        toast.error(data.error || 'Compte bancaire invalide');
      }
    } catch (e: any) {
      toast.error(e?.message || 'Compte bancaire invalide');
      setVerifying(false);
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await api.bank.transfer({
        direction, sourceType,
        amount: parseFloat(form.amount), currency,
        iban: form.iban, swift: form.swift,
        accountNumber: form.accountNumber, bankName: form.bankName,
        accountHolder: form.accountHolder, country: selectedCountry?.country || '',
      });
      setResult(data);
      setStep('done');
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors du transfert');
    }
    setLoading(false);
  };

  const sources = [
    { id: 'WALLET', icon: Wallet, label: 'Portefeuille PayMaestro', fee: '2%' },
    ...(isGatewayAdmin ? [{ id: 'PAYPAL' as const, icon: DollarSign, label: 'PayPal', fee: '5%' }] : []),
  ];

  const currencyOptions = selectedCountry ? (CURRENCY_OPTIONS[selectedCountry.code] || [selectedCountry.code, 'USD', 'EUR']) : ['USD'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Building className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Virement Bancaire</h1>
      </div>

      {step === 'choose' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-3">
              <button onClick={() => setDirection('IN')}
                className={`flex-1 p-6 rounded-2xl border-2 text-center ${direction === 'IN' ? 'border-green-500 bg-green-50 dark:bg-green-950/30' : 'border-slate-200 dark:border-slate-600'}`}>
                <ArrowLeft className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="font-bold text-lg">Dépôt</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Banque → PayMaestro</p>
              </button>
              <button onClick={() => setDirection('OUT')}
                className={`flex-1 p-6 rounded-2xl border-2 text-center ${direction === 'OUT' ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-slate-600'}`}>
                <ArrowRight className="w-8 h-8 mx-auto mb-2 text-violet-600 dark:text-violet-400" />
                <p className="font-bold text-lg">Retrait</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">PayMaestro → Banque</p>
              </button>
            </div>

            {direction === 'OUT' && (
              <div className="space-y-3">
                <h3 className="font-semibold">Source des fonds</h3>
                {sources.map(s => (
                  <button key={s.id} onClick={() => setSourceType(s.id as any)}
                    className={`w-full p-4 rounded-xl border-2 flex items-center gap-3 ${sourceType === s.id ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-slate-600'}`}>
                    <s.icon className="w-5 h-5 text-violet-600" />
                    <div className="flex-1 text-left">
                      <p className="font-semibold">{s.label}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Frais : {s.fee}</p>
                    </div>
                    <Badge className={sourceType === s.id ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}>{s.fee}</Badge>
                  </button>
                ))}
              </div>
            )}

            <Button onClick={() => setStep('country')} fullWidth>
              Continuer <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {step === 'country' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">
              {direction === 'IN' ? 'Pays de votre banque' : 'Pays de la banque destinataire'}
            </h3>
            <div className="grid grid-cols-3 md:grid-cols-4 gap-2 max-h-[400px] overflow-y-auto">
              {ALL_COUNTRIES.map(c => (
                <button key={c.code + c.country} onClick={() => { setSelectedCountry(c); setCurrency(c.code); setStep('form'); }}
                  className="p-3 rounded-xl border-2 text-center hover:border-violet-300 transition-all dark:border-slate-700 dark:hover:border-violet-600">
                  <img src={`https://flagcdn.com/w40/${c.iso2}.png`} alt={c.country} className="w-8 h-6 rounded shadow-sm mx-auto object-cover" />
                  <p className="text-[9px] font-semibold mt-1 text-slate-700 dark:text-slate-300">{c.country}</p>
                </button>
              ))}
            </div>
            <Button variant="ghost" onClick={() => setStep('choose')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {step === 'form' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center gap-2">
              <img src={`https://flagcdn.com/w40/${selectedCountry?.iso2}.png`} alt={selectedCountry?.country} className="w-6 h-5 rounded shadow-sm" />
              <h3 className="font-bold text-lg">
                {direction === 'IN' ? 'Dépôt bancaire' : `Retrait ${sourceType === 'WALLET' ? 'Wallet' : 'PayPal'} → Banque`}
                <span className="text-sm font-normal text-slate-500 dark:text-slate-400 ml-2">({selectedCountry?.country})</span>
              </h3>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold">Montant</label>
                <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="1000" />
              </div>
              <div>
                <label className="text-xs font-semibold">Devise</label>
                <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                  {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold">Nom du titulaire du compte</label>
              <input type="text" value={form.accountHolder} onChange={(e) => setForm({...form, accountHolder: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="John Mohamed" />
            </div>
            <div>
              <label className="text-xs font-semibold">Numéro de compte / IBAN</label>
              <input type="text" value={form.iban} onChange={(e) => setForm({...form, iban: e.target.value})}
                className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                placeholder="Ex: 1234567890 ou FR76..." />
              {selectedCountry && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-1">Afrique : entrez votre numéro de compte bancaire (8 à 30 chiffres) + le code SWIFT/BIC</p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold">SWIFT / BIC</label>
                <input type="text" value={form.swift} onChange={(e) => setForm({...form, swift: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="BNPAFRPP" />
              </div>
              <div>
                <label className="text-xs font-semibold">Nom de la banque</label>
                <input type="text" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="Ecobank, UBA..." />
              </div>
            </div>

            {form.amount && (
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-1 text-sm">
                <div className="flex justify-between"><span>Montant</span><span className="font-bold">{form.amount} {currency}</span></div>
                <div className="flex justify-between"><span>Pays</span><span className="font-bold">{selectedCountry?.country}</span></div>
                {fee > 0 && <div className="flex justify-between text-red-600 dark:text-red-400"><span>Frais ({(getFee()*100).toFixed(0)}%)</span><span>-{fee.toFixed(2)} {currency}</span></div>}
                <div className="flex justify-between text-green-600 dark:text-green-400 border-t dark:border-slate-600 pt-1"><span className="font-bold">Net</span><span className="font-bold">{net.toFixed(2)} {currency}</span></div>
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setStep('country')}>Retour</Button>
              <Button fullWidth onClick={handleVerifyBank} disabled={loading || verifying || !form.iban} icon={<Shield className="w-4 h-4" />}>
                {verifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier le compte bancaire'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'done' && result && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Transfert initié !</h2>
            <p className="text-slate-600 dark:text-slate-300">Référence : {result.reference}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Délai estimé : 1-3 jours ouvrés</p>
            <Button onClick={() => { setStep('choose'); setResult(null); setForm({amount:'',iban:'',swift:'',accountNumber:'',bankName:'',accountHolder:''}); }}>
              Nouveau transfert
            </Button>
          </CardContent>
        </Card>
      )}

      {showConfirm && bankDetails?.details && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Confirmer le destinataire</h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mb-4">L'argent sera envoyé vers ce compte :</p>
            
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-left space-y-2 text-sm mb-4">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Titulaire :</span>
                <span className="font-bold text-slate-800 dark:text-white">{bankDetails.details.accountHolder}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Compte :</span>
                <span className="font-bold text-slate-800 dark:text-white font-mono">{bankDetails.details.iban}</span>
              </div>
              {bankDetails.details.swift && (
                <div className="flex justify-between">
                  <span className="text-slate-500 dark:text-slate-400">SWIFT :</span>
                  <span className="font-bold text-slate-800 dark:text-white font-mono">{bankDetails.details.swift}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Banque :</span>
                <span className="font-bold text-slate-800 dark:text-white">{bankDetails.details.bankName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Pays :</span>
                <span className="font-bold text-slate-800 dark:text-white">{selectedCountry?.country}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Délai estimé :</span>
                <span className="text-green-600 dark:text-green-400 font-semibold">{bankDetails.details.estimatedTime}</span>
              </div>
              {bankDetails.details.riskLevel === 'LOW' && (
                <div className="bg-green-50 dark:bg-green-950/30 text-green-700 dark:text-green-400 p-2 rounded-lg text-xs text-center">
                  ✅ Compte vérifié — Risque faible
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={() => setShowConfirm(false)}>
                Annuler
              </Button>
              <Button fullWidth onClick={() => { setShowConfirm(false); handleSubmit(); }}>
                Confirmer et envoyer
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
