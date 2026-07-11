'use client';

import { useState, useMemo } from 'react';
import {
  Calculator, ArrowUp, Loader2, Smartphone,
  AlertTriangle, CheckCircle2, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { ALL_COUNTRIES } from '@/data/countries';

interface CurrencyRate {
  code: string;
  rate: number;
  flag?: string;
  symbol: string;
}

function roundCents(value: number): number {
  return Math.round(value * 100) / 100;
}

interface WithdrawalFeeCalculatorProps {
  usdBalance: number;
  currencies: CurrencyRate[];
  onRefreshBalance?: () => void;
}

export function WithdrawalFeeCalculator({ usdBalance, currencies, onRefreshBalance }: WithdrawalFeeCalculatorProps) {
  const [amount, setAmount] = useState('');
  const [showConfirm, setShowConfirm] = useState(false);
  const [showResult, setShowResult] = useState(false);
  const [resultData, setResultData] = useState<{ type: 'success' | 'error'; title: string; message: string } | null>(null);
  const [loading, setLoading] = useState(false);

  const [mobileCountry, setMobileCountry] = useState(ALL_COUNTRIES[0]);

  const usdAmount = roundCents(parseFloat(amount) || 0);

  const processingFeePct = 3;
  const processingFee = roundCents(usdAmount * processingFeePct / 100);

  const totalFees = processingFee;
  const netUsd = roundCents(usdAmount - totalFees);

  const destCurrency = mobileCountry.code;
  const destRate = currencies.find(r => r.code === destCurrency)?.rate || 1;
  const destAmount = roundCents(netUsd * destRate);

  const exceedsBalance = usdAmount > usdBalance;
  const isValid = usdAmount > 0 && !exceedsBalance;

  const feeBreakdown = useMemo(() => [
    { label: `Frais de traitement (${processingFeePct}%)`, amount: processingFee, color: 'text-red-500' },
    { label: 'Total des frais', amount: totalFees, color: 'text-red-600 font-bold' },
    { label: 'Montant net reçu', amount: netUsd, color: 'text-emerald-600 font-bold text-lg' },
  ], [processingFee, totalFees, netUsd, processingFeePct]);

  const handleConfirm = async () => {
    setLoading(true);
    try {
      await api.wallet.withdrawMobile({
        amountUSD: usdAmount,
        currencyCode: destCurrency,
        phoneNumber: '',
        exchangeRate: destRate,
      });
      setResultData({
        type: 'success',
        title: 'Retrait initié avec succès',
        message: `Votre retrait de ${usdAmount.toFixed(2)} USD via Mobile Money a été pris en compte. Montant net : ${destAmount.toFixed(2)} ${destCurrency}.`,
      });
      setShowConfirm(false);
      setShowResult(true);
    } catch (e: any) {
      setResultData({ type: 'error', title: 'Erreur', message: e.message || 'Une erreur est survenue lors du retrait.' });
      setShowConfirm(false);
      setShowResult(true);
    }
    setLoading(false);
  };

  return (
    <>
      <Card className="bg-gradient-to-br from-violet-50 to-indigo-50 dark:from-violet-950/30 dark:to-indigo-950/30 border-2 border-violet-200 dark:border-violet-800/50">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-violet-900 dark:text-violet-100">
              <Calculator className="w-5 h-5" />
              Calculateur de retrait
            </CardTitle>
            {onRefreshBalance && (
              <button onClick={onRefreshBalance} className="p-1.5 text-violet-500 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-200 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/40 transition-colors">
                <RefreshCw className="w-4 h-4" />
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-white/60 dark:bg-slate-800/40 rounded-xl p-3 flex items-center justify-between text-sm">
            <span className="text-slate-600 dark:text-slate-400">Solde disponible</span>
            <span className="font-bold text-slate-900 dark:text-white text-lg">{usdBalance.toFixed(2)} USD</span>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Montant à retirer (USD)</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold dark:bg-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500/20"
            />
            {exceedsBalance && (
              <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Montant supérieur à votre solde disponible
              </p>
            )}
          </div>

          <div className="bg-violet-50 dark:bg-violet-900/20 rounded-xl px-4 py-2.5 text-sm text-violet-800 dark:text-violet-300 flex items-center gap-2">
            <Smartphone className="w-4 h-4" />
            <span>Retrait via <strong>Mobile Money</strong> — frais de <strong>3%</strong></span>
          </div>

          <div>
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Pays de destination</label>
              <select
                value={mobileCountry.country}
                onChange={(e) => {
                  const c = ALL_COUNTRIES.find(c => c.country === e.target.value);
                  if (c) setMobileCountry(c);
                }}
                className="w-full px-3 py-2.5 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white"
              >
                {ALL_COUNTRIES.map(c => (
                  <option key={c.country} value={c.country}>
                    {c.country} ({c.code})
                  </option>
                ))}
              </select>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Taux appliqué : 1 USD = {destRate} {destCurrency}
                
              </p>
            </div>

          {usdAmount > 0 && (
            <div className="bg-white dark:bg-slate-800/60 rounded-xl p-4 space-y-2 border border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Détail des frais</p>
              {feeBreakdown.map((item) => (
                <div key={item.label} className="flex justify-between text-sm items-center">
                  <span className="text-slate-600 dark:text-slate-400">{item.label}</span>
                  <span className={item.color}>
                    {item.label === 'Montant net reçu' ? '' : '-'}{item.amount.toFixed(2)} USD
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-200 dark:border-slate-700">
                <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">
                  {destAmount.toFixed(2)} {destCurrency}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Montant estimé reçu en devise locale</p>
              </div>
            </div>
          )}

          <Button
            fullWidth
            disabled={!isValid || loading}
            onClick={() => setShowConfirm(true)}
            className="bg-violet-600 hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <ArrowUp className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Traitement...' : 'Retirer'}
          </Button>

          {!isValid && usdAmount > 0 && (
            <p className="text-xs text-center text-red-500 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Veuillez vérifier le montant saisi
            </p>
          )}
        </CardContent>
      </Card>

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 w-full max-w-md space-y-4 animate-in fade-in zoom-in duration-200">
            <div className="text-center">
              <div className="w-14 h-14 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mx-auto mb-3">
                <AlertTriangle className="w-7 h-7 text-amber-600 dark:text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Vérifiez vos informations</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                Avant de confirmer, assurez-vous que les informations ci-dessous sont correctes.
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500">Canal</span>
                <span className="font-semibold text-slate-900 dark:text-white">Mobile Money</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant brut</span>
                <span className="font-semibold text-slate-900 dark:text-white">{usdAmount.toFixed(2)} USD</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between">
                <span className="text-slate-500">Frais de traitement ({processingFeePct}%)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">-{processingFee.toFixed(2)} USD</span>
              </div>
              <hr className="border-slate-200 dark:border-slate-700" />
              <div className="flex justify-between text-emerald-700 dark:text-emerald-400 font-bold text-base">
                <span>Net à recevoir</span>
                <span>{destAmount.toFixed(2)} {destCurrency}</span>
              </div>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center pt-1">
                Taux : 1 USD = {destRate} {destCurrency}
              </p>
            </div>

            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-xl text-xs text-blue-800 dark:text-blue-400 space-y-1">
              <p className="font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                Conformément à notre politique de remboursement :
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-blue-700 dark:text-blue-300">
                <li>Les frais de traitement ne sont pas remboursables</li>
                <li>Le délai de traitement varie selon le canal sélectionné</li>
                <li>Les informations du bénéficiaire doivent être exactes</li>
              </ul>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-medium text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
              >
                Annuler
              </button>
              <button
                onClick={handleConfirm}
                disabled={loading}
                className="flex-1 py-3 rounded-xl bg-violet-600 text-white font-medium text-sm hover:bg-violet-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                {loading ? 'Traitement...' : 'Confirmer le retrait'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showResult && resultData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-8 w-full max-w-sm text-center space-y-5 animate-in fade-in zoom-in duration-200">
            {resultData.type === 'success' ? (
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/40 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10 text-green-600 dark:text-green-400" />
              </div>
            ) : (
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/40 rounded-full flex items-center justify-center mx-auto">
                <AlertTriangle className="w-10 h-10 text-red-600 dark:text-red-400" />
              </div>
            )}
            <div>
              <h3 className={`text-xl font-bold ${resultData.type === 'success' ? 'text-green-700 dark:text-green-300' : 'text-red-700 dark:text-red-300'}`}>
                {resultData.title}
              </h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">{resultData.message}</p>
            </div>
            <button
              onClick={() => { setShowResult(false); setResultData(null); }}
              className={`w-full py-3 rounded-xl font-medium text-sm text-white transition-colors ${
                resultData.type === 'success'
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-slate-700 hover:bg-slate-800 dark:bg-slate-600 dark:hover:bg-slate-500'
              }`}
            >
              {resultData.type === 'success' ? 'Retour au portefeuille' : 'Réessayer'}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
