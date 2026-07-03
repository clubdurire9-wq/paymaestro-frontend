'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { HelpCircle, BookOpen, ChevronDown, Search, Wallet, DollarSign, Smartphone, Shield, CreditCard, Users, Globe, Bitcoin, ArrowLeftRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const faqCategories = [
  {
    icon: Wallet,
    title: 'Général',
    questions: [
      { q: 'Qu\'est-ce que PayMaestro ?', a: 'PayMaestro est une plateforme financière qui permet aux utilisateurs de recevoir des fonds depuis PayPal, Mobile Money, virement bancaire ou crypto, de les stocker dans un wallet sécurisé, et de les retirer vers le service de leur choix.' },
      { q: 'PayMaestro est-il légal ?', a: 'Oui, PayMaestro opère en conformité avec les réglementations financières internationales (PCI-DSS, KYC/AML) et respecte le RGPD pour la protection des données.' },
      { q: 'Dans quels pays PayMaestro est-il disponible ?', a: 'PayMaestro est disponible dans les 54 pays d\'Afrique. Les opérateurs Mobile Money disponibles varient selon le pays.' },
      { q: 'Puis-je avoir plusieurs comptes ?', a: 'Un seul compte par personne. La création de plusieurs comptes est interdite et peut entraîner la suspension de vos accès.' },
    ],
  },
  {
    icon: DollarSign,
    title: 'Dépôts PayPal',
    questions: [
      { q: 'Quel est le montant minimum pour un dépôt PayPal ?', a: 'Le montant minimum est de 10 $ USD. Le maximum dépend de votre niveau de vérification.' },
      { q: 'Combien de temps prend un dépôt PayPal ?', a: 'Le dépôt est crédité instantanément sur votre wallet dès que PayPal confirme la transaction.' },
      { q: 'Quels sont les frais pour un dépôt PayPal ?', a: 'Les frais sont de 5 % du montant brut. Par exemple, pour 100 $ déposés, vous recevez 95 $ sur votre wallet.' },
      { q: 'Puis-je utiliser un compte PayPal business ?', a: 'Oui, les comptes PayPal personnels et business sont acceptés.' },
    ],
  },
  {
    icon: Smartphone,
    title: 'Mobile Money',
    questions: [
      { q: 'Quels opérateurs Mobile Money sont supportés ?', a: 'Nous supportons MTN Mobile Money, Orange Money, Wave, Moov, Airtel Money, M-Pesa, Free Money, Tigo Cash, Mobicash et Safaricom dans 54 pays africains.' },
      { q: 'Combien de temps prend un dépôt Mobile Money ?', a: 'Le dépôt est généralement traité en quelques minutes après confirmation sur votre téléphone.' },
      { q: 'Puis-je déposer en devise locale ?', a: 'Oui, selon le pays, vous pouvez choisir entre USD et la devise locale (XOF, XAF, GHS, KES, NGN, etc.).' },
      { q: 'Pourquoi ma transaction Mobile Money a échoué ?', a: 'Les échecs peuvent être dus à un solde insuffisant, un opérateur temporairement indisponible, ou un numéro incorrect. Vérifiez vos informations et réessayez.' },
    ],
  },
  {
    icon: Globe,
    title: 'Virement Bancaire / IBAN',
    questions: [
      { q: 'Comment créer un IBAN virtuel ?', a: 'Rendez-vous dans la page IBAN depuis la sidebar, sélectionnez votre pays parmi 14 pays SEPA, et créez votre IBAN. Le premier est gratuit.' },
      { q: 'Combien coûte un IBAN supplémentaire ?', a: 'Les IBAN supplémentaires coûtent 5 $ chacun, déduits de votre wallet.' },
      { q: 'Quels pays SEPA sont disponibles ?', a: 'France, Allemagne, Italie, Espagne, Belgique, Pays-Bas, Portugal, Irlande, Autriche, Finlande, Grèce, Luxembourg, Slovénie, Estonie.' },
      { q: 'Combien de temps prend un virement SEPA ?', a: 'Les virements SEPA arrivent généralement sous 1 à 3 jours ouvrés.' },
    ],
  },
  {
    icon: Bitcoin,
    title: 'Crypto',
    questions: [
      { q: 'Quelles cryptos sont supportées ?', a: 'BTC (Bitcoin), ETH (Ethereum), USDT (Tether), USDC (USD Coin), SOL (Solana), XRP (Ripple), BNB (Binance Coin), TRX (TRON).' },
      { q: 'Quel est le montant minimum pour un dépôt crypto ?', a: 'Le minimum varie selon la crypto. Consultez la page Crypto dans votre espace pour les limites actuelles.' },
      { q: 'Combien de confirmations sont nécessaires ?', a: 'Cela dépend du réseau. Généralement : BTC (2 confirmations), ETH (12), USDT/TRC20 (20).' },
      { q: 'Puis-je retirer des cryptos depuis mon wallet ?', a: 'Oui, les retraits crypto sont disponibles et soumis à des frais de 2 %. Note : les retraits sont réservés aux administrateurs.' },
    ],
  },
  {
    icon: CreditCard,
    title: 'Cartes Virtuelles',
    questions: [
      { q: 'Comment créer une carte virtuelle ?', a: 'Depuis la page Cartes, cliquez sur "Créer une carte". Choisissez le pays, définissez un plafond si souhaité, et confirmez. Les frais de création sont de 2 $.' },
      { q: 'Où puis-je utiliser ma carte virtuelle ?', a: 'Partout où les cartes Visa/Mastercard sont acceptées en ligne : abonnements, achats, services digitaux, etc.' },
      { q: 'Comment voir mon numéro de carte et mon CVV ?', a: 'Depuis la page Cartes, cliquez sur le bouton "Afficher" pour révéler le numéro et le CVV. Vous pouvez également copier les informations.' },
      { q: 'Puis-je annuler ma carte ?', a: 'Oui, depuis la page Cartes, cliquez sur "Annuler la carte". Cette action est irréversible.' },
    ],
  },
  {
    icon: ArrowLeftRight,
    title: 'Transferts & Retraits',
    questions: [
      { q: 'Quels sont les frais de transfert PM → PM ?', a: 'Les transferts entre utilisateurs PayMaestro sont gratuits (0 % de frais).' },
      { q: 'Combien de temps prend un retrait vers Mobile Money ?', a: 'Les retraits sont généralement traités en quelques minutes.' },
      { q: 'Y a-t-il une limite de retrait ?', a: 'Oui, les limites dépendent de votre niveau de vérification KYC. Plus votre vérification est complète, plus vos limites sont élevées.' },
      { q: 'Puis-je annuler une transaction ?', a: 'Une fois confirmée, une transaction ne peut pas être annulée automatiquement. Contactez le support pour assistance.' },
    ],
  },
  {
    icon: Shield,
    title: 'Sécurité & Compte',
    questions: [
      { q: 'Comment activer la 2FA ?', a: 'Accédez à votre Profil > onglet Sécurité, et activez l\'authentification à deux facteurs avec Google Authenticator.' },
      { q: 'Que faire si j\'ai oublié mon mot de passe ?', a: 'Utilisez la fonction "Mot de passe oublié" sur la page de connexion pour réinitialiser votre mot de passe.' },
      { q: 'Comment mettre à jour mes informations personnelles ?', a: 'Depuis la page Profil, vous pouvez modifier votre nom, prénom, date de naissance, pays et adresse (limité à 1 fois tous les 30 jours).' },
      { q: 'Mon compte est gelé, que faire ?', a: 'Contactez le support via le chatbot ou par email à support@paymaestro.com pour débloquer votre compte.' },
    ],
  },
  {
    icon: Users,
    title: 'Parrainage',
    questions: [
      { q: 'Comment fonctionne le parrainage ?', a: 'Partagez votre code de parrainage unique. Quand un filleul s\'inscrit et effectue sa première transaction payante, vous recevez une commission.' },
      { q: 'Où trouver mon code de parrainage ?', a: 'Votre code est disponible dans la page Parrainage depuis la sidebar.' },
    ],
  },
];

