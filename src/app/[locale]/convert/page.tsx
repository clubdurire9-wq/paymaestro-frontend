'use client';

import { useState, useEffect } from 'react';
import { Repeat2, DollarSign, Loader2, RefreshCw, CheckCircle2, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/useToast';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';

const CURRENCIES = [
  { code: 'EUR', name: 'Euro', countries: 'Zone Euro (France, Allemagne, Italie, Espagne...)' },
  { code: 'GBP', name: 'Livre Sterling', countries: 'Royaume-Uni' },
];

export default function ConvertPage() {
  const { user } = useAuth();
  const toast = useToast();
  const router = useRouter();
  const locale = useLocale();

  const [balance, setBalance] = useState<number>(0);
  const [amount, setAmount] = useState('');
  const [targetCurrency, setTargetCurrency] = useState('EUR');
  const [rate, setRate] = useState<number | null>(null);
  const [converted, setConverted] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [rateLoading, setRateLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    api.wallet.getBalance().then((res: any) => {
      setBalance(res?.USD || res?.balance_usd || 0);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    if (!amount || parseFloat(amount) <= 0) { setRate(null); setConverted(null); return; }
    setRateLoading(true);
    setConverted(null);
    api.rates.convert(parseFloat(amount), 'USD', targetCurrency).then((res: any) => {
      const r = res?.rate || res?.data?.rate || 0;
      const conv = res?.convertedAmount || res?.data?.convertedAmount || res?.converted_amount || 0;
      setRate(r);
      setConverted(conv);
    }).catch(() => {
      setRate(null);
    }).finally(() => setRateLoading(false));
  }, [amount, targetCurrency]);

  const fee = parseFloat(amount || '0') * 0.02;
  const netUSD = parseFloat(amount || '0') - fee;

  const selected = CURRENCIES.find(c => c.code === targetCurrency);
  const isValid = amount && parseFloat(amount) > 0 && parseFloat(amount) <= balance && rate && rate > 0;

  const handleConvert = async () => {
    if (!isValid) return;
    setLoading(true);
    try {
      await api.wallet.withdrawToWallet({
        amountUSD: parseFloat(amount),
        targetCurrency,
        exchangeRate: rate!,
      });
      setDone(true);
      setBalance(prev => Math.max(0, prev - parseFloat(amount)));
    } catch (e: any) {
      toast.error(e?.message || 'Erreur lors de la conversion');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Repeat2 className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Conversion Multi-Devises</h1>
      </div>

      {done ? (
        <Card>
          <CardContent className="p-6 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Conversion réussie !</h2>
            <p className="text-slate-600 dark:text-slate-300">
              {amount} USD → {converted?.toLocaleString()} {targetCurrency}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">Votre wallet {targetCurrency} a été crédité.</p>
            <div className="flex gap-3 justify-center">
              <Button onClick={() => { setDone(false); setAmount(''); setConverted(null); setRate(null); }}>
                Nouvelle conversion
              </Button>
              <Button variant="secondary" icon={<ArrowRight className="w-4 h-4" />} onClick={() => router.push(`/${locale}/wallet`)}>
                Voir mon wallet
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <DollarSign className="w-5 h-5 text-green-500" />
                Solde disponible
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-slate-900 dark:text-white">{balance.toFixed(2)} USD</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold">Montant (USD)</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                  placeholder="100" max={balance} />
                {parseFloat(amount || '0') > balance && (
                  <p className="text-xs text-red-500 mt-1">Solde insuffisant</p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold">Devise de destination</label>
                <select value={targetCurrency} onChange={(e) => setTargetCurrency(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg text-sm mt-1 dark:border-slate-600 dark:bg-slate-800 dark:text-white">
                  {CURRENCIES.map(c => <option key={c.code} value={c.code}>{c.code} — {c.name}</option>)}
                </select>
                {selected && (
                  <p className="text-xs text-slate-400 mt-1">{selected.countries}</p>
                )}
              </div>

              {rateLoading && (
                <div className="flex items-center gap-2 text-sm text-slate-500 py-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Récupération du taux...
                </div>
              )}

              {rate && !rateLoading && (
                <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Taux de change</span>
                    <span className="font-bold">1 USD = {rate.toFixed(4)} {targetCurrency}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Montant converti</span>
                    <span className="font-bold text-green-600 dark:text-green-400">{converted?.toLocaleString() || '—'} {targetCurrency}</span>
                  </div>
                  <div className="flex justify-between text-red-600 dark:text-red-400">
                    <span>Frais (2%)</span>
                    <span>-{fee.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between text-slate-500">
                    <span>Net débité</span>
                    <span>{netUSD.toFixed(2)} USD</span>
                  </div>
                  <div className="flex justify-between border-t dark:border-slate-600 pt-1">
                    <span className="font-bold">Vous recevez</span>
                    <span className="font-bold text-green-600 dark:text-green-400 text-base">{converted?.toLocaleString() || '—'} {targetCurrency}</span>
                  </div>
                </div>
              )}

              <Button fullWidth onClick={handleConvert} disabled={loading || !isValid}
                icon={loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}>
                {loading ? 'Conversion...' : `Convertir en ${targetCurrency}`}
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
