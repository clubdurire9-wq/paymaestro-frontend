'use client';

import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Rocket, Wallet, CreditCard, Shield, Smartphone, DollarSign, Globe, Bitcoin, ArrowLeftRight, Users, Building, LifeBuoy, CheckCircle, AlertTriangle, ArrowRight, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const sections = [
  {
    id: 'intro',
    icon: Rocket,
    title: 'Qu\'est-ce que PayMaestro ?',
    content: [
      'PayMaestro est une plateforme financière tout-en-un qui vous permet de recevoir des fonds depuis PayPal, Mobile Money, virement bancaire ou crypto, de les stocker dans un wallet centralisé sécurisé, et de les retirer vers le service de votre choix.',
      'Notre mission : offrir aux créateurs africains et à la diaspora un accès simple et rapide aux services financiers digitaux, sans les contraintes des banques traditionnelles.',
    ],
  },
  {
    id: 'account',
    icon: CheckCircle,
    title: 'Créer un compte',
    steps: [
      'Rendez-vous sur la page d\'inscription',
      'Connectez-vous avec votre compte Google ou créez un compte avec votre email',
      'Définissez votre mot de passe',
      'Activez l\'authentification à deux facteurs (recommandé)',
      'Votre wallet est automatiquement créé avec un solde de 0 $',
    ],
  },
  {
    id: 'kyc',
    icon: Shield,
    title: 'Vérification KYC',
    warning: 'La vérification KYC est obligatoire pour effectuer des retraits et transferts.',
    steps: [
      'Accédez à la section "Vérification" depuis la sidebar',
      'Remplissez vos informations légales (nom, prénom, date de naissance, pays, adresse)',
      'Téléchargez un document d\'identité valide (passeport, CNI, permis de conduire, carte d\'électeur)',
      'Soumettez votre demande',
      'Notre équipe traite votre dossier sous 24 à 48 heures',
      'Vous recevrez une notification par email dès l\'approbation',
    ],
  },
  {
    id: 'paypal',
    icon: DollarSign,
    title: 'Dépôt PayPal → Wallet',
    steps: [
      'Depuis la sidebar, cliquez sur "PayPal"',
      'Entrez le montant que vous souhaitez déposer (min 10 $)',
      'Cliquez sur "Payer avec PayPal"',
      'Vous êtes redirigé vers PayPal pour valider le paiement',
      'Les fonds sont automatiquement crédités sur votre wallet PayMaestro',
      'Frais : 5 % du montant brut',
    ],
  },
  {
    id: 'mobile-money',
    icon: Smartphone,
    title: 'Dépôt Mobile Money → Wallet',
    steps: [
      'Accédez à la page Wallet depuis la sidebar',
      'Sélectionnez l\'onglet "Dépôt Mobile Money"',
      'Choisissez votre pays dans la liste (54 pays disponibles)',
      'Sélectionnez votre opérateur (Orange, MTN, Airtel, Wave, etc.)',
      'Entrez votre numéro de téléphone',
      'Indiquez le montant en devise locale',
      'Vous pouvez choisir USD ou devise locale selon les options disponibles',
      'Confirmez la transaction',
      'Vérifiez votre téléphone pour autoriser le paiement',
      'Frais : 3 % du montant',
    ],
  },
  {
    id: 'iban',
    icon: Globe,
    title: 'Virement SEPA / IBAN',
    steps: [
      'Accédez à la page IBAN depuis la sidebar',
      'Sélectionnez votre pays parmi 14 pays SEPA disponibles',
      'Créez votre IBAN virtuel (premier IBAN gratuit, 5 $ les suivants)',
      'Utilisez cet IBAN pour recevoir des virements depuis l\'Europe',
      'Les fonds arrivent sur votre wallet PayMaestro',
      'Frais : 2 % du montant',
    ],
  },
  {
    id: 'crypto',
    icon: Bitcoin,
    title: 'Dépôt Crypto → Wallet',
    steps: [
      'Accédez à la page Crypto depuis la sidebar',
      'Sélectionnez la crypto (BTC, ETH, USDT, USDC, SOL, XRP, BNB, TRX)',
      'Générez une adresse de dépôt',
      'Scannez le QR code ou copiez l\'adresse',
      'Envoyez vos fonds depuis votre portefeuille externe',
      'La transaction est détectée automatiquement (NowPayments)',
      'Les fonds sont crédités sur votre wallet après confirmation réseau',
      'Frais : 2 % du montant',
    ],
  },
  {
    id: 'pm-transfer',
    icon: ArrowLeftRight,
    title: 'Transfert PayMaestro → PayMaestro',
    steps: [
      'Accédez à la page Wallet',
      'Sélectionnez "Transfert PM → PM"',
      'Entrez l\'email ou le numéro de téléphone du destinataire',
      'Indiquez le montant',
      'Confirmez la transaction',
      'Le destinataire reçoit les fonds instantanément',
      'Frais : 0 % (gratuit)',
    ],
  },
  {
    id: 'withdraw-mobile',
    icon: Smartphone,
    title: 'Retrait Wallet → Mobile Money',
    steps: [
      'Dans la page Wallet, sélectionnez l\'onglet "Retrait Mobile Money"',
      'Choisissez le pays et l\'opérateur',
      'Entrez le numéro de téléphone du destinataire',
      'Indiquez le montant',
      'Confirmez la transaction',
      'Les fonds sont envoyés sous quelques minutes',
      'Frais : 3 % du montant',
    ],
  },
  {
    id: 'cards',
    icon: CreditCard,
    title: 'Cartes Virtuelles',
    steps: [
      'Accédez à la page Cartes depuis la sidebar',
      'Cliquez sur "Créer une carte"',
      'Choisissez le pays de la carte',
      'Définissez le plafond (facultatif)',
      'Confirmez la création (frais de 2 $)',
      'Votre carte Visa/Mastercard est créée instantanément',
      'Vous pouvez voir, copier ou masquer le numéro de carte et le CVV',
      'Utilisez-la pour les paiements en ligne partout dans le monde',
    ],
  },
  {
    id: 'referral',
    icon: Users,
    title: 'Programme de Parrainage',
    steps: [
      'Accédez à la page Parrainage depuis la sidebar',
      'Votre code de parrainage unique est automatiquement généré',
      'Partagez votre lien avec vos amis',
      'Lorsqu\'un filleul effectue sa première transaction payante, vous recevez une commission',
      'Suivez vos gains et votre réseau depuis la page Parrainage',
    ],
  },
  {
    id: 'security',
    icon: Shield,
    title: 'Sécurité de votre compte',
    items: [
      { label: 'Authentification', value: '2FA via Google Authenticator disponible dans Profil > Sécurité' },
      { label: 'Chiffrement', value: 'AES-256-GCM pour les données sensibles, SHA-256 pour les audits' },
      { label: 'Protection', value: 'Détection de fraude en temps réel, blocage IP VPN/proxy, rate limiting' },
      { label: 'Conformité', value: 'PCI-DSS, KYC/AML, RGPD' },
      { label: 'Notifications', value: 'Alertes email pour chaque connexion, transaction, changement de mot de passe' },
    ],
  },
];

