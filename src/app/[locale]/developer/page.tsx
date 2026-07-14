'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Key, Plus, Copy, CheckCircle2, Eye, EyeOff, Loader2, 
  Trash2, Shield, Code, BookOpen, Zap, Clock, AlertTriangle,
  ArrowUpRight, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function DeveloperPage() {
  const t = useTranslations('developer');
  const tCommon = useTranslations('common');

  const [apiKeys, setApiKeys] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyType, setNewKeyType] = useState<'test' | 'live'>('test');
  const [newKey, setNewKey] = useState<any>(null);
  const [showKey, setShowKey] = useState(false);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);
  const [businessType, setBusinessType] = useState('');
  const [businessLoading, setBusinessLoading] = useState(true);
  const [showBusinessModal, setShowBusinessModal] = useState(false);

  useEffect(() => { loadKeys(); loadBusiness(); }, []);

  const loadBusiness = async () => {
    try {
      const data = await api.auth.getMe();
      setBusinessType(data?.businessType || 'STARTER');
    } catch {}
    setBusinessLoading(false);
  };

  const loadKeys = async () => {
    try {
      const data = await api.auth.getApiKeys();
      setApiKeys(data);
    } catch {}
    setLoading(false);
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim()) { alert(t('keyNameRequired')); return; }
    setCreating(true);
    try {
      const data = await api.auth.createApiKey(newKeyName.trim(), newKeyType);
      setNewKey(data);
      setShowCreate(false);
      setNewKeyName('');
      loadKeys();
    } catch (e: any) {
      alert(e.message);
    }
    setCreating(false);
  };

  const handleRevokeKey = async (keyId: number) => {
    if (!confirm(t('revokeConfirm'))) return;
    try {
      await api.auth.revokeApiKey(String(keyId));
      loadKeys();
    } catch (e: any) {
      alert(e.message);
    }
  };

  const handleCopy = (text: string | undefined) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <Code className="w-8 h-8 text-violet-600" />
            {t('title')}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{t('subtitle')}</p>
        </div>
      </div>

      {/* Documentation rapide */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 dark:from-violet-950 dark:to-indigo-950 border-violet-200 dark:border-violet-800">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <BookOpen className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800 dark:text-violet-300">{t('docApi')}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">{t('docApiDesc')}</p>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800 dark:text-violet-300">{t('quickStart')}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">{t('quickStartDesc')}</p>
            </div>
            <div className="text-center">
              <Shield className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800 dark:text-violet-300">{t('secure')}</p>
              <p className="text-xs text-violet-600 dark:text-violet-400">{t('secureDesc')}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Clés API */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Key className="w-5 h-5 text-violet-600" />
              {t('yourKeys')}
            </CardTitle>
            <Button onClick={() => setShowCreate(true)} icon={<Plus className="w-4 h-4" />}>
              {t('newKey')}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {apiKeys.length === 0 ? (
            <div className="text-center py-12">
              <Key className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-4" />
              <p className="text-slate-500 dark:text-slate-400">{t('noKeys')}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">{t('noKeysDesc')}</p>
              <Button className="mt-4" onClick={() => setShowCreate(true)}>
                {t('createKey')}
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {apiKeys.map(key => (
                <div key={key.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      key.type === 'live' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'
                    }`}>
                      <Key className={`w-5 h-5 ${key.type === 'live' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                    </div>
                    <div>
                      <p className="font-bold text-slate-800 dark:text-slate-200">{key.name}</p>
                      <p className="text-xs font-mono text-slate-500 dark:text-slate-400">
                        {key.key_prefix}...{key.last_four}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={key.type === 'live' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-300' : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-300'}>
                          {key.type === 'live' ? t('keyTypeLive') : t('keyTypeTest')}
                        </Badge>
                        <Badge className={key.status === 'active' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300' : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'}>
                          {key.status === 'active' ? t('statusActive') : t('statusRevoked')}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
                    {key.last_used_at ? (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(key.last_used_at).toLocaleDateString()}
                      </span>
                    ) : (
                      <span>{t('neverUsed')}</span>
                    )}
                    {key.status === 'active' && (
                      <button onClick={() => handleRevokeKey(key.id)} className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 dark:hover:text-red-300 rounded-lg transition-colors" title={t('revoke')}>
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Statut Business */}
      {!businessLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-violet-600" />
              {t('businessTitle')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  businessType === 'REGISTERED' ? 'bg-green-100 dark:bg-green-900/50' : 'bg-yellow-100 dark:bg-yellow-900/50'
                }`}>
                  <Shield className={`w-5 h-5 ${businessType === 'REGISTERED' ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`} />
                </div>
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-200">
                    {businessType === 'REGISTERED' ? t('registeredAccount') : t('starterAccount')}
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {businessType === 'REGISTERED'
                      ? t('outgoingActive')
                      : t('outgoingInactive')}
                  </p>
                </div>
              </div>
              {businessType !== 'REGISTERED' && (
                <Button variant="outline" onClick={() => setShowBusinessModal(true)}>
                  {t('becomeRegistered')}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Start Code */}
      <Card>
        <CardHeader><CardTitle>{t('integrationExample')}</CardTitle></CardHeader>
        <CardContent>
          <div className="bg-slate-900 dark:bg-slate-950 text-green-400 p-6 rounded-xl font-mono text-sm overflow-x-auto">
            <p className="text-slate-400">{t('codeExampleComment')}</p>
            <p className="text-yellow-400">const</p> <span className="text-blue-400">API_KEY</span> = <span className="text-green-300">"pm_test_..."</span>;
            <br /><br />
            <p className="text-yellow-400">const</p> <span className="text-blue-400">response</span> = <span className="text-yellow-400">await</span> <span className="text-purple-400">fetch</span>(<span className="text-green-300">'https://api.paymaestro.com/api/v1/public/payments'</span>, {'{'});
            <br />
            &nbsp;&nbsp;<span className="text-blue-400">method</span>: <span className="text-green-300">'POST'</span>,
            <br />
            &nbsp;&nbsp;<span className="text-blue-400">headers</span>: {'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-300">'Authorization'</span>: <span className="text-green-300">`Bearer $</span>{'{'}API_KEY{'}'}<span className="text-green-300">`</span>,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-green-300">'Content-Type'</span>: <span className="text-green-300">'application/json'</span>,
            <br />
            &nbsp;&nbsp;{'}'},
            <br />
            &nbsp;&nbsp;<span className="text-blue-400">body</span>: <span className="text-purple-400">JSON.stringify</span>({'{'}
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">amountUSD</span>: <span className="text-orange-400">100</span>,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">currencyCode</span>: <span className="text-green-300">'XOF'</span>,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">phoneNumber</span>: <span className="text-green-300">'+2250102030405'</span>,
            <br />
            &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-blue-400">userEmail</span>: <span className="text-green-300">'client@example.com'</span>,
            <br />
            &nbsp;&nbsp;{'}'})
            <br />
            {'});'}
          </div>
        </CardContent>
      </Card>

      {/* Modale création de clé */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-slate-900 dark:text-slate-100">
              <Plus className="w-5 h-5 text-violet-600" /> {t('newKeyModalTitle')}
            </h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('keyName')}</label>
                <input
                  type="text"
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder={t('keyNamePlaceholder')}
                  className="w-full px-4 py-3 border border-slate-200 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-200 rounded-xl text-sm mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-700 dark:text-slate-300">{t('keyType')}</label>
                <div className="flex gap-3 mt-1">
                  <button
                    onClick={() => setNewKeyType('test')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      newKeyType === 'test' ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/30' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold">🧪 {t('keyTypeTest')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('keyTypeTestDesc')}</p>
                  </button>
                  <button
                    onClick={() => setNewKeyType('live')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      newKeyType === 'live' ? 'border-green-500 bg-green-50 dark:bg-green-900/30' : 'border-slate-200 dark:border-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <p className="font-bold">🚀 {t('keyTypeLive')}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">{t('keyTypeLiveDesc')}</p>
                  </button>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowCreate(false)}>{t('cancel')}</Button>
              <Button fullWidth onClick={handleCreateKey} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : t('generateKey')}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modale clé générée */}
      {newKey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg text-slate-900 dark:text-slate-100">{t('keyGenerated')}</h3>
            <p className="text-sm text-red-600 dark:text-red-400 font-bold mt-2">{t('keyWarning')}</p>

            <div className="bg-slate-50 dark:bg-slate-700 rounded-xl p-4 mt-4 font-mono text-sm break-all text-left text-slate-800 dark:text-slate-200">
              {showKey ? newKey.apiKey : '•'.repeat(40)}
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" fullWidth onClick={() => setShowKey(!showKey)} icon={showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}>
                {showKey ? t('hide') : t('show')}
              </Button>
              <Button fullWidth onClick={() => handleCopy(newKey.apiKey)} icon={copied ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
                {copied ? t('copied') : t('copy')}
              </Button>
            </div>

            <Button fullWidth className="mt-3" onClick={() => setNewKey(null)}>{t('close')}</Button>
          </div>
        </div>
      )}

      {/* Modale Faire évoluer le compte */}
      {showBusinessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl relative">
            <button
              onClick={() => setShowBusinessModal(false)}
              className="absolute top-4 right-4 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-100 dark:bg-violet-900/50 flex items-center justify-center mx-auto mb-4">
                <Shield className="w-8 h-8 text-violet-600 dark:text-violet-400" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                {t('upgradeModalTitle')}
              </h2>
              <p className="text-slate-500 dark:text-slate-400 mt-2 text-sm">
                {t('upgradePrompt', { starter: t('starterAccount'), registered: t('registeredAccount') })}
              </p>
            </div>

            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 rounded-xl border border-amber-200 dark:border-amber-700/50">
                <AlertTriangle className="w-5 h-5 text-amber-500 mt-0.5 shrink-0" />
                <p>{t('registeredRequired', { registered: t('registeredAccount') })}</p>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl space-y-2">
                <p className="font-semibold text-slate-800 dark:text-slate-200">{t('requiredDocs')}</p>
                <ul className="list-disc list-inside space-y-1 text-slate-600 dark:text-slate-300">
                  <li>{t('docRccm')}</li>
                  <li>{t('docId')}</li>
                  <li>{t('docProof')}</li>
                </ul>
              </div>

              <p className="text-slate-500 dark:text-slate-400">
                {t('verificationTime')}
              </p>
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowBusinessModal(false)}>
                {t('later')}
              </Button>
              <Button
                fullWidth
                icon={<ArrowUpRight className="w-4 h-4" />}
                onClick={() => window.location.href = `/${window.location.pathname.split('/')[1]}/contact`}
              >
                {t('contactSupport')}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
