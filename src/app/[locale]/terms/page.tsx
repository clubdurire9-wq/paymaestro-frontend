'use client';

import { useLocale } from 'next-intl';
import { Shield, FileText, Lock, Scale } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function TermsPage() {
  const locale = useLocale();

  const sections = [
    {
      icon: Shield,
      title: '1. Acceptation des conditions',
      content: 'En accédant et en utilisant PayMaestro, vous acceptez d\'être lié par les présentes conditions d\'utilisation. Si vous n\'acceptez pas ces conditions, veuillez ne pas utiliser nos services.',
    },
    {
      icon: FileText,
      title: '2. Description du service',
      content: 'PayMaestro est une plateforme financière permettant aux utilisateurs de stocker, envoyer et retirer des fonds via un wallet centralisé sécurisé dans 54 pays africains. Déposez depuis PayPal, Mobile Money, banque ou crypto, puis retirez vers Mobile Money, banque, PayPal, crypto ou carte virtuelle.',
    },
    {
      icon: Scale,
      title: '3. Frais et commissions',
      content: 'Nos frais sont transparents et affichés avant chaque transaction : PayPal → Wallet (5%), Mobile Money → Wallet (3%), Banque → Wallet (2%), Crypto → Wallet (2%), Wallet → Mobile Money (3%), Wallet → Banque (2-5%), Wallet → PayPal (3%), Wallet → Carte (1%+2%FX). Tous les frais sont calculés sur le montant brut en USD.',
    },
    {
      icon: Lock,
      title: '4. Protection des données',
      content: 'Nous collectons uniquement les données nécessaires à la fourniture de nos services (email, numéro de téléphone, pièce d\'identité pour KYC). Vos données sont cryptées et stockées de manière sécurisée. Nous ne partageons jamais vos données avec des tiers sans votre consentement explicite.',
    },
    {
      icon: Shield,
      title: '5. Vérification d\'identité (KYC)',
      content: 'Pour utiliser tous les services PayMaestro, vous devez vérifier votre identité en fournissant une pièce d\'identité valide (passeport, CNI, permis de conduire ou carte d\'électeur). Cette vérification est obligatoire pour les retraits et transferts.',
    },
    {
      icon: FileText,
      title: '6. Limitation de responsabilité',
      content: 'PayMaestro agit en tant qu\'intermédiaire de paiement. Nous ne sommes pas responsables des erreurs de saisie de numéro de téléphone ou de coordonnées bancaires par l\'utilisateur. En cas d\'erreur, contactez immédiatement notre support pour un remboursement.',
    },
    {
      icon: Scale,
      title: '7. Remboursements',
      content: 'Les demandes de remboursement sont traitées au cas par cas par notre équipe. Un remboursement peut être effectué vers votre portefeuille, votre Mobile Money, votre compte PayPal ou votre compte bancaire. Les frais de service ne sont pas remboursables.',
    },
    {
      icon: Lock,
      title: '8. Sécurité du compte',
      content: 'Vous êtes responsable de la sécurité de vos identifiants de connexion. Activez l\'authentification à deux facteurs lorsque disponible. PayMaestro ne vous demandera jamais votre mot de passe par email ou téléphone.',
    },
    {
      icon: Shield,
      title: '9. Modification des conditions',
      content: 'PayMaestro se réserve le droit de modifier ces conditions à tout moment. Les utilisateurs seront notifiés des changements importants par email. L\'utilisation continue de nos services après modification vaut acceptation.',
    },
    {
      icon: Scale,
      title: '10. Contact',
      content: 'Pour toute question concernant ces conditions, contactez notre équipe support via le chatbot sur notre plateforme ou par email à support@paymaestro.com.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Conditions d'Utilisation</h1>
        <p className="text-slate-500 dark:text-slate-400">Dernière mise à jour : Juin 2026</p>
      </div>

      <div className="space-y-6">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-violet-600 dark:text-violet-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>En utilisant PayMaestro, vous acceptez ces conditions d'utilisation.</p>
      </div>
    </div>
  );
}