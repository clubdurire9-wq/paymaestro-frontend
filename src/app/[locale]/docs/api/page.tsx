'use client';

import { useState } from 'react';
import { useLocale } from 'next-intl';
import Link from 'next/link';
import { Code, BookOpen, Copy, Check, Terminal, Globe, Lock, Webhook, AlertTriangle, Server, Key, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

const endpoints = [
  {
    method: 'GET',
    path: '/api/v1/health',
    desc: 'Check that the API is operational.',
    auth: false,
    response: `{
  "success": true,
  "data": {
    "status": "OK",
    "timestamp": "2026-07-03T12:00:00.000Z"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/auth/register',
    desc: 'Create a user account.',
    auth: false,
    body: `{
  "email": "user@example.com",
  "password": "securePassword123",
  "referralCode": "CODE123"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "wallet_balance": 0
    }
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/auth/login',
    desc: 'Log in an existing user.',
    auth: false,
    body: `{
  "email": "user@example.com",
  "password": "securePassword123"
}`,
    response: `{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": { ... }
  }
}`,
  },
  {
    method: 'GET',
    path: '/api/v1/wallet/balance',
    desc: 'Get wallet balance.',
    auth: true,
    response: `{
  "success": true,
  "data": {
    "balance": 1250.50,
    "currency": "USD"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/payments/create-order',
    desc: 'Create a PayPal order for deposit.',
    auth: true,
    body: `{
  "amount": 100.00,
  "returnUrl": "https://paymaestro.vercel.app/fr/paypal/success",
  "cancelUrl": "https://paymaestro.vercel.app/fr/paypal/cancel"
}`,
    response: `{
  "success": true,
  "data": {
    "approvalUrl": "https://www.paypal.com/checkoutnow?token=...",
    "orderId": "ORDER_123"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/wallet/deposit-mobile',
    desc: 'Initiate a Mobile Money deposit.',
    auth: true,
    body: `{
  "amount": 50.00,
  "phone": "+2250701020304",
  "operator": "mtn",
  "country": "CI",
  "currency": "USD"
}`,
    response: `{
  "success": true,
  "data": {
    "transactionId": "TX_123",
    "provider": "PAYSTACK",
    "status": "PENDING",
    "message": "Check your phone to authorize the payment"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/wallet/pm-to-pm',
    desc: 'Transfer funds to another PayMaestro user.',
    auth: true,
    body: `{
  "recipientEmail": "ami@example.com",
  "amount": 25.00
}`,
    response: `{
  "success": true,
  "data": {
    "senderBalance": 975.00,
    "recipientEmail": "ami@example.com",
    "amount": 25.00,
    "newBalance": 975.00
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/wallet/withdraw-to-mobile',
    desc: 'Withdraw funds from wallet to Mobile Money.',
    auth: true,
    body: `{
  "amount": 30.00,
  "phone": "+2250701020304",
  "operator": "orange",
  "country": "CI"
}`,
    response: `{
  "success": true,
  "data": {
    "transactionId": "TX_456",
    "status": "COMPLETED",
    "netAmount": 29.10
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/crypto/generate-address',
    desc: 'Generate a crypto deposit address.',
    auth: true,
    body: `{
  "currency": "USDT",
  "network": "TRC20"
}`,
    response: `{
  "success": true,
  "data": {
    "pay_address": "TXYZ...",
    "pay_amount": 100,
    "price_amount": 100,
    "currency": "USDT"
  }
}`,
  },
  {
    method: 'POST',
    path: '/api/v1/kyc/submit',
    desc: 'Submit KYC documents.',
    auth: true,
    body: '(multipart/form-data)\n  documentFront: File\n  documentBack: File\n  documentType: "PASSPORT" | "NATIONAL_ID" | "DRIVERS_LICENSE"',
    response: `{
  "success": true,
  "data": {
    "status": "PENDING",
    "message": "Documents received. Processing within 24-48h."
  }
}`,
  },
];

const errorCodes = [
  { code: 'KYC_REQUIRED', status: 403, desc: 'User must first verify their identity (KYC).', solution: 'Redirect to /kyc' },
  { code: 'INSUFFICIENT_BALANCE', status: 400, desc: 'Insufficient wallet balance.', solution: 'Check balance before transaction' },
  { code: 'TRANSACTION_FROZEN', status: 403, desc: 'The transaction has been frozen by an administrator.', solution: 'Contact support' },
  { code: 'ACTION_FROZEN', status: 403, desc: 'This action is disabled for your account.', solution: 'Contact support' },
  { code: 'RATE_LIMIT_EXCEEDED', status: 429, desc: 'Too many requests. Limit: 300 req/15min.', solution: 'Wait and retry' },
  { code: 'INVALID_PROVIDER', status: 400, desc: 'The payment provider is not available for this country.', solution: 'Use a different operator' },
  { code: 'AGE_RESTRICTION', status: 400, desc: 'You must be at least 18 years old.', solution: 'Check date of birth' },
  { code: 'PROFILE_UPDATE_COOLDOWN', status: 400, desc: 'Profile modification limited to once every 30 days.', solution: 'Wait for the period to end' },
];

export default function ApiDocsPage() {
  const locale = useLocale();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = async (text: string, index: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

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
            <span className="text-slate-600 dark:text-slate-300">API Reference</span>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mt-1">API Reference</h1>
        </div>
      </div>
      <p className="text-slate-500 dark:text-slate-400 -mt-4">
        Integrate PayMaestro into your application. All endpoints, parameters and error codes.
      </p>

      {/* Base URL */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Globe className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">Base URL</h2>
          </div>
          <div className="relative">
            <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
              <code className="text-sm text-emerald-400 font-mono">https://paymaestro-backend.onrender.com/api/v1</code>
            </div>
            <button
              onClick={() => copyToClipboard('https://paymaestro-backend.onrender.com/api/v1', -1)}
              className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              {copiedIndex === -1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400">All requests must use the prefix <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 rounded">/api/v1</code>.</p>
        </CardContent>
      </Card>

      {/* Authentication */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">Authentification</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            Most endpoints require a JWT token. Include it in the HTTP header <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 rounded">Authorization: Bearer &lt;token&gt;</code>.
            The token is obtained via <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 rounded">POST /auth/login</code> or <code className="text-violet-600 dark:text-violet-400 bg-violet-50 dark:bg-violet-900/20 px-1 rounded">POST /auth/register</code>.
          </p>
          <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
            <code className="text-sm text-emerald-400 font-mono">
{`// Header example
fetch('https://paymaestro-backend.onrender.com/api/v1/wallet/balance', {
  headers: {
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIs...',
    'Content-Type': 'application/json'
  }
})`}
            </code>
          </div>
        </CardContent>
      </Card>

      {/* Endpoints */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Endpoints</h2>
        </div>

        {endpoints.map((ep, i) => (
          <div key={i} id={`endpoint-${i}`} className="scroll-mt-20"><Card className="border-slate-100 dark:border-slate-700">
            <CardContent className="p-5 space-y-4">
              {/* Method + Path */}
              <div className="flex items-center gap-3 flex-wrap">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono ${
                  ep.method === 'GET' ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-300' :
                  ep.method === 'POST' ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' :
                  'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300'
                }`}>
                  {ep.method}
                </span>
                <code className="text-sm font-mono text-slate-800 dark:text-slate-200">{ep.path}</code>
                {!ep.auth && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400">Public</span>
                )}
                {ep.auth && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400">Auth requis</span>
                )}
              </div>

              <p className="text-sm text-slate-600 dark:text-slate-300">{ep.desc}</p>

              {/* Body */}
              {'body' in ep && (
                <div>
                  <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Request body</h4>
                  <div className="relative">
                    <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
                      <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">{ep.body}</pre>
                    </div>
                    <button
                      onClick={() => copyToClipboard(ep.body!, i * 2)}
                      className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                    >
                      {copiedIndex === i * 2 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Response */}
              <div>
                <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-2">Response</h4>
                <div className="relative">
                  <div className="bg-slate-900 dark:bg-slate-800 rounded-xl p-4 overflow-x-auto">
                    <pre className="text-sm text-emerald-400 font-mono whitespace-pre-wrap">{ep.response}</pre>
                  </div>
                  <button
                    onClick={() => copyToClipboard(ep.response, i * 2 + 1)}
                    className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                  >
                    {copiedIndex === i * 2 + 1 ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </CardContent>
          </Card></div>
        ))}
      </section>

      {/* Webhooks */}
      <Card>
        <CardContent className="p-5 space-y-3">
          <div className="flex items-center gap-3">
            <Webhook className="w-5 h-5 text-violet-600 dark:text-violet-400" />
            <h2 className="font-bold text-slate-900 dark:text-white">Webhooks</h2>
          </div>
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            PayMaestro can notify your server in real-time via webhooks. Configure the callback URL in the admin dashboard.
          </p>
          <div className="bg-slate-50 dark:bg-slate-800 rounded-xl p-4 border border-slate-200 dark:border-slate-700">
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Available events:</p>
            <ul className="space-y-1.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-center gap-2"><Server className="w-4 h-4 text-violet-500" /> <code className="text-violet-600 dark:text-violet-400">payment.completed</code> — Payment successful</li>
              <li className="flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-amber-500" /> <code className="text-violet-600 dark:text-violet-400">payment.failed</code> — Payment failed</li>
              <li className="flex items-center gap-2"><Server className="w-4 h-4 text-violet-500" /> <code className="text-violet-600 dark:text-violet-400">kyc.approved</code> — KYC approved</li>
              <li className="flex items-center gap-2"><Server className="w-4 h-4 text-violet-500" /> <code className="text-violet-600 dark:text-violet-400">kyc.rejected</code> — KYC rejected</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Error codes */}
      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <AlertTriangle className="w-5 h-5 text-violet-600 dark:text-violet-400" />
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Codes d&apos;erreur</h2>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50">
                    <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase">Code</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase">Status</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase">Description</th>
                    <th className="py-3 px-5 text-xs font-semibold text-slate-400 uppercase">Solution</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                  {errorCodes.map((err) => (
                    <tr key={err.code} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="py-3 px-5"><code className="text-xs font-mono text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 px-1.5 py-0.5 rounded">{err.code}</code></td>
                      <td className="py-3 px-5"><span className="text-xs font-mono text-slate-500">{err.status}</span></td>
                      <td className="py-3 px-5 text-xs text-slate-600 dark:text-slate-300">{err.desc}</td>
                      <td className="py-3 px-5 text-xs text-slate-500 dark:text-slate-400">{err.solution}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* SDK */}
      <section className="text-center py-8 border-t border-slate-100 dark:border-slate-800 space-y-4">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Pas encore de SDK ?</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">Use our REST API directly with fetch, axios or your preferred tool. Official SDKs coming soon!</p>
        <Link href={`/${locale}/docs`}
          className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors text-sm font-medium"
        >
          Back to documentation <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  );
}
