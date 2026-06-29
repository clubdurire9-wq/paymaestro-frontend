'use client';

import { useState } from 'react';
import { Shield, AlertTriangle, CheckCircle2, HelpCircle, FileText, Copy, Eye, EyeOff, Building, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

export default function AdminProtocolPage() {
  const [showAnswers, setShowAnswers] = useState(false);
  const [activeTab, setActiveTab] = useState<'mobile' | 'bank' | 'paypal' | 'stripe' | 'pm2pm' | 'bank2wallet' | 'mobile2wallet' | 'crypto'>('mobile');

  const tabs = [
    { id: 'mobile' as const, label: '📱 Mobile Money', icon: '📱' },
    { id: 'bank' as const, label: '🏦 Banque', icon: '🏦' },
    { id: 'paypal' as const, label: '💳 PayPal', icon: '💳' },
    { id: 'stripe' as const, label: '🏦 Stripe/IBAN', icon: '🏦' },
    { id: 'pm2pm' as const, label: '🔄 PM→PM', icon: '🔄' },
    { id: 'bank2wallet' as const, label: '🏦 Banque→Wallet', icon: '🏦' },
    { id: 'mobile2wallet' as const, label: '📱 Mobile→Wallet', icon: '📱' },
    { id: 'crypto' as const, label: '🪙 Crypto', icon: '🪙' },
  ];

  const mobileQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT de la transaction (en dollars et en devise locale) ?", why: "Un hacker ne connaît pas le montant précis", trap: "Demander les DEUX montants : USD et local" },
    { q: "Quel numéro de téléphone avez-vous utilisé pour ce retrait ?", why: "Comparer avec les logs", trap: "Le hacker peut avoir un numéro différent" },
    { q: "À quelle date et heure PRÉCISE avez-vous fait ce transfert ?", why: "Vérifier dans l'historique", trap: "Demander l'heure exacte (±30 min toléré)" },
    { q: "Quel opérateur avez-vous sélectionné (Orange, MTN, Airtel...) ?", why: "Confirmer le choix technique", trap: "Beaucoup oublient l'opérateur" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const bankQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT du virement bancaire ?", why: "Un hacker ne connaît pas le montant précis", trap: "Demander le montant en USD et la devise de destination" },
    { q: "Quel est l'IBAN complet du compte destinataire ?", why: "Vérifier que le compte existe bien", trap: "Un hacker ne connaît pas l'IBAN exact" },
    { q: "Quel est le nom du titulaire du compte bancaire ?", why: "Confirmer l'identité du destinataire", trap: "Le nom doit correspondre aux logs" },
    { q: "Dans quel pays se trouve la banque destinataire ?", why: "Vérifier la cohérence géographique", trap: "Croiser avec l'IBAN (code pays)" },
    { q: "Quel est le SWIFT/BIC de la banque ?", why: "Confirmer les détails techniques", trap: "Peu de gens connaissent leur SWIFT par cœur" },
    { q: "À quelle date et heure avez-vous initié ce virement ?", why: "Vérifier dans l'historique", trap: "Demander l'heure exacte" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const paypalQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT du retrait PayPal ?", why: "Un hacker ne connaît pas le montant précis", trap: "Demander le montant en USD" },
    { q: "Quel est l'email PayPal associé à votre compte ?", why: "Confirmer que le compte PayPal lui appartient", trap: "Un hacker peut donner un faux email" },
    { q: "À quelle date avez-vous fait ce retrait ?", why: "Vérifier dans l'historique", trap: "Demander la date précise" },
    { q: "Quel était le solde de votre compte PayPal avant le retrait ?", why: "Seul le vrai propriétaire connaît cette info", trap: "Information très personnelle" },
    { q: "Avez-vous reçu une confirmation de PayPal pour cette transaction ?", why: "Vérifier l'email PayPal de confirmation", trap: "Demander de transférer l'email PayPal" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const stripeQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT du paiement reçu sur votre IBAN ?", why: "Un hacker ne connaît pas le montant précis", trap: "Demander le montant en euros" },
    { q: "Qui vous a envoyé ce paiement ? (Nom du client)", why: "Vérifier l'origine du virement", trap: "Un hacker ne connaît pas l'expéditeur" },
    { q: "Quel est votre IBAN Stripe ?", why: "Vérifier que l'IBAN lui appartient", trap: "Demander les 8 derniers caractères" },
    { q: "Depuis combien de temps avez-vous votre IBAN Stripe ?", why: "Vérifier la cohérence", trap: "Si < 24h → suspect" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const pm2pmQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT envoyé ?", why: "Vérifier la transaction", trap: "Demander le montant précis" },
    { q: "Quel est l'email du destinataire ?", why: "Vérifier que vous connaissez le destinataire", trap: "Un hacker peut inventer un email" },
    { q: "Quel est le nom complet du destinataire ?", why: "Vérifier que vous connaissez la personne", trap: "Croiser avec le profil" },
    { q: "Depuis combien de temps connaissez-vous ce destinataire ?", why: "Détecter les transferts suspects", trap: "Si < 24h → suspect" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const bank2walletQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel montant avez-vous déposé par virement bancaire ?", why: "Vérifier le montant exact", trap: "Demander le montant et la devise" },
    { q: "Depuis quelle banque avez-vous fait le virement ?", why: "Vérifier l'origine des fonds", trap: "Croiser avec l'IBAN expéditeur" },
    { q: "Quand avez-vous effectué ce virement ?", why: "Vérifier la date", trap: "Demander la date précise" },
    { q: "Quel est votre IBAN Stripe ?", why: "Vérifier que l'IBAN lui appartient", trap: "Demander les 8 derniers caractères" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const mobile2walletQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel est le montant EXACT que vous avez déposé (en devise locale) ?", why: "Vérifier le montant du dépôt", trap: "Demander le montant en devise locale et l'équivalent USD" },
    { q: "Quel numéro de téléphone avez-vous utilisé pour ce dépôt ?", why: "Comparer avec les logs", trap: "Le hacker peut avoir un numéro différent" },
    { q: "Quel opérateur avez-vous utilisé (Orange, MTN, Airtel...) ?", why: "Confirmer le choix technique", trap: "Beaucoup oublient l'opérateur" },
    { q: "Quel est le nom associé à votre compte Mobile Money ?", why: "Vérifier que le compte lui appartient", trap: "Croiser avec Flutterwave lookup" },
    { q: "À quelle date et heure avez-vous fait ce dépôt ?", why: "Vérifier dans l'historique", trap: "Demander l'heure exacte (±30 min toléré)" },
    { q: "Quel était le solde de votre wallet AVANT ce dépôt ?", why: "Seul le vrai propriétaire connaît cette info", trap: "Information très personnelle" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", why: "Vérifier la localisation", trap: "Comparer avec la géolocalisation de l'IP", geoCheck: true },
  ];

  const cryptoQuestions = [
    { q: "Quel est votre email connecté ?", why: "Vérifier que c'est bien son compte", trap: "Un hacker ne connaîtra pas l'email exact" },
    { q: "Quel montant EXACT avez-vous déposé/retiré en crypto ?", why: "Vérifier la transaction", trap: "Demander le montant en crypto ET en USD" },
    { q: "Quelle crypto avez-vous utilisée (BTC, USDT, ETH) ?", why: "Confirmer la devise", trap: "Beaucoup confondent USDT et BTC" },
    { q: "Sur quel réseau avez-vous fait la transaction (TRC20, BEP20, ERC20) ?", why: "Vérifier le réseau utilisé", trap: "Peu de gens connaissent le réseau" },
    { q: "Quelle est votre adresse de destination ?", why: "Vérifier que l'adresse lui appartient", trap: "Demander les 8 premiers et derniers caractères" },
    { q: "Depuis quel wallet/app avez-vous envoyé la crypto ?", why: "Vérifier l'origine", trap: "Croiser avec les logs" },
  ];

  const mobileTraps = [
    { q: "Pouvez-vous me dire le nom COMPLET du destinataire que vous avez saisi par erreur ?", trap: "Un hacker ne connaît pas le nom sur le compte Mobile Money", flag: "Si réponse = 'Je ne sais pas' → légitime. Si réponse précise → suspect" },
    { q: "Combien de transferts avez-vous effectués AU TOTAL sur PayMaestro ?", trap: "Un hacker ne connaît pas l'historique complet", flag: "Vérifier dans les stats du user" },
    { q: "Quel était le montant de votre AVANT-DERNIER transfert ?", trap: "Seul le vrai propriétaire connaît son historique", flag: "Si réponse = 'Je ne me souviens pas' → OK. Si réponse précise et fausse → danger" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", trap: "Vérifier l'IP/la localisation dans les logs", flag: "Si pays différent → ALERTE ROUGE" },
    { q: "Quel est le NOM complet associé à votre compte Mobile Money ?", trap: "Le vrai propriétaire connaît le nom enregistré chez l'opérateur", flag: "Vérifier via Flutterwave lookup" },
    { q: "À quand remonte votre DERNIÈRE CONNEXION avant ce transfert ?", trap: "Croiser avec les logs de connexion", flag: "Si incohérence → bloquer" },
  ];

  const bankTraps = [
    { q: "Depuis combien de temps avez-vous ce compte bancaire ?", trap: "Un hacker ne connaît pas l'ancienneté du compte", flag: "Si < 1 mois → suspect" },
    { q: "Quel est le nom de votre banque et l'adresse de l'agence ?", trap: "Peu de gens connaissent l'adresse exacte", flag: "Vérifier via SWIFT lookup" },
    { q: "Avez-vous déjà fait un virement bancaire sur PayMaestro avant ?", trap: "Vérifier l'historique bancaire du user", flag: "Si première fois + montant élevé → suspect" },
    { q: "Quel est le solde approximatif de votre compte bancaire ?", trap: "Information très personnelle", flag: "Si réponse trop précise → suspect. Si 'je ne sais pas' → OK" },
  ];

  const paypalTraps = [
    { q: "Depuis combien de temps avez-vous ce compte PayPal ?", trap: "Un hacker ne connaît pas l'ancienneté", flag: "Si < 1 mois → suspect" },
    { q: "Quel est le pays associé à votre compte PayPal ?", trap: "Vérifier la cohérence avec la localisation", flag: "Si pays différent de l'IP → ALERTE" },
    { q: "Avez-vous déjà reçu un remboursement PayPal sur PayMaestro ?", trap: "Vérifier l'historique des litiges", flag: "Si litiges fréquents → suspect" },
    { q: "Pouvez-vous me montrer la confirmation PayPal de cette transaction ?", trap: "Seul le vrai propriétaire a accès à l'email PayPal", flag: "Si refus → suspect" },
  ];

  const stripeTraps = [
    { q: "Quel était le solde de votre wallet avant ce paiement ?", trap: "Seul le vrai propriétaire connaît cette info", flag: "Si réponse précise et fausse → danger" },
    { q: "Combien de paiements avez-vous reçus via votre IBAN Stripe ?", trap: "Un hacker ne connaît pas l'historique", flag: "Vérifier dans les logs" },
    { q: "Avez-vous déjà partagé votre IBAN avec quelqu'un d'autre ?", trap: "Détecter un partage frauduleux", flag: "Si oui → escalader" },
  ];

  const pm2pmTraps = [
    { q: "Quel est le prénom du destinataire ?", trap: "Un hacker ne connaît pas les détails personnels", flag: "Si hésitation → suspect" },
    { q: "Quand avez-vous effectué votre dernier transfert PM→PM ?", trap: "Vérifier la cohérence avec l'historique", flag: "Si incohérence → ALERTE" },
    { q: "Quelle est la raison de ce transfert ?", trap: "Détecter les motifs frauduleux", flag: "Si raison vague ou suspecte → escalader" },
    { q: "Le destinataire vous a-t-il déjà envoyé de l'argent auparavant ?", trap: "Vérifier la relation entre les deux comptes", flag: "Si transferts croisés fréquents → suspect" },
  ];

  const bank2walletTraps = [
    { q: "Quel était le solde de votre compte bancaire avant le virement ?", trap: "Information très personnelle", flag: "Si réponse trop précise → suspect" },
    { q: "Avez-vous déjà fait un dépôt bancaire sur PayMaestro avant ?", trap: "Vérifier l'historique", flag: "Si première fois + montant élevé → vérifier" },
    { q: "Pourquoi utilisez-vous un dépôt bancaire plutôt qu'un autre moyen ?", trap: "Détecter les justifications frauduleuses", flag: "Si réponse évasive → suspect" },
  ];

  const mobile2walletTraps = [
    { q: "Combien de dépôts Mobile Money avez-vous effectués AU TOTAL ?", trap: "Un hacker ne connaît pas l'historique complet", flag: "Vérifier dans les stats du user" },
    { q: "Depuis quel PAYS et quelle VILLE vous connectez-vous habituellement ?", trap: "Vérifier l'IP/la localisation dans les logs", flag: "Si pays différent → ALERTE ROUGE" },
    { q: "Avez-vous déjà fait un dépôt Mobile Money sur un autre compte PayMaestro ?", trap: "Détecter les comptes multiples", flag: "Si oui → suspect" },
    { q: "Quel était le solde de votre compte Mobile Money avant ce dépôt ?", trap: "Information très personnelle", flag: "Si réponse trop précise → suspect. Si 'je ne sais pas' → OK" },
    { q: "Pourquoi déposez-vous via Mobile Money plutôt que PayPal ou banque ?", trap: "Détecter les justifications frauduleuses", flag: "Si réponse évasive → suspect" },
    { q: "À quand remonte votre DERNIÈRE CONNEXION avant ce dépôt ?", trap: "Croiser avec les logs de connexion", flag: "Si incohérence → bloquer" },
  ];

  const cryptoTraps = [
    { q: "Combien de transactions crypto avez-vous faites sur PayMaestro ?", trap: "Un hacker ne connaît pas l'historique", flag: "Vérifier dans les stats" },
    { q: "Quel est le TX Hash de votre transaction ?", trap: "Seul le vrai propriétaire peut le voir sur la blockchain", flag: "Si incapable de fournir → suspect" },
    { q: "Depuis combien de temps utilisez-vous les cryptos ?", trap: "Détecter les novices qui se font pirater", flag: "Si < 1 mois → risque élevé" },
  ];

  const currentQuestions = activeTab === 'mobile' ? mobileQuestions : activeTab === 'bank' ? bankQuestions : activeTab === 'paypal' ? paypalQuestions : activeTab === 'stripe' ? stripeQuestions : activeTab === 'pm2pm' ? pm2pmQuestions : activeTab === 'bank2wallet' ? bank2walletQuestions : activeTab === 'mobile2wallet' ? mobile2walletQuestions : cryptoQuestions;
  const currentTraps = activeTab === 'mobile' ? mobileTraps : activeTab === 'bank' ? bankTraps : activeTab === 'paypal' ? paypalTraps : activeTab === 'stripe' ? stripeTraps : activeTab === 'pm2pm' ? pm2pmTraps : activeTab === 'bank2wallet' ? bank2walletTraps : activeTab === 'mobile2wallet' ? mobile2walletTraps : cryptoTraps;

  const defaultRefundOptions = [
    { option: 'Option 1', title: 'Recharger le Wallet USD', desc: 'L\'argent est remis sur le portefeuille PayMaestro. Immédiat.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer sur le bon numéro/compte', desc: 'Transfert vers le vrai numéro/compte.', icon: '📱' },
    { option: 'Option 3', title: 'Rembourser sur autre méthode', desc: 'Méthode alternative de remboursement.', icon: '💳' },
  ];

  const stripeRefundOptions = [
    { option: 'Option 1', title: 'Recharger le Wallet USD', desc: 'L\'argent est remis sur le portefeuille PayMaestro. Immédiat.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer sur le Mobile Money', desc: 'Transfert Mobile Money vers le numéro du bénéficiaire.', icon: '📱' },
    { option: 'Option 3', title: 'Rembourser sur le compte bancaire', desc: 'Virement SEPA vers l\'IBAN du bénéficiaire.', icon: '🏦' },
  ];

  const pm2pmRefundOptions = [
    { option: 'Option 1', title: 'Recharger le Wallet USD', desc: 'L\'argent est remis sur le portefeuille PayMaestro. Immédiat.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer au destinataire', desc: 'Transfert PM→PM vers le destinataire correct.', icon: '🔄' },
    { option: 'Option 3', title: 'Rembourser sur Mobile Money', desc: 'Transfert Mobile Money comme alternative.', icon: '📱' },
  ];

  const bank2walletRefundOptions = [
    { option: 'Option 1', title: 'Créditer le Wallet USD', desc: 'L\'argent est remis sur le portefeuille. Immédiat.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer sur le compte bancaire', desc: 'Virement SEPA vers l\'IBAN du bénéficiaire.', icon: '🏦' },
    { option: 'Option 3', title: 'Contacter la banque', desc: 'Médiation avec la banque émettrice.', icon: '📧' },
  ];

  const mobile2walletRefundOptions = [
    { option: 'Option 1', title: 'Recharger le Wallet USD', desc: 'L\'argent est remis sur le portefeuille PayMaestro. Immédiat.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer sur le Mobile Money', desc: 'Transfert vers le numéro Mobile Money du bénéficiaire.', icon: '📱' },
    { option: 'Option 3', title: 'Rembourser via autre méthode', desc: 'PayPal, Banque ou Stripe selon préférence.', icon: '💳' },
  ];

  const cryptoRefundOptions = [
    { option: 'Option 1', title: 'Recharger le Wallet USD', desc: 'Remboursement immédiat sur le portefeuille.', icon: '🏦' },
    { option: 'Option 2', title: 'Renvoyer la crypto', desc: 'Renvoi vers la même adresse ou une nouvelle adresse.', icon: '🪙' },
    { option: 'Option 3', title: 'Rembourser via autre méthode', desc: 'Mobile Money, Banque ou PayPal.', icon: '💳' },
  ];

  const refundOptions = activeTab === 'stripe' ? stripeRefundOptions : activeTab === 'pm2pm' ? pm2pmRefundOptions : activeTab === 'bank2wallet' ? bank2walletRefundOptions : activeTab === 'mobile2wallet' ? mobile2walletRefundOptions : activeTab === 'crypto' ? cryptoRefundOptions : defaultRefundOptions;

  // Simuler des données de claim (à remplacer par une vraie API)
  const claimData = {
    userGeo: {
      geo: {
        city: "Paris",
        country: "France",
        countryCode: "FR",
      },
      isp: "Orange France",
    },
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Shield className="w-8 h-8 text-red-600" />
        <h1 className="text-3xl font-bold text-slate-900">Protocole de Remboursement</h1>
      </div>
      <p className="text-slate-500 -mt-4">Procédure officielle à suivre pour toute demande de remboursement.</p>

      {/* ONGLETS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all whitespace-nowrap ${
              activeTab === tab.id ? 'bg-white shadow text-slate-900' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ÉTAPE 1 : QUESTIONS DE VÉRIFICATION */}
      <Card className="border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="w-5 h-5" />
            Étape 1 : Questions de Vérification d'Identité ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Banque' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Banque→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestions.map((item: any, i: number) => (
            <div key={i} className="bg-red-50 p-4 rounded-xl">
              <p className="font-semibold text-red-900">{i + 1}. {item.q}</p>
              <p className="text-xs text-red-600 mt-1">🎯 Objectif : {item.why}</p>
              <p className="text-xs text-red-500 mt-0.5">⚠️ Piège : {item.trap}</p>
              {item.geoCheck && claimData?.userGeo && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <p>📍 Localisation réelle : {claimData.userGeo.geo?.city}, {claimData.userGeo.geo?.country}</p>
                  <p>🌐 FAI : {claimData.userGeo?.isp}</p>
                </div>
              )}
              {showAnswers && !item.geoCheck && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                  ✅ Réponse attendue : <em>Vérifier dans les logs</em>
                </div>
              )}
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ÉTAPE 2 : QUESTIONS PIÈGES */}
      <Card className="border-l-4 border-l-orange-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-700">
            <HelpCircle className="w-5 h-5" />
            Étape 2 : Questions Pièges (Détection de fraude)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentTraps.map((item: any, i: number) => (
            <div key={i} className="bg-orange-50 p-4 rounded-xl">
              <p className="font-semibold text-orange-900">🔶 {currentQuestions.length + i + 1}. {item.q}</p>
              <p className="text-xs text-orange-600 mt-1">⚠️ Piège : {item.trap}</p>
              <p className="text-xs text-orange-500 mt-0.5">🚩 Drapeau : {item.flag}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ÉTAPE 3 : VÉRIFICATION TECHNIQUE */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5" />
            Étape 3 : Vérification Technique
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { check: "Email correspondant", desc: "L'email du user doit matcher celui du compte" },
              { check: "Montant identique", desc: "Même montant que déclaré par le user" },
              { check: "Date/heure cohérente", desc: "Dans les logs (±30 min toléré)" },
              { check: "Pas de remboursement précédent", desc: "Statut ≠ REMBOURSED pour cette transaction" },
              { check: "Historique cohérent", desc: "Pas de transferts multiples vers le même destinataire" },
              { check: "Localisation cohérente", desc: "Même pays/ville que d'habitude" },
              { check: "Nombre de réclamations", desc: "≤ 2 réclamations par an = OK. ≥ 3 = suspect" },
              { check: "Ancienneté du compte", desc: "Compte > 1 mois = fiable. < 1 semaine = dangereux" },
              { check: activeTab === 'bank' ? "IBAN valide" : activeTab === 'paypal' ? "Email PayPal vérifié" : activeTab === 'stripe' ? "IBAN Stripe valide" : activeTab === 'pm2pm' ? "Relation vérifiée" : activeTab === 'bank2wallet' ? "Origine du virement vérifiée" : activeTab === 'mobile2wallet' ? "Numéro Mobile Money vérifié" : activeTab === 'crypto' ? "Adresse crypto vérifiée" : "Numéro vérifié", desc: activeTab === 'bank' ? "Format IBAN correct et pays cohérent" : activeTab === 'paypal' ? "Email PayPal confirmé par le user" : activeTab === 'stripe' ? "Format IBAN valide et vérifié via Stripe" : activeTab === 'pm2pm' ? "Vérifier l'historique des transactions entre les 2 comptes" : activeTab === 'bank2wallet' ? "Vérifier l'IBAN expéditeur et la banque émettrice" : activeTab === 'mobile2wallet' ? "Numéro vérifié via Flutterwave lookup" : activeTab === 'crypto' ? "Adresse vérifiée sur la blockchain" : "Numéro vérifié via Flutterwave" },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl">
                <CheckCircle2 className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-blue-900">{item.check}</p>
                  <p className="text-xs text-blue-600">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* ÉTAPE 4 : SCORE DE CONFIANCE */}
      <Card className="border-l-4 border-l-green-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-700">
            🟢 Étape 4 : Score de Confiance (Décision)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { score: '≥ 8/10', action: '✅ REMBOURSER IMMÉDIATEMENT', color: 'bg-green-100 text-green-800' },
              { score: '5-7/10', action: '⚠️ DEMANDER UNE PIÈCE D\'IDENTITÉ SUPPLÉMENTAIRE', color: 'bg-yellow-100 text-yellow-800' },
              { score: '3-4/10', action: '🔴 ESCALADER AU SUPERVISEUR', color: 'bg-orange-100 text-orange-800' },
              { score: '< 3/10', action: '🚫 REFUSER — FRAUDE PROBABLE', color: 'bg-red-100 text-red-800' },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-xl ${item.color} flex justify-between items-center`}>
                <span className="font-semibold">{item.score}</span>
                <span>{item.action}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-semibold mb-2">📊 Calcul du score ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Banque' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Banque→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'}) :</p>
            <p className="text-xs text-slate-600">
              • Questions d'identité ({currentQuestions.length} questions) = {Math.round(currentQuestions.length * 1)} points<br />
              • Questions pièges ({currentTraps.length} questions) = {Math.round(currentTraps.length * 0.5)} points<br />
              • Vérification technique (9 critères) = 2 points<br />
              <strong>Total : {Math.round(currentQuestions.length * 1 + currentTraps.length * 0.5 + 2)} points maximum</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* OPTIONS DE REMBOURSEMENT */}
      <Card className="border-2 border-violet-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700">
            💳 Options de Remboursement ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Banque' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Banque→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {refundOptions.map((item, i) => (
              <div key={i} className="p-4 bg-violet-50 rounded-xl text-center">
                <span className="text-2xl">{item.icon}</span>
                <p className="font-semibold text-violet-900 mt-2">{item.option}</p>
                <p className="text-sm text-violet-700">{item.title}</p>
                <p className="text-xs text-violet-500 mt-1">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-3">
        <Button variant="outline" onClick={() => setShowAnswers(!showAnswers)} icon={showAnswers ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}>
          {showAnswers ? 'Cacher les réponses' : 'Afficher les réponses'}
        </Button>
        <Button onClick={() => navigator.clipboard.writeText(document.querySelector('.space-y-8')?.textContent || '')} icon={<Copy className="w-4 h-4" />}>
          Copier le protocole
        </Button>
      </div>
    </div>
  );
}