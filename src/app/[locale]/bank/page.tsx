'use client';

import { useState, useEffect } from 'react';
import { 
  Landmark, ArrowRight, ArrowLeft, Send, Loader2, 
  CheckCircle2, Globe, Shield, Copy, Wallet, Building, Banknote
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
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
  const isGatewayAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [step, setStep] = useState<'choose' | 'country' | 'form' | 'done'>('choose');
  const [direction, setDirection] = useState<'IN' | 'OUT'>('IN');
  const [iban, setIban] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const [selectedCountry, setSelectedCountry] = useState<any>(null);
  const [currency, setCurrency] = useState('USD');
  const [form, setForm] = useState({
    amount: '',
    accountNumber: '',
    bankName: '',
    accountHolder: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);

  useEffect(() => {
    if (direction === 'IN') {
      api.stripe.getIBAN().then(d => setIban(d?.activeIban || d?.iban || null)).catch(() => {});
    }
  }, [direction]);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const data = await api.bank.transfer({
        direction,
        sourceType: 'WALLET',
        amount: parseFloat(form.amount),
        currency,
        accountNumber: form.accountNumber,
        bankName: form.bankName,
        accountHolder: form.accountHolder,
        country: selectedCountry?.country || '',
      });
      setResult(data);
      setStep('done');
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if (iban) {
      navigator.clipboard.writeText(iban);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const currencyOptions = selectedCountry ? (CURRENCY_OPTIONS[selectedCountry.code] || [selectedCountry.code, 'USD', 'EUR']) : ['USD'];

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Landmark className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Virement Bancaire</h1>
      </div>

      {step === 'choose' && (
        <Card>
          <CardContent className="p-6 space-y-6">
            <div className="flex gap-3">
              <button onClick={() => { setDirection('IN'); setStep('country'); }}
                className="flex-1 p-6 rounded-2xl border-2 text-center border-green-500 bg-green-50 dark:bg-green-950/30">
                <ArrowLeft className="w-8 h-8 mx-auto mb-2 text-green-600 dark:text-green-400" />
                <p className="font-bold text-lg">Dépôt</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Banque → Wallet</p>
              </button>
              <button onClick={() => { setDirection('OUT'); setStep('country'); }}
                className={`flex-1 p-6 rounded-2xl border-2 text-center ${isGatewayAdmin ? 'border-violet-500 bg-violet-50 dark:bg-violet-950/30' : 'border-slate-200 dark:border-slate-600 opacity-50 cursor-not-allowed'}`}>
                <ArrowRight className="w-8 h-8 mx-auto mb-2 text-violet-600" />
                <p className="font-bold text-lg">Retrait</p>
                <p className="text-sm text-slate-500 dark:text-slate-400">Wallet → Banque</p>
                {!isGatewayAdmin && <Badge className="mt-2 bg-amber-100 text-amber-700">Admin uniquement</Badge>}
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {step === 'country' && (
        <Card>
          <CardContent className="p-6 space-y-4">
            <h3 className="font-bold text-lg">
              {direction === 'IN' ? '🇦🇫 Choisissez votre pays' : 'Pays de la banque destinataire'}
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
                {direction === 'IN' ? `Dépôt depuis ${selectedCountry?.country}` : `Retrait vers ${selectedCountry?.country}`}
              </h3>
            </div>

            {/* DÉPÔT (Banque → Wallet) */}
            {direction === 'IN' && (
              <div className="space-y-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 text-left text-sm text-blue-800 dark:text-blue-200 space-y-3">
                  <p className="font-semibold">💡 Comment déposer depuis votre banque locale</p>
                  
                  {iban ? (
                    <div className="space-y-2">
                      <p>Utilisez votre IBAN européen pour recevoir des virements SEPA :</p>
                      <div className="bg-white dark:bg-slate-800 rounded-xl p-4 text-center border">
                        <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Votre IBAN</p>
                        <p className="text-lg font-mono font-bold text-slate-800 dark:text-white tracking-wider break-all">
                          {iban.replace(/(.{4})/g, '$1 ').trim()}
                        </p>
                        <button onClick={handleCopy} className="mt-2 text-xs text-violet-600 dark:text-violet-400 hover:underline inline-flex items-center gap-1">
                          {copied ? <><CheckCircle2 className="w-3 h-3" /> Copié</> : <><Copy className="w-3 h-3" /> Copier l'IBAN</>}
                        </button>
                      </div>
                      <p className="text-xs">Les virements SEPA arrivent en EUR et sont convertis en USD sur votre wallet.</p>
                    </div>
                  ) : (
                    <div>
                      <p>Vous n'avez pas encore d'IBAN. Créez-en un pour recevoir des virements bancaires internationaux.</p>
                      <Button size="sm" className="mt-2" onClick={() => window.location.href = '/fr/iban'}>
                        Créer mon IBAN
                      </Button>
                    </div>
                  )}
                </div>

                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
                  ⚡ Pour les transferts locaux dans {selectedCountry?.country}, utilisez le dépôt <strong>Mobile Money</strong> depuis la page Wallet.
                </div>
              </div>
            )}

            {/* RETRAIT (Wallet → Banque) */}
            {direction === 'OUT' && (
              <div className="space-y-4">
                {isGatewayAdmin ? (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Montant</label>
                        <input type="number" value={form.amount} onChange={(e) => setForm({...form, amount: e.target.value})}
                          className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="1000" />
                      </div>
                      <div>
                        <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Devise</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                          {currencyOptions.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nom du titulaire du compte</label>
                      <input type="text" value={form.accountHolder} onChange={(e) => setForm({...form, accountHolder: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="MONGAI Patriache" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Numéro de compte bancaire</label>
                      <input type="text" value={form.accountNumber} onChange={(e) => setForm({...form, accountNumber: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="Ex: 12345678901" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Nom de la banque</label>
                      <input type="text" value={form.bankName} onChange={(e) => setForm({...form, bankName: e.target.value})}
                        className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white" placeholder="Ex: Ecobank, Orange Bank, UBA..." />
                    </div>

                    {form.amount && (
                      <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-1 text-sm">
                        <div className="flex justify-between"><span>Montant</span><span className="font-bold">{form.amount} {currency}</span></div>
                        <div className="flex justify-between text-red-600 dark:text-red-400"><span>Frais (2%)</span><span>-{(parseFloat(form.amount) * 0.02).toFixed(2)} {currency}</span></div>
                        <div className="flex justify-between text-green-600 dark:text-green-400 border-t dark:border-slate-600 pt-1"><span className="font-bold">Net</span><span className="font-bold">{(parseFloat(form.amount) * 0.98).toFixed(2)} {currency}</span></div>
                      </div>
                    )}

                    <Button onClick={handleSubmit} fullWidth disabled={loading || !form.amount || !form.accountNumber}>
                      {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Send className="w-4 h-4" /> Envoyer le virement</>}
                    </Button>
                  </>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-6 text-center">
                    <Shield className="w-10 h-10 text-amber-500 mx-auto mb-3" />
                    <h3 className="font-bold text-amber-800 dark:text-amber-200">Réservé aux administrateurs</h3>
                    <p className="text-sm text-amber-600 dark:text-amber-400 mt-1">Le retrait Wallet → Banque est disponible uniquement pour les administrateurs. Contactez le support pour plus d'informations.</p>
                  </div>
                )}
              </div>
            )}

            <Button variant="ghost" onClick={() => setStep('country')}>← Retour</Button>
          </CardContent>
        </Card>
      )}

      {step === 'done' && result && (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Virement initié !</h2>
            <p className="text-slate-600 dark:text-slate-300">Référence : {result.reference}</p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Délai estimé : 1-3 jours ouvrés</p>
            <Button onClick={() => { setStep('choose'); setResult(null); setForm({amount:'', accountNumber:'', bankName:'', accountHolder:''}); }}>
              Nouveau virement
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
