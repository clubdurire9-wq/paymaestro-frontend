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
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT transaction amount (in dollars and local currency)?", why: "A hacker doesn't know the precise amount", trap: "Ask for BOTH amounts: USD and local" },
    { q: "What phone number did you use for this withdrawal?", why: "Compare with logs", trap: "The hacker may have a different number" },
    { q: "On what EXACT date and time did you make this transfer?", why: "Check in history", trap: "Ask for exact time (±30 min tolerated)" },
    { q: "Which operator did you select (Orange, MTN, Airtel...)?", why: "Confirm the technical choice", trap: "Many forget the operator" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const bankQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT bank transfer amount?", why: "A hacker doesn't know the precise amount", trap: "Ask for the amount in USD and destination currency" },
    { q: "What is the full IBAN of the recipient account?", why: "Verify the account exists", trap: "A hacker won't know the exact IBAN" },
    { q: "What is the name of the bank account holder?", why: "Confirm the recipient's identity", trap: "The name must match the logs" },
    { q: "In which country is the recipient bank located?", why: "Verify geographical consistency", trap: "Cross-check with IBAN (country code)" },
    { q: "What is the bank's SWIFT/BIC code?", why: "Confirm technical details", trap: "Few people know their SWIFT by heart" },
    { q: "On what date and time did you initiate this transfer?", why: "Check in history", trap: "Ask for exact time" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const paypalQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT PayPal withdrawal amount?", why: "A hacker doesn't know the precise amount", trap: "Ask for the amount in USD" },
    { q: "What is the PayPal email associated with your account?", why: "Confirm the PayPal account belongs to them", trap: "A hacker may provide a fake email" },
    { q: "On what date did you make this withdrawal?", why: "Check in history", trap: "Ask for the precise date" },
    { q: "What was your PayPal account balance before the withdrawal?", why: "Only the real owner knows this info", trap: "Very personal information" },
    { q: "Did you receive a PayPal confirmation for this transaction?", why: "Verify the PayPal confirmation email", trap: "Ask to forward the PayPal email" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const stripeQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT payment amount received on your IBAN?", why: "A hacker doesn't know the precise amount", trap: "Ask for the amount in euros" },
    { q: "Who sent you this payment? (Client name)", why: "Verify the origin of the transfer", trap: "A hacker won't know the sender" },
    { q: "What is your Stripe IBAN?", why: "Verify the IBAN belongs to them", trap: "Ask for the last 8 characters" },
    { q: "How long have you had your Stripe IBAN?", why: "Verify consistency", trap: "If < 24h → suspicious" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const pm2pmQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT amount sent?", why: "Verify the transaction", trap: "Ask for the precise amount" },
    { q: "What is the recipient's email?", why: "Verify you know the recipient", trap: "A hacker can make up an email" },
    { q: "What is the recipient's full name?", why: "Verify you know the person", trap: "Cross-check with the profile" },
    { q: "How long have you known this recipient?", why: "Detect suspicious transfers", trap: "If < 24h → suspicious" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const bank2walletQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What amount did you deposit by bank transfer?", why: "Verify the exact amount", trap: "Ask for the amount and currency" },
    { q: "From which bank did you make the transfer?", why: "Verify the source of funds", trap: "Cross-check with sender's IBAN" },
    { q: "When did you make this transfer?", why: "Verify the date", trap: "Ask for the precise date" },
    { q: "What is your Stripe IBAN?", why: "Verify the IBAN belongs to them", trap: "Ask for the last 8 characters" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const mobile2walletQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What is the EXACT amount you deposited (in local currency)?", why: "Verify the deposit amount", trap: "Ask for the amount in local currency and USD equivalent" },
    { q: "What phone number did you use for this deposit?", why: "Compare with logs", trap: "The hacker may have a different number" },
    { q: "Which operator did you use (Orange, MTN, Airtel...)?", why: "Confirm the technical choice", trap: "Many forget the operator" },
    { q: "What is the name associated with your Mobile Money account?", why: "Verify the account belongs to them", trap: "Cross-check with Flutterwave lookup" },
    { q: "On what date and time did you make this deposit?", why: "Check in history", trap: "Ask for exact time (±30 min tolerated)" },
    { q: "What was your wallet balance BEFORE this deposit?", why: "Only the real owner knows this info", trap: "Very personal information" },
    { q: "From which COUNTRY and CITY do you usually connect?", why: "Verify location", trap: "Compare with IP geolocation", geoCheck: true },
  ];

  const cryptoQuestions = [
    { q: "What is your connected email?", why: "Verify it's their account", trap: "A hacker won't know the exact email" },
    { q: "What EXACT amount did you deposit/withdraw in crypto?", why: "Verify the transaction", trap: "Ask for the amount in crypto AND in USD" },
    { q: "Which crypto did you use (BTC, USDT, ETH)?", why: "Confirm the currency", trap: "Many confuse USDT and BTC" },
    { q: "On which network did you make the transaction (TRC20, BEP20, ERC20)?", why: "Verify the network used", trap: "Few people know the network" },
    { q: "What is your destination address?", why: "Verify the address belongs to them", trap: "Ask for the first 8 and last 8 characters" },
    { q: "From which wallet/app did you send the crypto?", why: "Verify the origin", trap: "Cross-check with logs" },
  ];

  const mobileTraps = [
    { q: "Can you tell me the FULL name of the recipient you entered by mistake?", trap: "A hacker doesn't know the name on the Mobile Money account", flag: "If answer = 'I don't know' → legitimate. If precise answer → suspicious" },
    { q: "How many transfers have you made in TOTAL on PayMaestro?", trap: "A hacker doesn't know the full history", flag: "Check in user stats" },
    { q: "What was the amount of your SECOND-LAST transfer?", trap: "Only the real owner knows their history", flag: "If answer = 'I don't remember' → OK. If precise and wrong answer → danger" },
    { q: "From which COUNTRY and CITY do you usually connect?", trap: "Check IP/location in logs", flag: "If different country → RED ALERT" },
    { q: "What is the FULL name associated with your Mobile Money account?", trap: "The real owner knows the name registered with the operator", flag: "Verify via Flutterwave lookup" },
    { q: "When was your LAST LOGIN before this transfer?", trap: "Cross-check with login logs", flag: "If inconsistency → block" },
  ];

  const bankTraps = [
    { q: "How long have you had this bank account?", trap: "A hacker doesn't know the account age", flag: "If < 1 month → suspicious" },
    { q: "What is the name of your bank and branch address?", trap: "Few people know the exact address", flag: "Verify via SWIFT lookup" },
    { q: "Have you ever made a bank transfer on PayMaestro before?", trap: "Check user's bank history", flag: "If first time + high amount → suspicious" },
    { q: "What is the approximate balance of your bank account?", trap: "Very personal information", flag: "If too precise → suspicious. If 'I don't know' → OK" },
  ];

  const paypalTraps = [
    { q: "How long have you had this PayPal account?", trap: "A hacker doesn't know the account age", flag: "If < 1 month → suspicious" },
    { q: "What country is associated with your PayPal account?", trap: "Verify consistency with location", flag: "If country differs from IP → ALERT" },
    { q: "Have you ever received a PayPal refund on PayMaestro?", trap: "Check dispute history", flag: "If frequent disputes → suspicious" },
    { q: "Can you show me the PayPal confirmation for this transaction?", trap: "Only the real owner has access to the PayPal email", flag: "If refusal → suspicious" },
  ];

  const stripeTraps = [
    { q: "What was your wallet balance before this payment?", trap: "Only the real owner knows this info", flag: "If precise and wrong answer → danger" },
    { q: "How many payments have you received via your Stripe IBAN?", trap: "A hacker doesn't know the history", flag: "Check in logs" },
    { q: "Have you ever shared your IBAN with someone else?", trap: "Detect fraudulent sharing", flag: "If yes → escalate" },
  ];

  const pm2pmTraps = [
    { q: "What is the recipient's first name?", trap: "A hacker doesn't know personal details", flag: "If hesitation → suspicious" },
    { q: "When did you make your last PM→PM transfer?", trap: "Verify consistency with history", flag: "If inconsistency → ALERT" },
    { q: "What is the reason for this transfer?", trap: "Detect fraudulent motives", flag: "If vague or suspicious reason → escalate" },
    { q: "Has the recipient sent you money before?", trap: "Verify relationship between the two accounts", flag: "If frequent cross-transfers → suspicious" },
  ];

  const bank2walletTraps = [
    { q: "What was your bank account balance before the transfer?", trap: "Very personal information", flag: "If too precise → suspicious" },
    { q: "Have you ever made a bank deposit on PayMaestro before?", trap: "Check history", flag: "If first time + high amount → verify" },
    { q: "Why are you using a bank deposit instead of another method?", trap: "Detect fraudulent justifications", flag: "If evasive answer → suspicious" },
  ];

  const mobile2walletTraps = [
    { q: "How many Mobile Money deposits have you made in TOTAL?", trap: "A hacker doesn't know the full history", flag: "Check in user stats" },
    { q: "From which COUNTRY and CITY do you usually connect?", trap: "Check IP/location in logs", flag: "If different country → RED ALERT" },
    { q: "Have you ever made a Mobile Money deposit to another PayMaestro account?", trap: "Detect multiple accounts", flag: "If yes → suspicious" },
    { q: "What was your Mobile Money account balance before this deposit?", trap: "Very personal information", flag: "If too precise → suspicious. If 'I don't know' → OK" },
    { q: "Why are you depositing via Mobile Money rather than PayPal or bank?", trap: "Detect fraudulent justifications", flag: "If evasive answer → suspicious" },
    { q: "When was your LAST LOGIN before this deposit?", trap: "Cross-check with login logs", flag: "If inconsistency → block" },
  ];

  const cryptoTraps = [
    { q: "How many crypto transactions have you made on PayMaestro?", trap: "A hacker doesn't know the history", flag: "Check in stats" },
    { q: "What is the TX Hash of your transaction?", trap: "Only the real owner can see it on the blockchain", flag: "If unable to provide → suspicious" },
    { q: "How long have you been using crypto?", trap: "Detect novices who get hacked", flag: "If < 1 month → high risk" },
  ];

  const currentQuestions = activeTab === 'mobile' ? mobileQuestions : activeTab === 'bank' ? bankQuestions : activeTab === 'paypal' ? paypalQuestions : activeTab === 'stripe' ? stripeQuestions : activeTab === 'pm2pm' ? pm2pmQuestions : activeTab === 'bank2wallet' ? bank2walletQuestions : activeTab === 'mobile2wallet' ? mobile2walletQuestions : cryptoQuestions;
  const currentTraps = activeTab === 'mobile' ? mobileTraps : activeTab === 'bank' ? bankTraps : activeTab === 'paypal' ? paypalTraps : activeTab === 'stripe' ? stripeTraps : activeTab === 'pm2pm' ? pm2pmTraps : activeTab === 'bank2wallet' ? bank2walletTraps : activeTab === 'mobile2wallet' ? mobile2walletTraps : cryptoTraps;

  const defaultRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Money is returned to the PayMaestro wallet. Instant.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend to correct number/account', desc: 'Transfer to the real number/account.', icon: '📱' },
    { option: 'Option 3', title: 'Refund via other method', desc: 'Alternative refund method.', icon: '💳' },
  ];

  const stripeRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Money is returned to the PayMaestro wallet. Instant.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend to Mobile Money', desc: 'Mobile Money transfer to the beneficiary\'s number.', icon: '📱' },
    { option: 'Option 3', title: 'Refund to bank account', desc: 'SEPA transfer to the beneficiary\'s IBAN.', icon: '🏦' },
  ];

  const pm2pmRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Money is returned to the PayMaestro wallet. Instant.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend to recipient', desc: 'PM→PM transfer to the correct recipient.', icon: '🔄' },
    { option: 'Option 3', title: 'Refund to Mobile Money', desc: 'Mobile Money transfer as alternative.', icon: '📱' },
  ];

  const bank2walletRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Money is returned to the wallet. Instant.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend to bank account', desc: 'SEPA transfer to the beneficiary\'s IBAN.', icon: '🏦' },
    { option: 'Option 3', title: 'Contact the bank', desc: 'Mediation with the issuing bank.', icon: '📧' },
  ];

  const mobile2walletRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Money is returned to the PayMaestro wallet. Instant.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend to Mobile Money', desc: 'Transfer to the beneficiary\'s Mobile Money number.', icon: '📱' },
    { option: 'Option 3', title: 'Refund via other method', desc: 'PayPal, Bank or Stripe as preferred.', icon: '💳' },
  ];

  const cryptoRefundOptions = [
    { option: 'Option 1', title: 'Credit the USD Wallet', desc: 'Immediate refund to the wallet.', icon: '🏦' },
    { option: 'Option 2', title: 'Resend the crypto', desc: 'Resend to the same address or a new address.', icon: '🪙' },
    { option: 'Option 3', title: 'Refund via other method', desc: 'Mobile Money, Bank or PayPal.', icon: '💳' },
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
        <h1 className="text-3xl font-bold text-slate-900">Refund Protocol</h1>
      </div>
      <p className="text-slate-500 -mt-4">Official procedure to follow for any refund request.</p>

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
            Step 1: Identity Verification Questions ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Bank' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Bank→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentQuestions.map((item: any, i: number) => (
            <div key={i} className="bg-red-50 p-4 rounded-xl">
              <p className="font-semibold text-red-900">{i + 1}. {item.q}</p>
              <p className="text-xs text-red-600 mt-1">🎯 Purpose: {item.why}</p>
              <p className="text-xs text-red-500 mt-0.5">⚠️ Trap: {item.trap}</p>
              {item.geoCheck && claimData?.userGeo && (
                <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                  <p>📍 Localisation réelle : {claimData.userGeo.geo?.city}, {claimData.userGeo.geo?.country}</p>
                  <p>🌐 FAI : {claimData.userGeo?.isp}</p>
                </div>
              )}
              {showAnswers && !item.geoCheck && (
                <div className="mt-2 p-2 bg-red-100 rounded text-xs text-red-800">
                  ✅ Expected answer: <em>Check in logs</em>
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
            Step 2: Trap Questions (Fraud Detection)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {currentTraps.map((item: any, i: number) => (
            <div key={i} className="bg-orange-50 p-4 rounded-xl">
              <p className="font-semibold text-orange-900">🔶 {currentQuestions.length + i + 1}. {item.q}</p>
              <p className="text-xs text-orange-600 mt-1">⚠️ Trap: {item.trap}</p>
              <p className="text-xs text-orange-500 mt-0.5">🚩 Flag: {item.flag}</p>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ÉTAPE 3 : VÉRIFICATION TECHNIQUE */}
      <Card className="border-l-4 border-l-blue-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-700">
            <FileText className="w-5 h-5" />
            Step 3: Technical Verification
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { check: "Email match", desc: "User's email must match the account" },
              { check: "Identical amount", desc: "Same amount as declared by the user" },
              { check: "Consistent date/time", desc: "In logs (±30 min tolerated)" },
              { check: "No previous refund", desc: "Status ≠ REFUNDED for this transaction" },
              { check: "Consistent history", desc: "No multiple transfers to the same recipient" },
              { check: "Consistent location", desc: "Same country/city as usual" },
              { check: "Number of claims", desc: "≤ 2 claims per year = OK. ≥ 3 = suspicious" },
              { check: "Account age", desc: "Account > 1 month = reliable. < 1 week = dangerous" },
              { check: activeTab === 'bank' ? "Valid IBAN" : activeTab === 'paypal' ? "PayPal email verified" : activeTab === 'stripe' ? "Valid Stripe IBAN" : activeTab === 'pm2pm' ? "Relationship verified" : activeTab === 'bank2wallet' ? "Transfer origin verified" : activeTab === 'mobile2wallet' ? "Mobile Money number verified" : activeTab === 'crypto' ? "Crypto address verified" : "Number verified", desc: activeTab === 'bank' ? "Correct IBAN format and consistent country" : activeTab === 'paypal' ? "PayPal email confirmed by user" : activeTab === 'stripe' ? "Valid IBAN format verified via Stripe" : activeTab === 'pm2pm' ? "Check transaction history between the 2 accounts" : activeTab === 'bank2wallet' ? "Check sender IBAN and issuing bank" : activeTab === 'mobile2wallet' ? "Number verified via Flutterwave lookup" : activeTab === 'crypto' ? "Address verified on blockchain" : "Number verified via Flutterwave" },
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
            🟢 Step 4: Trust Score (Decision)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[
              { score: '≥ 8/10', action: '✅ REFUND IMMEDIATELY', color: 'bg-green-100 text-green-800' },
              { score: '5-7/10', action: '⚠️ REQUEST ADDITIONAL ID', color: 'bg-yellow-100 text-yellow-800' },
              { score: '3-4/10', action: '🔴 ESCALATE TO SUPERVISOR', color: 'bg-orange-100 text-orange-800' },
              { score: '< 3/10', action: '🚫 REFUSE — PROBABLE FRAUD', color: 'bg-red-100 text-red-800' },
            ].map((item, i) => (
              <div key={i} className={`p-3 rounded-xl ${item.color} flex justify-between items-center`}>
                <span className="font-semibold">{item.score}</span>
                <span>{item.action}</span>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-slate-50 rounded-xl">
            <p className="text-sm font-semibold mb-2">📊 Score calculation ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Bank' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Bank→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'}) :</p>
            <p className="text-xs text-slate-600">
              • Identity questions ({currentQuestions.length} questions) = {Math.round(currentQuestions.length * 1)} points<br />
              • Trap questions ({currentTraps.length} questions) = {Math.round(currentTraps.length * 0.5)} points<br />
              • Technical verification (9 criteria) = 2 points<br />
              <strong>Total: {Math.round(currentQuestions.length * 1 + currentTraps.length * 0.5 + 2)} points maximum</strong>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* OPTIONS DE REMBOURSEMENT */}
      <Card className="border-2 border-violet-300">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-violet-700">
            💳 Refund Options ({activeTab === 'mobile' ? 'Mobile Money' : activeTab === 'bank' ? 'Bank' : activeTab === 'paypal' ? 'PayPal' : activeTab === 'stripe' ? 'Stripe/IBAN' : activeTab === 'pm2pm' ? 'PM→PM' : activeTab === 'bank2wallet' ? 'Bank→Wallet' : activeTab === 'mobile2wallet' ? 'Mobile→Wallet' : 'Crypto'})
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
          {showAnswers ? 'Hide answers' : 'Show answers'}
        </Button>
        <Button onClick={() => navigator.clipboard.writeText(document.querySelector('.space-y-8')?.textContent || '')} icon={<Copy className="w-4 h-4" />}>
          Copy protocol
        </Button>
      </div>
    </div>
  );
}