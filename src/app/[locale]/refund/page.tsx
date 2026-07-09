'use client';

import { useLocale } from 'next-intl';
import { Scale, AlertTriangle, FileText, Shield, RefreshCw, Clock, Ban, Mail } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function RefundPage() {
  const locale = useLocale();

  const sections = [
    {
      icon: Scale,
      title: '1. Principes Généraux des Remboursements',
      content: 'En raison de la nature instantanée et automatisée des réseaux de transfert de fonds (Mobile Money, passerelles bancaires et transactions Blockchain), toute transaction exécutée avec succès et validée par les réseaux partenaires est, par principe, définitive et irrévocable.',
    },
    {
      icon: AlertTriangle,
      title: '2. Responsabilité de l\'Utilisateur et Validation des Informations',
      content: 'Avant de confirmer chaque transaction, un modal d\'avertissement s\'affiche sur l\'interface pour récapituler les informations saisies. L\'utilisateur est strictement et exclusivement responsable de la vérification de l\'exactitude des coordonnées fournies (numéro de téléphone Mobile Money, adresse email PayPal, numéro de compte bancaire/SWIFT, adresse crypto). Si une transaction est envoyée vers des coordonnées externes erronées saisies par l\'utilisateur, PayMaestro ne pourra en aucun cas être tenu responsable, et aucun remboursement externe ne pourra être effectué. Nos systèmes n\'ont aucun droit de regard ni pouvoir de retrait sur les comptes bancaires ou numéros Mobile Money gérés par des opérateurs tiers.',
    },
    {
      icon: FileText,
      title: '3. Cas particulier — Erreur de frappe interne',
      content: 'Si l\'utilisateur commet une erreur de frappe et saisit le numéro ou l\'identifiant d\'un autre utilisateur déjà inscrit sur PayMaestro, il doit contacter le support immédiatement. Si la réclamation est reçue à temps, PayMaestro interviendra de manière conservatoire pour geler temporairement le compte PayMaestro du destinataire erroné afin de bloquer les fonds et d\'entamer une procédure interne de médiation. Si les fonds ont déjà été retirés de la plateforme par ce destinataire, PayMaestro ne pourra plus interférer.',
    },
    {
      icon: RefreshCw,
      title: '4. Éligibilité aux Remboursements Internes',
      content: 'Un utilisateur peut solliciter un remboursement uniquement dans les cas techniques internes suivants : Erreur technique exclusive au système (double débit involontaire généré par l\'application, ou fonds effectivement débités de la source externe mais non crédités sur le wallet PayMaestro après les délais réglementaires de traitement). Échec technique d\'un canal tiers (transaction marquée comme définitivement échouée ou suspendue par un partenaire de distribution alors que le compte source de l\'utilisateur a été débité).',
    },
    {
      icon: Shield,
      title: '5. Traitement des Frais et Commissions',
      content: 'Frais de service non remboursables : lorsqu\'un geste commercial ou une résolution à l\'amiable est accordé suite à une erreur commise par l\'utilisateur, les commissions de transaction et les frais de service de PayMaestro (frais d\'opérateurs, commissions FX) ne sont pas restitués. Ils couvrent les frais techniques facturés par nos partenaires d\'infrastructure. Erreur imputable à PayMaestro : si le problème provient exclusivement d\'une défaillance technique interne de PayMaestro, l\'intégralité du montant brut (frais inclus) sera créditée à nouveau sur le compte de l\'utilisateur.',
    },
    {
      icon: Clock,
      title: '6. Méthode Unique de Restitution : Le Wallet PayMaestro',
      content: 'Tout remboursement validé par notre équipe d\'administration s\'effectue exclusivement sous forme de crédit sur le portefeuille (Wallet) PayMaestro de l\'utilisateur. Aucune rétrocession directe vers un compte bancaire externe, un compte PayPal externe ou un réseau Mobile Money externe ne sera opérée par nos administrateurs. Le recrédit sur le Wallet PayMaestro est immédiat dès que l\'équipe de conformité valide l\'anomalie sur la console d\'administration. Il appartient ensuite à l\'utilisateur de réinitialiser son retrait en veillant à saisir des coordonnées correctes.',
    },
    {
      icon: Ban,
      title: '7. Lutte contre la Fraude et les Rétrofacturations',
      content: 'PayMaestro applique une politique de tolérance zéro à l\'égard des fausses déclarations et des rétrofacturations abusives. Toute tentative d\'initier un litige injustifié auprès de PayPal ou d\'un émetteur bancaire pour une transaction correctement traitée sur notre plateforme entraînera la suspension immédiate et définitive du compte PayMaestro, le gel total des avoirs restants pour enquête, et l\'inscription de l\'identité de l\'utilisateur sur nos listes de surveillance anti-fraude.',
    },
    {
      icon: Mail,
      title: '8. Procédure de Réclamation et Contact',
      content: 'L\'utilisateur doit initier une réclamation officielle via le chatbot de la plateforme ou en écrivant à support@paymaestro.com dans un délai maximal de 30 jours calendaires suivant la date de l\'opération. Le ticket doit contenir l\'identifiant unique de la transaction (Order ID), la preuve de débit originale du canal émetteur (SMS de l\'opérateur, reçu bancaire) et le motif clair de la demande. L\'équipe de support s\'engage à analyser le dossier et à apporter une réponse définitive sous 48 à 72 heures ouvrées.',
    },
  ];

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">Politique de Remboursement et de Règlement des Litiges</h1>
        <p className="text-slate-500 dark:text-slate-400">Dernière mise à jour : Juillet 2026</p>
      </div>

      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 rounded-2xl p-6 mb-8 text-center">
        <Scale className="w-8 h-8 text-amber-600 dark:text-amber-300 mx-auto mb-2" />
        <p className="text-sm text-amber-800 dark:text-amber-300 font-medium">
          Chez PayMaestro, nous nous efforçons de fournir une infrastructure de paiement transparente, sécurisée et fiable. Cette politique définit les conditions, les limites de responsabilité et les procédures applicables aux demandes de remboursement et à la gestion des litiges au sein de notre plateforme.
        </p>
      </div>

      <div className="space-y-4">
        {sections.map((section) => (
          <Card key={section.title} className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-6 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
                  <section.icon className="w-4 h-4 text-amber-600 dark:text-amber-300" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white">{section.title}</h3>
              </div>
              <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{section.content}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-8 text-center text-sm text-slate-400 dark:text-slate-500">
        <p>Pour tout signalement urgent : <a href="mailto:support@paymaestro.com" className="text-violet-600 dark:text-violet-400 hover:underline">support@paymaestro.com</a></p>
      </div>
    </div>
  );
}
