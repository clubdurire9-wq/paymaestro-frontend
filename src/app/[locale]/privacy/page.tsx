'use client';

import { useLocale } from 'next-intl';
import { Shield, Lock, Eye, Database, Globe, Trash2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function PrivacyPage() {
  const locale = useLocale();

  const sections = [
    {
      icon: Database,
      title: '1. Données collectées',
      content: 'Nous collectons les informations suivantes : email (via Google OAuth), nom et prénom, numéro de téléphone Mobile Money, pièce d\'identité (pour KYC), historique des transactions, adresse IP et données de navigation.',
    },
    {
      icon: Eye,
      title: '2. Utilisation des données',
      content: 'Vos données sont utilisées pour : traiter vos transactions, vérifier votre identité (KYC), prévenir la fraude, améliorer nos services, vous contacter en cas de problème, respecter nos obligations légales.',
    },
    {
      icon: Lock,
      title: '3. Stockage et sécurité',
      content: 'Vos données sont stockées sur des serveurs sécurisés avec cryptage AES-256. Les mots de passe sont hashés avec bcrypt. Les connexions sont sécurisées par SSL/TLS. Nous effectuons des audits de sécurité réguliers.',
    },
    {
      icon: Globe,
      title: '4. Transfert international',
      content: 'Vos données peuvent être transférées et stockées dans différents pays où nous opérons. Ces transferts sont effectués conformément aux lois applicables sur la protection des données.',
    },
    {
      icon: Shield,
      title: '5. Partage avec des tiers',
      content: 'Nous partageons vos données uniquement avec : Flutterwave (pour les transferts Mobile Money), PayPal (pour les retraits), Google (pour l\'authentification OAuth). Ces partenaires sont tenus de respecter la confidentialité de vos données.',
    },
    {
      icon: Trash2,
      title: '6. Conservation et suppression',
      content: 'Vos données sont conservées pendant la durée de votre compte plus 5 ans (obligation légale). Vous pouvez demander la suppression de votre compte à tout moment. Les données de transaction sont anonymisées après 10 ans.',
    },
    {
      icon: Lock,
      title: '7. Vos droits',
      content: 'Vous avez le droit d\'accéder, de rectifier et de supprimer vos données. Vous pouvez également vous opposer au traitement et demander la portabilité. Contactez support@paymaestro.com pour exercer ces droits.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Politique de Confidentialité</h1>
        <p className="text-slate-500 dark:text-slate-400">Dernière mise à jour : Juin 2026</p>
      </div>

      <div className="bg-violet-50 dark:bg-violet-950/30 border border-violet-200 dark:border-violet-800/50 rounded-2xl p-6 mb-8 text-center">
        <Shield className="w-8 h-8 text-violet-600 dark:text-violet-300 mx-auto mb-2" />
        <p className="text-sm text-violet-800 dark:text-violet-300 font-medium">
          Chez PayMaestro, la protection de vos données est notre priorité. Nous nous engageons à traiter vos informations personnelles avec le plus grand soin.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-blue-600 dark:text-blue-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>Pour toute question sur notre politique de confidentialité : support@paymaestro.com</p>
      </div>
    </div>
  );
}