export default function FaqPage() {
  const locale = useLocale();
  const [search, setSearch] = useState('');
  const [openCategory, setOpenCategory] = useState<string | null>(null);

  const toggleCategory = (title: string) => {
    setOpenCategory(prev => prev === title ? null : title);
  };

  const filteredFaqs = faqCategories
    .map(cat => ({
      ...cat,
      questions: cat.questions.filter(
        q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter(cat => cat.questions.length > 0);

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <Link href={`/${locale}/docs`} className="p-2 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <BookOpen className="w-5 h-5" />
        </Link>
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400 dark:text-slate-500">
            <Link href={`/${locale}/docs`} className="hover:text-violet-600 dark:hover:text-violet-400 transition-colors">Documentation</Link>
            <span>/</span>
            <span className="text-slate-600 dark:text-slate-300">FAQ</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Foire aux questions</h1>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <input
          type="text"
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Rechercher une question..."
          className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-colors"
        />
      </div>

      {/* FAQ Categories */}
      <div className="space-y-4">
        {(search ? filteredFaqs : faqCategories).map((category) => (
          <Card key={category.title} className="border-slate-100 dark:border-slate-700 overflow-hidden">
            <button
              onClick={() => toggleCategory(category.title)}
              className="w-full flex items-center justify-between p-5 text-left hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <category.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 dark:text-white">{category.title}</h3>
                  <p className="text-xs text-slate-400 dark:text-slate-500">{category.questions.length} question{category.questions.length > 1 ? 's' : ''}</p>
                </div>
              </div>
              <ChevronDown className={`w-5 h-5 text-slate-400 transition-transform duration-200 ${openCategory === category.title ? 'rotate-180' : ''}`} />
            </button>

            {openCategory === category.title && (
              <div className="border-t border-slate-100 dark:border-slate-700 divide-y divide-slate-100 dark:divide-slate-700">
                {category.questions.map((item, i) => (
                  <div key={i} className="p-5 space-y-2">
                    <h4 className="font-medium text-slate-900 dark:text-white text-sm">{item.q}</h4>
                    <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{item.a}</p>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ))}

        {(search ? filteredFaqs : faqCategories).length === 0 && (
          <div className="text-center py-12 text-slate-400 dark:text-slate-500">
            <HelpCircle className="w-10 h-10 mx-auto mb-2 opacity-50" />
            <p>Aucune question trouvée pour &quot;{search}&quot;</p>
          </div>
        )}
      </div>

      {/* Still need help */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vous ne trouvez pas votre réponse ?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Notre équipe support est disponible 24h/24 et 7j/7.</p>
        <Link href={`/${locale}/contact`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          Contacter le Support
        </Link>
      </section>
    </div>
  );
}
