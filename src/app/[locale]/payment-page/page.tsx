'use client';

import { useState, useEffect } from 'react';
import { Globe, CheckCircle2, Loader2, Copy, ExternalLink, Palette, Edit3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function PaymentPageSetup() {

  const [subdomain, setSubdomain] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#667eea');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    setLoading(true);
    try {
      const data = await api.auth.createPaymentPage({ subdomain, title, description, color });
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

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold">Votre Page de Paiement</h1>
      </div>

      {result ? (
        <Card className="border-2 border-green-300">
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto" />
            <h2 className="text-xl font-bold">Votre page est prête ! 🎉</h2>
            
            <div className="bg-slate-50 rounded-2xl p-6">
              <p className="text-sm text-slate-500 mb-2">Votre lien de paiement :</p>
              <p className="text-2xl font-extrabold text-violet-600 font-mono">{result.url}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" fullWidth onClick={handleCopy} icon={<Copy className="w-4 h-4" />}>
                {copied ? 'Copié !' : 'Copier le lien'}
              </Button>
              <Button fullWidth onClick={() => window.open(result.url, '_blank')} icon={<ExternalLink className="w-4 h-4" />}>
                Voir ma page
              </Button>
            </div>

            <p className="text-xs text-slate-400">
              Partagez ce lien partout — vos clients ne verront JAMAIS la marque PayMaestro !
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Edit3 className="w-5 h-5 text-violet-600" />
              Personnalisez votre page
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Votre sous-domaine</label>
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={subdomain}
                  onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                  placeholder="bible-blueprint"
                  className="flex-1 px-4 py-3 border rounded-xl text-sm font-mono"
                />
                <span className="text-slate-500 font-mono text-sm">.paymaestro.me</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Exemple: bible-blueprint.paymaestro.me</p>
            </div>

            <div>
              <label className="text-sm font-semibold">Titre de la page</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Soutenir Bible BluePrint"
                className="w-full px-4 py-3 border rounded-xl text-sm mt-1"
              />
            </div>

            <div>
              <label className="text-sm font-semibold">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Votre soutien nous aide à continuer notre mission..."
                className="w-full px-4 py-3 border rounded-xl text-sm mt-1"
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
                    className={`w-10 h-10 rounded-full border-2 transition-all ${color === c ? 'border-slate-800 scale-110' : 'border-transparent'}`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            {/* Prévisualisation */}
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-slate-500 mb-2">APERÇU DE VOTRE PAGE :</p>
              <div className="bg-white rounded-lg p-4 text-center shadow-sm" style={{ borderTop: `4px solid ${color}` }}>
                <div className="w-12 h-12 rounded-full mx-auto mb-2" style={{ backgroundColor: color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', fontWeight: 'bold' }}>
                  {(title || 'P').charAt(0)}
                </div>
                <p className="font-bold text-lg">{title || 'Votre titre'}</p>
                <p className="text-xs text-slate-400">{description || 'Votre description'}</p>
                <p className="text-xs text-slate-300 mt-2 font-mono">{subdomain || 'votre-page'}.paymaestro.me</p>
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800">
              <p><strong>💰 Tarif :</strong> 3$/mois</p>
              <p><strong>✨ Inclus :</strong> Sous-domaine personnalisé, page sans marque PayMaestro, lien de paiement direct</p>
            </div>

            <Button onClick={handleCreate} fullWidth disabled={loading || !subdomain}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer ma page (3$)'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}