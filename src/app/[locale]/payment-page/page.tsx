'use client';

import { useState } from 'react';
import { Globe, CheckCircle2, Loader2, Copy, ExternalLink, Palette, Edit3, Crown, Sparkles } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function PaymentPageSetup() {
  const { user } = useAuth();

  const [plan, setPlan] = useState<'free' | 'premium'>('free');
  const [subdomain, setSubdomain] = useState('');
  const [customDomain, setCustomDomain] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#667eea');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const balance = parseFloat(user?.balance_usd || '0');

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = plan === 'free'
        ? await api.auth.createPaymentPage({ subdomain, title, description, color })
        : await api.auth.activateWhiteLabel({ domain: customDomain, title, description, color });
      setResult(data);
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result?.url || '');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (result) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
        <Card className="border-2 border-green-300">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Votre page est prête ! 🎉</h2>
            
            <div className="bg-slate-50 dark:bg-slate-800 rounded-2xl p-6">
              <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">Votre lien de paiement :</p>
              <p className="text-2xl font-extrabold text-violet-600 font-mono break-all">{result.url}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleCopy} icon={<Copy className="w-4 h-4" />}>
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
              <Button fullWidth onClick={() => window.open(result.url, '_blank')} icon={<ExternalLink className="w-4 h-4" />}>
                Voir ma page
              </Button>
            </div>

            {result.plan === 'free' ? (
              <p className="text-xs text-slate-400 dark:text-slate-500">
                Partagez ce lien partout ! PayMaestro est mentionné sur la page
              </p>
            ) : (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold">
                ✨ Aucune marque PayMaestro visible — page 100% personnalisée
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold">Votre Page de Paiement</h1>
      </div>

      <p className="text-slate-600 dark:text-slate-400 text-sm">
        Créez un lien de paiement personnalisé à partager avec votre communauté.
      </p>

      {/* Sélecteur de plan */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => setPlan('free')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            plan === 'free'
              ? 'border-violet-600 bg-violet-50 dark:bg-violet-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-violet-300'
          }`}
        >
          <Sparkles className="w-8 h-8 text-violet-600 mb-3" />
          <h3 className="font-bold text-lg">Gratuit</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Sous-domaine <span className="font-mono">.paymaestro.me</span>
          </p>
          <ul className="mt-3 text-sm space-y-1 text-slate-600 dark:text-slate-300">
            <li>✅ Lien personnalisé</li>
            <li>✅ Page avec votre marque</li>
            <li>🔸 Mention PayMaestro visible</li>
          </ul>
          <p className="mt-4 text-2xl font-bold text-violet-600">0$</p>
        </button>

        <button
          onClick={() => setPlan('premium')}
          className={`p-6 rounded-2xl border-2 text-left transition-all ${
            plan === 'premium'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
          }`}
        >
          <Crown className="w-8 h-8 text-amber-500 mb-3" />
          <h3 className="font-bold text-lg">Premium</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Votre propre domaine <span className="font-mono">.me</span>
          </p>
          <ul className="mt-3 text-sm space-y-1 text-slate-600 dark:text-slate-300">
            <li>✅ Domaine personnalisé</li>
            <li>✅ Aucune marque PayMaestro</li>
            <li>✅ Design 100% personnalisable</li>
          </ul>
          <p className="mt-4 text-2xl font-bold text-amber-500">3$<span className="text-sm font-normal text-slate-400">/mois</span></p>
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit3 className="w-5 h-5 text-violet-600" />
            {plan === 'free' ? 'Personnalisez votre sous-domaine' : 'Personnalisez votre domaine'}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {plan === 'free' ? (
            <div>
              <label className="text-sm font-semibold">Votre sous-domaine</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="bible-blueprint"
                  className="flex-1 px-4 py-3 border dark:border-slate-600 rounded-xl text-sm font-mono dark:bg-slate-800 dark:text-white"
                />
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm whitespace-nowrap">.paymaestro.me</span>
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Exemple: bible-blueprint.paymaestro.me</p>
            </div>
          ) : (
            <div>
              <label className="text-sm font-semibold">Votre domaine personnalisé</label>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-slate-500 dark:text-slate-400 font-mono text-sm">https://</span>
                <input
                  type="text"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value.toLowerCase().replace(/[^a-z0-9.-]/g, ''))}
                  placeholder="football-club.me"
                  className="flex-1 px-4 py-3 border dark:border-slate-600 rounded-xl text-sm font-mono dark:bg-slate-800 dark:text-white"
                />
              </div>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                Vous devez posséder ce domaine et pointer son DNS vers nous
              </p>
            </div>
          )}

          <div>
            <label className="text-sm font-semibold">Titre de la page</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Soutenir ma chaîne"
              className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl text-sm mt-1 dark:bg-slate-800 dark:text-white"
            />
          </div>

          <div>
            <label className="text-sm font-semibold">Description (facultatif)</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Votre soutien m'aide à créer du contenu de qualité..."
              className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl text-sm mt-1 dark:bg-slate-800 dark:text-white"
              rows={3}
            />
          </div>

          <div>
            <label className="text-sm font-semibold flex items-center gap-2">
              <Palette className="w-4 h-4" /> Couleur du thème
            </label>
            <div className="flex gap-2 mt-1">
              {['#667eea', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'].map(c => (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 dark:border-white scale-110' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {/* Prévisualisation */}
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4">
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2">APERÇU DE VOTRE PAGE :</p>
            <div className="bg-white dark:bg-slate-800 rounded-lg p-4 text-center shadow-sm" style={{ borderTop: `4px solid ${color}` }}>
              <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                {(title || 'P').charAt(0)}
              </div>
              <p className="font-bold text-lg dark:text-white">{title || 'Votre titre'}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500">{description || 'Votre description'}</p>
              <p className="text-xs text-slate-300 dark:text-slate-600 mt-2 font-mono">
                {plan === 'free' ? `${subdomain || 'votre-page'}.paymaestro.me` : customDomain || 'votre-domaine.me'}
              </p>
            </div>
          </div>

          {plan === 'premium' && balance < 3 && (
            <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 text-sm text-red-700 dark:text-red-400">
              Solde insuffisant. Vous avez besoin de 3$ dans votre wallet pour le plan Premium.
            </div>
          )}

          <Button
            onClick={handleCreate}
            fullWidth
            disabled={loading || (plan === 'free' ? !subdomain : !customDomain || balance < 3)}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : plan === 'free' ? (
              'Créer ma page (Gratuit)'
            ) : (
              'Activer Premium (3$/mois)'
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
