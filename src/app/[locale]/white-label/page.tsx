'use client';

import { useState, useEffect } from 'react';
import { Globe, CheckCircle2, Loader2, Copy, ExternalLink, XCircle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';

export default function WhiteLabelPage() {

  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<any>(null);

  const handleActivate = async () => {
    setLoading(true);
    try {
      await api.auth.activateWhiteLabel();
      setStatus({ active: true, domain });
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  const handleDeactivate = async () => {
    setLoading(true);
    try {
      await api.auth.deactivateWhiteLabel();
      setStatus(null);
      setDomain('');
    } catch (e: any) {
      alert(e.message);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-12 space-y-6">
      <div className="flex items-center gap-3">
        <Globe className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold">White-Label</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>🌐 Votre propre domaine</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-600">
            Activez le mode White-Label pour utiliser votre propre nom de domaine. 
            Vos visiteurs ne verront JAMAIS la marque PayMaestro.
          </p>

          {status?.active ? (
            <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center space-y-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto" />
              <p className="font-bold text-lg">White-Label actif !</p>
              <p className="text-sm text-green-700">
                Votre domaine <strong>{status.domain}</strong> est configuré.
              </p>
              <div className="bg-white rounded-lg p-4 text-left text-sm">
                <p className="font-semibold mb-2">📋 Configuration DNS requise :</p>
                <p>Ajoutez un enregistrement <strong>CNAME</strong> chez votre registrar :</p>
                <div className="bg-slate-100 p-3 rounded-lg font-mono text-xs mt-2">
                  <p>Nom : <strong>@</strong> (ou votre sous-domaine)</p>
                  <p>Cible : <strong>api.paymaestro.com</strong></p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button variant="outline" onClick={() => navigator.clipboard.writeText(status.domain)} icon={<Copy className="w-4 h-4" />}>
                  Copier le domaine
                </Button>
                <Button variant="outline" onClick={() => window.open(`https://${status.domain}`, '_blank')} icon={<ExternalLink className="w-4 h-4" />}>
                  Tester
                </Button>
              </div>
              <Button onClick={handleDeactivate} className="text-red-600" variant="ghost">
                <XCircle className="w-4 h-4 mr-2" /> Désactiver le White-Label
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Votre domaine personnalisé</label>
                <input
                  type="text"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  placeholder="don.mon-media.com"
                  className="w-full px-4 py-3 border rounded-xl text-sm mt-1"
                />
                <p className="text-xs text-slate-400 mt-1">Exemple: don.mon-media.com</p>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 text-sm text-yellow-800">
                <p><strong>💰 Tarif :</strong> 3$/mois</p>
                <p><strong>✨ Avantages :</strong></p>
                <p>• Aucune marque PayMaestro visible</p>
                <p>• Votre propre nom de domaine</p>
                <p>• Page de paiement personnalisée</p>
                <p>• Confiance accrue de vos clients</p>
              </div>

              <Button onClick={handleActivate} fullWidth disabled={loading || !domain}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Activer (3$)'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}