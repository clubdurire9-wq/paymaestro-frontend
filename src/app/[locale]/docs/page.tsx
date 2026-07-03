'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { BookOpen, Rocket, Code, Shield, HelpCircle, Search, Wallet, ArrowRight, CreditCard, Globe, Smartphone, Users, DollarSign, Bitcoin, Building, ArrowLeftRight, LifeBuoy, FileText } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const categories = [
  {
    icon: Rocket,
    title: 'Démarrage rapide',
    desc: 'Créez votre compte, vérifiez votre identité et effectuez votre première transaction en quelques minutes.',
    href: '/docs/getting-started',
    color: 'from-violet-600 to-indigo-600',
    bg: 'bg-violet-50 dark:bg-violet-900/20',
    text: 'text-violet-600 dark:text-violet-400',
  },
  {
    icon: Wallet,
    title: 'Wallet',
    desc: 'Gérez votre portefeuille PayMaestro : dépôts, retraits, conversion de devises et historique.',
    href: '/docs/getting-started#wallet',
    color: 'from-emerald-600 to-green-600',
    bg: 'bg-emerald-50 dark:bg-emerald-900/20',
    text: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    icon: CreditCard,
    title: 'Paiements & Transferts',
    desc: 'PayPal, Mobile Money, virement bancaire, crypto et cartes virtuelles.',
    href: '/docs/getting-started#payments',
    color: 'from-amber-500 to-orange-600',
    bg: 'bg-amber-50 dark:bg-amber-900/20',
    text: 'text-amber-600 dark:text-amber-400',
  },
  {
    icon: Code,
    title: 'API Développeur',
    desc: 'Intégrez PayMaestro à votre application via notre API REST documentée.',
    href: '/docs/api',
    color: 'from-blue-600 to-cyan-600',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    text: 'text-blue-600 dark:text-blue-400',
  },
  {
    icon: Shield,
    title: 'Sécurité & Conformité',
    desc: 'KYC, chiffrement AES-256, PCI-DSS, et protection contre la fraude.',
    href: '/docs/getting-started#security',
    color: 'from-red-600 to-rose-600',
    bg: 'bg-red-50 dark:bg-red-900/20',
    text: 'text-red-600 dark:text-red-400',
  },
  {
    icon: HelpCircle,
    title: 'FAQ',
    desc: 'Réponses aux questions les plus fréquentes sur PayMaestro.',
    href: '/docs/faq',
    color: 'from-sky-600 to-blue-600',
    bg: 'bg-sky-50 dark:bg-sky-900/20',
    text: 'text-sky-600 dark:text-sky-400',
  },
];

const quickLinks = [
  { icon: Smartphone, label: 'Dépôt Mobile Money', href: '/docs/getting-started#mobile-money' },
  { icon: DollarSign, label: 'Dépôt PayPal → Wallet', href: '/docs/getting-started#paypal' },
  { icon: Globe, label: 'Virement SEPA/IBAN', href: '/docs/getting-started#iban' },
  { icon: Bitcoin, label: 'Dépôt Crypto', href: '/docs/getting-started#crypto' },
  { icon: ArrowLeftRight, label: 'Transfert PM → PM', href: '/docs/getting-started#pm-transfer' },
  { icon: Users, label: 'Programme de parrainage', href: '/docs/getting-started#referral' },
  { icon: Building, label: 'Carte virtuelle', href: '/docs/getting-started#cards' },
  { icon: LifeBuoy, label: 'Contact Support', href: '/contact' },
];

export default function DocsPage() {
  const locale = useLocale();
  const [search, setSearch] = useState('');

  const filteredCategories = categories.filter(
    c => c.title.toLowerCase().includes(search.toLowerCase()) || c.desc.toLowerCase().includes(search.toLowerCase())
  );
  const filteredQuickLinks = quickLinks.filter(
    l => l.label.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      {/* Hero */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="w-14 h-14 rounded-2xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center mx-auto">
          <BookOpen className="w-7 h-7 text-violet-600 dark:text-violet-400" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white">Documentation PayMaestro</h1>
        <p className="text-lg text-slate-500 dark:text-slate-400">
          Tout ce que vous devez savoir pour utiliser et intégrer PayMaestro.
        </p>

        {/* Search */}
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher dans la documentation..."
            className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
          />
        </div>
      </div>

      {/* Categories */}
      <section className="space-y-6">
        <div className="flex items-center gap-3">
          <FileText className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Parcourir par catégorie</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => (
            <Link key={cat.title} href={`/${locale}${cat.href}`}>
              <Card className="group border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-700 hover:shadow-md transition-all duration-200 h-full">
                <CardContent className="p-5">
                  <div className={`w-10 h-10 rounded-xl ${cat.bg} flex items-center justify-center mb-3`}>
                    <cat.icon className={`w-5 h-5 ${cat.text}`} />
                  </div>
                  <h3 className="font-semibold text-slate-900 dark:text-white group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                    {cat.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">{cat.desc}</p>
                  <div className="flex items-center gap-1 mt-3 text-xs font-medium text-violet-600 dark:text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity">
                    Explorer <ArrowRight className="w-3 h-3" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
        {filteredCategories.length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <BookOpen className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aucun résultat pour &quot;{search}&quot;</p>
          </div>
        )}
      </section>

      {/* Quick Links */}
      <section className="space-y-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">Liens rapides</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {(search ? filteredQuickLinks : quickLinks).map((link) => (
            <Link key={link.label} href={`/${locale}${link.href}`}
              className="flex items-center gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-700 hover:border-violet-200 dark:hover:border-violet-700 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all duration-200 group"
            >
              <link.icon className="w-4 h-4 text-violet-600 dark:text-violet-400 shrink-0" />
              <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
                {link.label}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Integration badges */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800">
        <p className="text-sm text-slate-400 dark:text-slate-500 mb-4">Disponible dans 54 pays africains</p>
        <div className="flex flex-wrap justify-center gap-3 text-xs text-slate-500 dark:text-slate-400">
          {['MTN Mobile Money', 'Orange Money', 'Wave', 'Moov', 'Airtel Money', 'M-Pesa', 'Free Money', 'Tigo Cash', 'Mobicash', 'Safaricom'].map(op => (
            <span key={op} className="px-3 py-1.5 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700">
              {op}
            </span>
          ))}
        </div>
      </section>
    </div>
  );
}
