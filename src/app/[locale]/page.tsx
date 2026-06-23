'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { ShieldCheck, Zap, Percent, MessageSquare, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchLiveRates, api } from '@/lib/api';
import { HOME_COUNTRIES } from '@/data/countries';
import { getFlagUrl } from '@/data/flags';

export default function HomePage() {
  const t = useTranslations('home');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const [currency, setCurrency] = useState('XOF');
  const [amountUSD, setAmountUSD] = useState<number>(100);
  const [liveRates, setLiveRates] = useState<any[]>([]);
  const [ratesLoading, setRatesLoading] = useState(true);
  const [estimateData, setEstimateData] = useState<any>(null);

  useEffect(() => {
    async function loadRates() {
      setRatesLoading(true);
      const rates = await fetchLiveRates();
      setLiveRates(rates);
      setRatesLoading(false);
    }
    loadRates();
  }, []);

  useEffect(() => {
    async function getEstimate() {
      if (amountUSD < 10) return;
      try {
        const res = await api.payments.estimate(amountUSD, currency);
        if (res.success && res.data) setEstimateData(res.data);
      } catch { setEstimateData(null); }
    }
    getEstimate();
  }, [amountUSD, currency]);

  const currentRate = liveRates.find(r => r.currency === currency)?.rate || 603.5;
  const platformFee = amountUSD * 0.07;
  const netUSD = amountUSD - platformFee;
  const receiveAmount = estimateData?.youReceive?.amount || Math.round(netUSD * currentRate);
  const exchangeRate = estimateData?.exchangeRate?.rate || currentRate;
  const countries = HOME_COUNTRIES;

  return (
    <div className="space-y-24 py-10">
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <Badge variant="info" className="px-3 py-1 text-xs">⚡ Retrait PayPal instantané vers l&apos;Afrique</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight">
            {t('heroTitle')}{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">en 5 minutes.</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl leading-relaxed">{t('heroSubtitle')}</p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/withdraw`}><Button size="lg" className="w-full sm:w-auto">{t('heroCTA')} <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <Button variant="outline" size="lg" className="w-full sm:w-auto" onClick={() => {}}>
              <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/></svg>
              {tAuth('loginWithGoogle')}
            </Button>
          </div>
          <div className="flex items-center gap-6 pt-4 text-xs text-slate-400">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Conforme PCI-DSS</span></div>
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Taux en direct</span></div>
          </div>
        </div>
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-2xl opacity-10" />
          <Card className="relative overflow-hidden rounded-3xl border border-slate-100 shadow-2xl bg-white">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">{t('calculator.title')}</h3>
                {ratesLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('calculator.currency')}</label>
                <div className="grid grid-cols-5 gap-2">
                  {(liveRates.length > 0 ? liveRates : [{ currency: 'XOF', flag: '🇨🇮' }, { currency: 'XAF', flag: '🇨🇲' }, { currency: 'KES', flag: '🇰🇪' }, { currency: 'NGN', flag: '🇳🇬' }, { currency: 'GHS', flag: '🇬🇭' }]).slice(0, 5).map((r: any) => (
                    <button key={r.currency} onClick={() => setCurrency(r.currency)} className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all ${currency === r.currency ? 'border-violet-600 bg-violet-50 text-violet-900 font-bold' : 'border-slate-100 text-slate-500 bg-slate-50'}`}>
                      <span className="text-xl">{r.flag}</span><span className="text-[10px]">{r.currency}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('calculator.amount')}</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-400">$</span>
                  <input type="number" value={amountUSD || ''} onChange={(e) => setAmountUSD(Number(e.target.value))} className="w-full pl-7 pr-12 py-3 border border-slate-200 rounded-xl text-lg font-extrabold text-slate-900 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="100" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2.5 text-xs text-slate-500">
                <div className="flex justify-between"><span>{t('calculator.fee')}</span><span className="font-semibold text-red-500">-${platformFee.toFixed(2)} USD</span></div>
                <div className="flex justify-between"><span>{t('calculator.rate')}</span><span className="font-semibold text-slate-700">1 USD = {exchangeRate} {currency}{estimateData?.exchangeRate?.source === 'live' && <span className="ml-1 text-green-500">●</span>}</span></div>
                <div className="flex justify-between border-t border-slate-200 pt-2.5 text-sm"><span className="font-bold text-slate-800">{t('calculator.youReceive')}</span><span className="font-extrabold text-violet-600">{receiveAmount.toLocaleString('fr-FR')} {currency}</span></div>
              </div>
              <Link href={`/${locale}/withdraw`}><Button variant="primary" fullWidth size="lg">Retirer mes fonds maintenant</Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 tracking-tight">{t('features.title')}</h2>
          <p className="text-sm text-slate-500 max-w-lg mx-auto">Une plateforme conçue pour les freelancers, créateurs de contenus et e-commerçants africains.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[{ icon: Zap, title: t('features.fast.title'), desc: t('features.fast.description') }, { icon: ShieldCheck, title: t('features.secure.title'), desc: t('features.secure.description') }, { icon: Percent, title: t('features.rates.title'), desc: t('features.rates.description') }, { icon: MessageSquare, title: t('features.support.title'), desc: t('features.support.description') }].map((f) => (
            <Card key={f.title} className="hover:border-violet-200 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white border-slate-100 group">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors duration-300"><f.icon className="w-5 h-5" /></div>
                <h4 className="text-sm font-bold text-slate-950">{f.title}</h4>
                <p className="text-xs text-slate-500 leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">{t('countries.title')}</h2>
          <p className="text-xs text-slate-500">{t('countries.subtitle')}</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          {countries.map((c: any) => (
            <div key={c.name} className="flex items-center gap-3 p-3 border border-slate-100 rounded-2xl bg-white hover:border-slate-200 hover:bg-slate-50 transition-all duration-200">
              <img src={getFlagUrl(c.countryCode || '+225')} alt={c.name} className="w-6 h-4 object-cover rounded-sm" />
              <span className="text-xs font-semibold text-slate-800">{c.name}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}