'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { 
  ShieldCheck, Zap, Percent, MessageSquare, ArrowRight, Loader2,
  Wallet, Send, Building, Phone, Globe, Users, ArrowLeftRight, Clock,
  Bitcoin, CreditCard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fetchLiveRates, api } from '@/lib/api';
import { ALL_COUNTRIES, HOME_COUNTRIES } from '@/data/countries';
import { getFlagUrl } from '@/data/flags';

export default function HomePage() {
  const t = useTranslations('home');
  const tAuth = useTranslations('auth');
  const locale = useLocale();
  const { user } = useAuth();
  const isGatewayAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';
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
  const platformFee = amountUSD * 0.05; // Dépôt Wallet 5%
  const netUSD = amountUSD - platformFee;
  const receiveAmount = estimateData?.youReceive?.amount || Math.round(netUSD * currentRate);
  const exchangeRate = estimateData?.exchangeRate?.rate || currentRate;
  const countries = HOME_COUNTRIES;

  // Services — TOUT passe par le Wallet
  const availableServices = [
    { icon: Wallet, title: 'PayPal → Wallet', desc: 'Déposez depuis PayPal sur votre wallet.', fee: '5%', href: '/wallet', color: 'from-violet-600 to-indigo-600', bg: 'bg-violet-50', text: 'text-violet-600' },
    { icon: Phone, title: 'Mobile Money → Wallet', desc: 'Rechargez depuis Orange, MTN, Airtel...', fee: '3%', href: '/wallet', color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50', text: 'text-amber-600' },
    { icon: Building, title: 'Banque → Wallet', desc: 'Virement SEPA/SWIFT vers votre IBAN.', fee: '2%', href: '/iban', color: 'from-blue-600 to-cyan-600', bg: 'bg-blue-50', text: 'text-blue-600' },
    { icon: Bitcoin, title: 'Crypto → Wallet', desc: 'BTC, USDT, ETH directement sur wallet.', fee: '2%', href: '/crypto', color: 'from-orange-500 to-yellow-600', bg: 'bg-orange-50', text: 'text-orange-600' },
    { icon: ArrowLeftRight, title: 'Stripe/IBAN → Wallet', desc: 'Virement SEPA, Stripe vers votre wallet.', fee: '2%', href: '/iban', color: 'from-cyan-600 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600' },
    { icon: Users, title: 'PM → Wallet (Gratuit)', desc: 'Recevez depuis un autre utilisateur PayMaestro.', fee: '0%', href: '/wallet', color: 'from-green-600 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600' },
    { icon: ArrowLeftRight, title: 'Wallet → Mobile Money', desc: 'Retirez vers Orange, MTN, Airtel...', fee: '3%', href: '/wallet', color: 'from-emerald-600 to-green-600', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    { icon: Globe, title: 'Wallet → Banque', desc: 'Retirez vers un compte bancaire international.', fee: '2-5%', href: '/bank', color: 'from-cyan-600 to-blue-600', bg: 'bg-cyan-50', text: 'text-cyan-600', adminOnly: true },
    { icon: Wallet, title: 'Wallet → PayPal', desc: 'Retirez de votre wallet vers PayPal.', fee: '3%', href: '/wallet', color: 'from-violet-600 to-indigo-600', bg: 'bg-violet-50', text: 'text-violet-600', adminOnly: true },
    { icon: Bitcoin, title: 'Wallet → Crypto', desc: 'Achetez BTC, USDT, ETH depuis votre wallet.', fee: '2%', href: '/crypto', color: 'from-orange-500 to-yellow-600', bg: 'bg-orange-50', text: 'text-orange-600', adminOnly: true },
    { icon: CreditCard, title: 'Wallet → Carte Virtuelle', desc: 'Visa/Mastercard liée à votre wallet.', fee: '1%+2%FX', href: '/cards', color: 'from-purple-600 to-pink-600', bg: 'bg-purple-50', text: 'text-purple-600' },
    { icon: Users, title: 'Wallet → PM (Gratuit)', desc: 'Transférez gratuitement à un autre utilisateur.', fee: '0%', href: '/wallet/transfer?source=pm', color: 'from-green-600 to-emerald-600', bg: 'bg-green-50', text: 'text-green-600' },
  ];

  const services = isGatewayAdmin ? availableServices : availableServices.filter(s => !s.adminOnly);

  const features = [
    { icon: Globe, title: '54 Pays Africains', desc: 'Présent dans tous les pays d\'Afrique. Envoyez et recevez partout.' },
    { icon: ShieldCheck, title: 'Sécurité Bancaire', desc: 'Protection de vos fonds conforme aux standards internationaux.' },
    { icon: Percent, title: 'Taux Transparents', desc: 'Frais affichés avant chaque transaction. Aucun frais caché.' },
    { icon: MessageSquare, title: 'Support Humain', desc: 'Des conseillers disponibles pour vous assister à tout moment.' },
  ];

  return (
    <div className="space-y-24 py-10">
      {/* ============================================ */}
      {/* HERO */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-7 space-y-6">
          <Badge variant="info" className="px-3 py-1 text-xs">⚡ La plateforme financière panafricaine</Badge>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            L'argent sans frontières,{' '}
            <span className="bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">pour toute l'Afrique.</span>
          </h1>
          <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed">
            Stockez, envoyez et retirez vos fonds vers Mobile Money, comptes bancaires et plus encore dans 54 pays africains. <strong>Tout passe par votre wallet sécurisé.</strong>
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href={`/${locale}/wallet`}><Button size="lg">{t('heroCTA')} <ArrowRight className="w-5 h-5 ml-2" /></Button></Link>
            <Link href={`/${locale}/pricing`}><Button variant="outline" size="lg">Voir nos tarifs</Button></Link>
          </div>
          <div className="flex items-center gap-6 pt-4 text-xs text-slate-400 dark:text-slate-500">
            <div className="flex items-center gap-1.5"><ShieldCheck className="w-4 h-4 text-emerald-500" /><span>Sécurité bancaire</span></div>
            <div className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-emerald-500" /><span>54 pays africains</span></div>
            <div className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-emerald-500" /><span>Taux en temps réel</span></div>
          </div>
        </div>

        {/* Calculateur Wallet */}
        <div className="lg:col-span-5 relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-violet-600 to-indigo-600 rounded-3xl blur-2xl opacity-10" />
          <Card className="relative overflow-hidden rounded-3xl border border-slate-100 dark:border-slate-700 shadow-2xl bg-white dark:bg-slate-800">
            <CardContent className="p-6 sm:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Calculateur Wallet</h3>
                {ratesLoading && <Loader2 className="w-4 h-4 animate-spin text-violet-500" />}
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Devise (54 pays)</label>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-1.5 max-h-[260px] overflow-y-auto">
                  {ALL_COUNTRIES.map((c: any) => (
                    <button key={`${c.code}-${c.country}`} onClick={() => setCurrency(c.code)} title={c.country} className={`p-1.5 rounded-xl border flex flex-col items-center justify-center gap-0.5 transition-all ${currency === c.code ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20 text-violet-900 dark:text-violet-300 font-bold' : 'border-slate-100 dark:border-slate-600 text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-700'}`}>
                      <img src={getFlagUrl(c.countryCode)} alt={c.country} className="w-5 h-3.5 object-cover rounded-sm" />
                      <span className="text-[9px] font-bold">{c.code}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Montant (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-extrabold text-slate-400">$</span>
                  <input type="number" value={amountUSD || ''} onChange={(e) => setAmountUSD(Number(e.target.value))} className="w-full pl-7 pr-12 py-3 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-extrabold text-slate-900 dark:text-white dark:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500" placeholder="100" />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">USD</span>
                </div>
              </div>
              <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-2xl border border-slate-100 dark:border-slate-600 space-y-2.5 text-xs text-slate-500 dark:text-slate-400">
                <div className="flex justify-between"><span>Frais de dépôt (5%)</span><span className="font-semibold text-red-500">-${platformFee.toFixed(2)} USD</span></div>
                <div className="flex justify-between"><span>Taux de change</span><span className="font-semibold text-slate-700 dark:text-slate-300">1 USD = {exchangeRate} {currency}{estimateData?.exchangeRate?.source === 'live' && <span className="ml-1 text-green-500">●</span>}</span></div>
                <div className="flex justify-between border-t border-slate-200 dark:border-slate-600 pt-2.5 text-sm"><span className="font-bold text-slate-800 dark:text-slate-200">Sur votre wallet</span><span className="font-extrabold text-violet-600">${netUSD.toFixed(2)} USD</span></div>
              </div>
              <Link href={`/${locale}/wallet`}><Button variant="primary" fullWidth size="lg">Ouvrir mon Wallet</Button></Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ============================================ */}
      {/* FLUX COMPLET */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <Badge variant="info" className="px-3 py-1 text-xs">Flux sécurisé</Badge>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Tout passe par votre Wallet</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            Déposez, stockez, retirez. Votre argent est tracé et sécurisé à chaque étape.
          </p>
        </div>

        {/* Entrées → Wallet */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            <ArrowLeftRight className="w-4 h-4" /> Entrées (Dépôts)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {services.slice(0, 6).map((service) => (
              <Link href={`/${locale}${service.href}`} key={service.title}>
                <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group cursor-pointer h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className={`w-8 h-8 rounded-lg ${service.bg} dark:bg-opacity-20 ${service.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{service.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                    <span className={`text-xs font-bold ${service.text}`}>{service.fee}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Wallet Hub */}
        <div className="flex justify-center">
          <Card className="bg-gradient-to-r from-emerald-500 to-green-600 text-white rounded-2xl shadow-xl border-0 max-w-md w-full">
            <CardContent className="p-6 text-center space-y-2">
              <Wallet className="w-10 h-10 mx-auto" />
              <h3 className="text-xl font-bold">💰 Wallet PayMaestro</h3>
              <p className="text-sm text-emerald-100">Sécurisé • Tracé • Gelable • Multi-devises</p>
              <Link href={`/${locale}/wallet`}><Button variant="secondary" size="sm">Accéder au Wallet</Button></Link>
            </CardContent>
          </Card>
        </div>

        {/* Wallet → Sorties */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-bold text-violet-600 dark:text-violet-400 uppercase tracking-wider">
            <Send className="w-4 h-4" /> Sorties (Retraits)
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
            {services.slice(6).map((service) => (
              <Link href={`/${locale}${service.href}`} key={service.title}>
                <Card className="hover:shadow-lg transition-all duration-300 rounded-2xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group cursor-pointer h-full">
                  <CardContent className="p-4 space-y-2">
                    <div className={`w-8 h-8 rounded-lg ${service.bg} dark:bg-opacity-20 ${service.text} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <service.icon className="w-4 h-4" />
                    </div>
                    <h4 className="text-sm font-bold text-slate-950 dark:text-white">{service.title}</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{service.desc}</p>
                    <span className={`text-xs font-bold ${service.text}`}>{service.fee}</span>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================ */}
      {/* POURQUOI */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Pourquoi choisir PayMaestro</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-lg mx-auto">
            La plateforme conçue pour les créateurs, entrepreneurs et familles africaines.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {features.map((feature) => (
            <Card key={feature.title} className="hover:border-violet-200 dark:hover:border-violet-800 hover:shadow-lg transition-all duration-300 rounded-2xl bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 group">
              <CardContent className="p-6 space-y-4">
                <div className="w-10 h-10 rounded-xl bg-violet-50 dark:bg-violet-900/20 text-violet-600 dark:text-violet-400 flex items-center justify-center group-hover:bg-violet-600 group-hover:text-white transition-colors">
                  <feature.icon className="w-5 h-5" />
                </div>
                <h4 className="text-sm font-bold text-slate-950 dark:text-white">{feature.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{feature.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      




      

      {/* ============================================ */}
      {/* PAYS */}
      {/* ============================================ */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Disponible dans 54 pays africains</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">Et nous continuons d'étendre notre couverture</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-6 gap-4">
          {countries.map((c: any) => (
            <div key={c.name} className="flex items-center gap-3 p-3 border border-slate-100 dark:border-slate-700 rounded-2xl bg-white dark:bg-slate-800 hover:border-slate-200 dark:hover:border-slate-600 transition-all">
              <img src={getFlagUrl(c.countryCode)} alt={c.name} className="w-6 h-4 object-cover rounded-sm" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">{c.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ============================================ */}
      {/* CTA FINAL */}
      {/* ============================================ */}
      <section className="max-w-3xl mx-auto px-4 text-center space-y-6">
        <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Prêt à commencer ?</h2>
        <p className="text-slate-500 dark:text-slate-400">Rejoignez des milliers d'utilisateurs qui font confiance à PayMaestro.</p>
        <div className="flex gap-4 justify-center">
          <Link href={`/${locale}/login`}><Button size="lg">Se connecter</Button></Link>
          <Link href={`/${locale}/pricing`}><Button variant="outline" size="lg">Voir les tarifs</Button></Link>
        </div>
      </section>
    </div>
  );
}