'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import {
  Calculator, Smartphone, RefreshCw, AlertTriangle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

  const [mobileCountry, setMobileCountry] = useState(ALL_COUNTRIES[0]);
  const [countryOpen, setCountryOpen] = useState(false);
  const countryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => { if (countryRef.current && !countryRef.current.contains(e.target as Node)) setCountryOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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

          <div ref={countryRef} className="relative">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 block">Pays de destination</label>
              <button
                type="button"
                onClick={() => setCountryOpen(!countryOpen)}
                className="w-full flex items-center gap-2 px-3 py-2.5 border dark:border-slate-600 rounded-xl text-sm dark:bg-slate-800 dark:text-white text-left"
              >
                <img src={`https://flagcdn.com/w20/${mobileCountry.iso2}.png`} alt={mobileCountry.country} className="w-5 h-4 rounded object-cover" />
                <span className="flex-1">{mobileCountry.country}</span>
                <span className="text-slate-400">{countryOpen ? '▲' : '▼'}</span>
              </button>
              {countryOpen && (
                <div className="absolute z-50 mt-1 w-full max-h-48 overflow-y-auto bg-white dark:bg-slate-800 border dark:border-slate-600 rounded-xl shadow-lg">
                  {ALL_COUNTRIES.map(c => (
                    <button
                      key={c.country}
                      type="button"
                      onClick={() => { setMobileCountry(c); setCountryOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700 dark:text-white text-left"
                    >
                      <img src={`https://flagcdn.com/w20/${c.iso2}.png`} alt={c.country} className="w-5 h-4 rounded object-cover" />
                      <span>{c.country}</span>
                      <span className="ml-auto text-xs text-slate-400">{c.code}</span>
                    </button>
                  ))}
                </div>
              )}
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

          {!isValid && usdAmount > 0 && (
            <p className="text-xs text-center text-red-500 flex items-center justify-center gap-1">
              <AlertTriangle className="w-3 h-3" />
              Veuillez vérifier le montant saisi
            </p>
          )}
        </CardContent>
      </Card>
    </>
  );
}