export default function GettingStartedPage() {
  const locale = useLocale();

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
            <span className="text-slate-600 dark:text-slate-300">Démarrage rapide</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">Guide de démarrage rapide</h1>
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 -mt-4">
        Apprenez à utiliser PayMaestro de A à Z. Créez un compte, vérifiez votre identité et effectuez vos premières transactions.
      </p>

      {/* Table of contents */}
      <Card>
        <CardContent className="p-5">
          <h2 className="font-bold text-slate-900 dark:text-white mb-3">Dans ce guide</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`}
                className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-violet-600 dark:hover:text-violet-400 transition-colors"
              >
                <s.icon className="w-4 h-4 shrink-0" />
                {s.title}
              </a>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Sections */}
      {sections.map((section) => (
        <section key={section.id} id={section.id}>
          <Card className="border-slate-100 dark:border-slate-700 scroll-mt-20">
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <section.icon className="w-5 h-5 text-violet-600 dark:text-violet-400" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
              </div>

              {'content' in section && Array.isArray(section.content) && (
                <div className="space-y-2">
                  {section.content.map((p, i) => (
                    <p key={i} className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{p}</p>
                  ))}
                </div>
              )}

              {'warning' in section && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p className="text-sm text-amber-700 dark:text-amber-300">{section.warning}</p>
                </div>
              )}

              {'steps' in section && (
                <ol className="space-y-2">
                  {section.steps.map((step, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm text-slate-600 dark:text-slate-300">
                      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 text-xs font-bold shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      {step}
                    </li>
                  ))}
                </ol>
              )}

              {'items' in section && Array.isArray(section.items) && (
                <div className="divide-y divide-slate-100 dark:divide-slate-700">
                  {section.items.map((item, i) => (
                    <div key={i} className="flex items-start justify-between py-2 gap-4">
                      <span className="text-sm font-medium text-slate-900 dark:text-white">{item.label}</span>
                      <span className="text-sm text-slate-500 dark:text-slate-400 text-right">{item.value}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      ))}

      {/* Next */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Vous avez fini le guide ?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Consultez la documentation API pour intégrer PayMaestro dans votre application.</p>
        <Link href={`/${locale}/docs/api`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          API Développeur <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
