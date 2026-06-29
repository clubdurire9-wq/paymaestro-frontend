'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { 
  Wallet, Percent, 
  CheckCircle2, Calculator,
  Phone, Globe, Building, Users, ArrowLeftRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ALL_COUNTRIES } from '@/data/countries';
import { getFlagUrl } from '@/data/flags';

export default function PricingPage() {
  const locale = useLocale();
  const [calcAmount, setCalcAmount] = useState('100');
  const [calcService, setCalcService] = useState<'wallet' | 'stripe' | 'pm2pm' | 'bank2wallet' | 'mobile2wallet'>('wallet');
  const [calcCurrency, setCalcCurrency] = useState('XOF');
  const [searchCountry, setSearchCountry] = useState('');

  const amount = parseFloat(calcAmount) || 0;

  // Calculs
  const walletDepositFee = amount * 0.05;
  const walletNet = amount - walletDepositFee;
  const walletWithdrawFee = walletNet * 0.03;
  const walletReceive = walletNet - walletWithdrawFee;

  const stripeFee = amount * 0.02;
  const stripeReceive = amount - stripeFee;

  const bank2walletFee = amount * 0.02;
  const bank2walletReceive = amount - bank2walletFee;

  const mobile2walletFee = amount * 0.03;
  const mobile2walletReceive = amount - mobile2walletFee;

  const rate = ALL_COUNTRIES.find(c => c.code === calcCurrency)?.rate || 600;

  const services = [
    {
      id: 'wallet',
      icon: Wallet,
      title: 'Wallet Central',
      subtitle: 'Hub sécurisé — dépôts + retraits',
      fee: '5% + 3%',
      color: 'from-emerald-600 to-green-600',
      borderColor: 'border-emerald-300',
      bgColor: 'bg-emerald-50',
      textColor: 'text-emerald-700',
      badge: 'Le hub central',
      badgeColor: 'bg-emerald-100 text-emerald-700',
      steps: [
        'Déposez sur votre wallet (5% ou moins selon méthode)',
        'Votre argent est sécurisé, tracé et disponible',
        'Retirez quand vous voulez (3% vers Mobile Money)',
      ],
      example: (a: number) => ({
        fee: (a * 0.05) + ((a * 0.95) * 0.03),
        receive: (a * 0.95) * 0.97,
      }),
    },
    {
      id: 'stripe',
      icon: Building,
      title: 'IBAN Européen (Stripe)',
      subtitle: 'Virement SEPA → Wallet',
      fee: 'Gratuit + 2% conversion',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      badge: 'Nouveau',
      badgeColor: 'bg-blue-100 text-blue-700',
      steps: [
        'Obtenez votre IBAN européen gratuit',
        'Recevez des virements SEPA',
        'Conversion automatique en USD',
        'Retirez vers Mobile Money',
      ],
      example: (a: number) => ({
        fee: a * 0.02,
        receive: a * 0.98,
      }),
    },
    {
      id: 'pm2pm',
      icon: Users,
      title: 'PayMaestro → PayMaestro',
      subtitle: 'Transfert interne entre utilisateurs',
      fee: 'GRATUIT (0%)',
      color: 'from-green-600 to-emerald-600',
      borderColor: 'border-green-300',
      bgColor: 'bg-green-50',
      textColor: 'text-green-700',
      badge: 'Le moins cher',
      badgeColor: 'bg-green-100 text-green-700',
      steps: [
        'Recherchez le destinataire par email',
        'Vérifiez son identité complète',
        'Transférez instantanément et gratuitement',
      ],
      example: (a: number) => ({
        fee: 0,
        receive: a,
      }),
    },
    {
      id: 'bank2wallet',
      icon: ArrowLeftRight,
      title: 'Banque → Wallet',
      subtitle: 'Dépôt bancaire SEPA/SWIFT',
      fee: '2% conversion',
      color: 'from-blue-600 to-cyan-600',
      borderColor: 'border-blue-300',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-700',
      badge: 'Automatique',
      badgeColor: 'bg-blue-100 text-blue-700',
      steps: [
        'Obtenez votre IBAN européen',
        'Faites un virement depuis votre banque',
        'Crédité automatiquement sur votre wallet',
      ],
      example: (a: number) => ({
        fee: a * 0.02,
        receive: a * 0.98,
      }),
    },
    {
      id: 'mobile2wallet',
      icon: Phone,
      title: 'Mobile Money → Wallet',
      subtitle: 'Dépôt depuis votre compte Mobile Money',
      fee: '3%',
      color: 'from-amber-500 to-orange-600',
      borderColor: 'border-amber-300',
      bgColor: 'bg-amber-50',
      textColor: 'text-amber-700',
      badge: 'Instantané',
      badgeColor: 'bg-amber-100 text-amber-700',
      steps: [
        'Choisissez votre pays et opérateur',
        'Entrez votre numéro et le montant',
        'Crédité instantanément sur votre wallet',
      ],
      example: (a: number) => ({
        fee: a * 0.03,
        receive: a * 0.97,
      }),
    },
  ];

  const currentService = services.find(s => s.id === calcService)!;
  const currentExample = currentService.example(amount);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-12">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-slate-900">Nos Tarifs</h1>
        <p className="text-lg text-slate-500 max-w-2xl mx-auto">
          Des frais transparents et compétitifs. Pas de surprise, pas de frais cachés.
        </p>
      </div>

      {/* Cartes de services */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map(service => (
          <Card 
            key={service.id}
            className={`relative overflow-hidden border-2 transition-all duration-300 hover:shadow-xl cursor-pointer ${
              calcService === service.id ? service.borderColor + ' shadow-lg scale-105' : 'border-slate-200'
            }`}
            onClick={() => setCalcService(service.id as any)}
          >
            {calcService === service.id && (
              <div className="absolute top-3 right-3">
                <CheckCircle2 className={`w-5 h-5 ${service.textColor}`} />
              </div>
            )}
            <CardContent className="p-6 space-y-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${service.color} flex items-center justify-center`}>
                <service.icon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-slate-900">{service.title}</h3>
                <p className="text-sm text-slate-500">{service.subtitle}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-3xl font-extrabold ${service.textColor}`}>{service.fee}</span>
                <span className="text-sm text-slate-400">de frais</span>
              </div>
              <Badge className={service.badgeColor}>{service.badge}</Badge>
              <ul className="space-y-2">
                {service.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                    {step}
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calculateur interactif */}
      <Card className="border-2 border-slate-200 shadow-xl overflow-hidden">
        <div className={`bg-gradient-to-r ${currentService.color} p-6 text-white`}>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Calculator className="w-6 h-6" />
            Calculateur — {currentService.title}
          </h2>
          <p className="text-sm opacity-80 mt-1">Simulez votre retrait et voyez exactement ce que vous recevrez</p>
        </div>
        <CardContent className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Montant */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Montant (USD)</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg font-bold text-slate-400">$</span>
                <input
                  type="number"
                  value={calcAmount}
                  onChange={(e) => setCalcAmount(e.target.value)}
                  className="w-full pl-8 pr-4 py-3 border-2 border-slate-200 rounded-xl text-lg font-bold focus:ring-2 focus:ring-violet-500 outline-none"
                />
              </div>
            </div>

            {/* Service (déjà sélectionné via les cartes) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Service</label>
              <select
                value={calcService}
                onChange={(e) => setCalcService(e.target.value as any)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-semibold bg-white"
              >
                {services.map(s => (
                  <option key={s.id} value={s.id}>{s.title} ({s.fee})</option>
                ))}
              </select>
            </div>

            {/* Devise locale avec recherche */}
            <div>
              <label className="text-sm font-semibold text-slate-700 mb-2 block">Devise locale</label>
              <div className="relative">
                <input
                  type="text"
                  value={searchCountry}
                  onChange={(e) => setSearchCountry(e.target.value)}
                  placeholder="🔍 Rechercher un pays ou un code..."
                  className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 outline-none"
                />
                {searchCountry && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-xl max-h-[300px] overflow-y-auto">
                    {ALL_COUNTRIES
                      .filter(c => 
                        c.country.toLowerCase().includes(searchCountry.toLowerCase()) ||
                        c.code.toLowerCase().includes(searchCountry.toLowerCase())
                      )
                      .map(c => (
                        <button
                          key={c.code + c.country}
                          onClick={() => { setCalcCurrency(c.code); setSearchCountry(''); }}
                          className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-violet-50 text-left text-sm transition-colors"
                        >
                          <img src={getFlagUrl(c.countryCode)} alt={c.country} className="w-6 h-4 object-cover rounded-sm" />
                          <span className="font-semibold">{c.code}</span>
                          <span className="text-slate-500 text-xs">{c.country}</span>
                        </button>
                      ))}
                  </div>
                )}
              </div>
              {/* Grille rapide des drapeaux */}
              <div className="grid grid-cols-6 sm:grid-cols-9 gap-1 mt-2 max-h-[200px] overflow-y-auto">
                {ALL_COUNTRIES.map(c => (
                  <button
                    key={c.code + c.country}
                    onClick={() => setCalcCurrency(c.code)}
                    className={`p-1.5 rounded-lg text-center transition-all ${
                      calcCurrency === c.code ? 'bg-violet-100 ring-2 ring-violet-400 scale-110' : 'hover:bg-slate-100'
                    }`}
                    title={`${c.country} (${c.code})`}
                  >
                    <img src={getFlagUrl(c.countryCode)} alt={c.country} className="w-6 h-4 object-cover rounded-sm mx-auto" />
                    <span className="block text-[9px] font-semibold">{c.code}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Résultat */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className={`${currentExample.fee === 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <CardContent className="p-4 text-center">
                <p className={`text-xs font-semibold uppercase ${currentExample.fee === 0 ? 'text-green-600' : 'text-red-600'}`}>
                  Frais PayMaestro
                </p>
                <p className={`text-3xl font-extrabold ${currentExample.fee === 0 ? 'text-green-700' : 'text-red-700'}`}>
                  {currentExample.fee === 0 ? '🎉 GRATUIT' : `-$${currentExample.fee.toFixed(2)}`}
                </p>
                <p className={`text-xs ${currentExample.fee === 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {currentService.fee}
                </p>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-blue-600 font-semibold uppercase">Montant net</p>
                <p className="text-3xl font-extrabold text-blue-700">${currentExample.receive.toFixed(2)}</p>
                <p className="text-xs text-blue-500">USD</p>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4 text-center">
                <p className="text-xs text-green-600 font-semibold uppercase">Vous recevez</p>
                <p className="text-3xl font-extrabold text-green-700">
                  {Math.floor(currentExample.receive * rate).toLocaleString('fr-FR')}
                </p>
                <p className="text-xs text-green-500">{calcCurrency}</p>
              </CardContent>
            </Card>
          </div>

          {/* Détail */}
          <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-sm">
            <h4 className="font-semibold text-slate-700">📋 Détail du calcul</h4>
            {calcService === 'pm2pm' ? (
              <>
                <div className="flex justify-between">
                  <span>Montant envoyé</span>
                  <span className="font-bold">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-green-600">
                  <span>Frais de transfert</span>
                  <span className="font-bold">🎉 GRATUIT (0%)</span>
                </div>
                <div className="flex justify-between text-green-600 border-t pt-2">
                  <span className="font-bold">Le destinataire reçoit</span>
                  <span className="font-bold">${currentExample.receive.toFixed(2)} USD ≈ {Math.floor(currentExample.receive * rate).toLocaleString('fr-FR')} {calcCurrency}</span>
                </div>
                <div className="bg-green-100 border border-green-300 rounded-lg p-3 mt-2">
                  <p className="text-green-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Aucun frais ! Transférez autant que vous voulez entre utilisateurs PayMaestro.
                  </p>
                </div>
              </>
            ) : calcService === 'wallet' ? (
              <>
                <div className="flex justify-between">
                  <span>Dépôt initial</span>
                  <span className="font-bold">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Frais de dépôt (5%)</span>
                  <span>-${walletDepositFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between">
                  <span>Solde wallet</span>
                  <span className="font-bold">${walletNet.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Frais de retrait (3%)</span>
                  <span>-${walletWithdrawFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-green-600 border-t pt-2">
                  <span className="font-bold">Vous recevez</span>
                  <span className="font-bold">${walletReceive.toFixed(2)} USD ≈ {Math.floor(walletReceive * rate).toLocaleString('fr-FR')} {calcCurrency}</span>
                </div>
              </>
            ) : calcService === 'stripe' ? (
              <>
                <div className="flex justify-between">
                  <span>Virement SEPA reçu</span>
                  <span className="font-bold">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Frais de conversion (2%)</span>
                  <span>-${stripeFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-green-600 border-t pt-2">
                  <span className="font-bold">Montant dans votre wallet</span>
                  <span className="font-bold">${stripeReceive.toFixed(2)} USD ≈ {Math.floor(stripeReceive * rate).toLocaleString('fr-FR')} {calcCurrency}</span>
                </div>
              </>
            ) : calcService === 'bank2wallet' ? (
              <>
                <div className="flex justify-between">
                  <span>Virement bancaire reçu</span>
                  <span className="font-bold">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Frais de conversion (2%)</span>
                  <span>-${bank2walletFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-green-600 border-t pt-2">
                  <span className="font-bold">Montant crédité sur votre wallet</span>
                  <span className="font-bold">${bank2walletReceive.toFixed(2)} USD ≈ {Math.floor(bank2walletReceive * rate).toLocaleString('fr-FR')} {calcCurrency}</span>
                </div>
                <div className="bg-blue-100 border border-blue-300 rounded-lg p-3 mt-2">
                  <p className="text-blue-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Dépôt automatique ! Votre wallet est crédité dès réception du virement.
                  </p>
                </div>
              </>
            ) : calcService === 'mobile2wallet' ? (
              <>
                <div className="flex justify-between">
                  <span>Dépôt Mobile Money</span>
                  <span className="font-bold">${amount.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-red-600">
                  <span>Frais de dépôt (3%)</span>
                  <span>-${mobile2walletFee.toFixed(2)} USD</span>
                </div>
                <div className="flex justify-between text-green-600 border-t pt-2">
                  <span className="font-bold">Montant crédité sur votre wallet</span>
                  <span className="font-bold">${mobile2walletReceive.toFixed(2)} USD ≈ {Math.floor(mobile2walletReceive * rate).toLocaleString('fr-FR')} {calcCurrency}</span>
                </div>
                <div className="bg-amber-100 border border-amber-300 rounded-lg p-3 mt-2">
                  <p className="text-amber-700 font-medium flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Dépôt instantané ! Votre wallet est crédité immédiatement après confirmation.
                  </p>
                </div>
              </>
            ) : null}
          </div>

          <div className="flex gap-3">
            <Link href={`/${locale}/wallet`}>
              <Button variant="primary" icon={<Wallet className="w-4 h-4" />}>
                Accéder au Wallet
              </Button>
            </Link>
            <Link href={`/${locale}/pricing`}>
              <Button variant="outline" icon={<Percent className="w-4 h-4" />}>
                Voir tous les tarifs
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Comparaison */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-violet-600" />
            Pourquoi PayMaestro est moins cher
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left p-3">Service</th>
                  <th className="text-center p-3">Commission</th>
                  <th className="text-center p-3">Délai</th>
                  <th className="text-center p-3">Mobile Money</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {[
                  { name: 'Wallet → PM (interne)', fee: '0%', time: 'Instantané', mobile: '✅' },
                  { name: 'PayPal → Wallet', fee: '5%', time: 'Instantané', mobile: '✅' },
                  { name: 'Mobile Money → Wallet', fee: '3%', time: 'Instantané', mobile: '✅' },
                  { name: 'Banque → Wallet', fee: '2% conversion', time: '1-3 jours', mobile: '✅' },
                  { name: 'Crypto → Wallet', fee: '2%', time: 'Instantané', mobile: '✅' },
                  { name: 'Stripe/IBAN → Wallet', fee: '0% + 2% conv.', time: '1-2 jours', mobile: '✅' },
                  { name: 'Wallet → Mobile Money', fee: '3%', time: 'Instantané', mobile: '✅' },
                  { name: 'Wallet → Banque', fee: '2-5%', time: '1-3 jours', mobile: '✅' },
                  { name: 'Wallet → PayPal', fee: '3%', time: 'Instantané', mobile: '✅' },
                  { name: 'Wallet → Carte Virtuelle', fee: '1%+2%FX', time: 'Instantané', mobile: '✅' },

                ].map((row, i) => (
                  <tr key={i} className={i <= 9 ? 'bg-green-50' : ''}>
                    <td className="p-3 font-semibold">
                      {row.name}
                      {i <= 9 && <Badge className="ml-2 bg-green-100 text-green-700">PayMaestro</Badge>}
                    </td>
                    <td className="text-center p-3 font-bold">{row.fee}</td>
                    <td className="text-center p-3">{row.time}</td>
                    <td className="text-center p-3">{row.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}