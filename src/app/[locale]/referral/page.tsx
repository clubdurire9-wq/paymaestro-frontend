'use client';

import { useState, useEffect } from 'react';
import { Gift, Copy, Users, TrendingUp, DollarSign, Loader2, Share2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api } from '@/lib/api';

export default function ReferralPage() {

  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    api.referral.getStats()
      .then(data => { setStats(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const referralLink = `https://paymaestro.vercel.app/fr/login?ref=${stats?.referralCode || ''}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: 'Rejoins PayMaestro !',
        text: `Inscris-toi sur PayMaestro avec mon code ${stats?.referralCode} et gagne des commissions à vie ! 💰\n\n👉 ${referralLink}`,
      });
    } else {
      handleCopy();
    }
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <div className="flex items-center gap-3">
        <Gift className="w-8 h-8 text-violet-600" />
        <h1 className="text-3xl font-bold">Programme de Parrainage</h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white">
          <CardContent className="p-6 text-center">
            <DollarSign className="w-8 h-8 mx-auto mb-2 opacity-80" />
            <p className="text-3xl font-extrabold">${stats?.totalEarnings || '0'}</p>
            <p className="text-sm opacity-80">Gains totaux</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <Users className="w-8 h-8 mx-auto mb-2 text-violet-600" />
            <p className="text-3xl font-extrabold">{stats?.totalReferees || 0}</p>
            <p className="text-sm text-slate-500">Filleuls</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 text-center">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-green-600" />
            <p className="text-3xl font-extrabold">{stats?.activeReferees || 0}</p>
            <p className="text-sm text-slate-500">Actifs</p>
          </CardContent>
        </Card>
      </div>

      {/* Code de parrainage */}
      <Card className="border-2 border-violet-300 bg-gradient-to-r from-violet-50 to-indigo-50">
        <CardContent className="p-8 text-center space-y-4">
          <h2 className="text-xl font-bold">Votre code de parrainage</h2>
          <div className="bg-white rounded-2xl p-6 inline-block">
            <p className="text-4xl font-extrabold text-violet-600 font-mono tracking-wider">{stats?.referralCode || 'Chargement...'}</p>
          </div>
          <div className="flex justify-center gap-3">
            <Button onClick={handleCopy} icon={copied ? <Copy className="w-4 h-4" /> : <Copy className="w-4 h-4" />}>
              {copied ? 'Copié !' : 'Copier le lien'}
            </Button>
            <Button variant="outline" onClick={handleShare} icon={<Share2 className="w-4 h-4" />}>
              Partager
            </Button>
          </div>
          <p className="text-xs text-slate-500">Lien : {referralLink}</p>
        </CardContent>
      </Card>

      {/* Comment ça marche */}
      <Card>
        <CardHeader><CardTitle>🎁 Comment ça marche ?</CardTitle></CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-600">
          <p>1️⃣ Partagez votre code de parrainage à vos amis</p>
          <p>2️⃣ Ils s'inscrivent avec votre code</p>
          <p>3️⃣ Quand ils font des transactions, vous gagnez <strong className="text-violet-600">10%</strong> de leurs frais PayMaestro</p>
          <p>4️⃣ Les gains sont crédités directement sur votre wallet</p>
          <p>5️⃣ L'affiliation dure <strong>6 mois</strong> par filleul</p>
          <div className="bg-green-50 rounded-xl p-4 mt-4">
            <p className="font-bold text-green-800">💡 Exemple :</p>
            <p className="text-green-700">Votre filleul fait un retrait de 100$ → Frais 7$ → Vous gagnez <strong>0.70$</strong></p>
            <p className="text-green-700">S'il fait 10 retraits par mois → Vous gagnez <strong>7$/mois</strong> passivement</p>
            <p className="text-green-700">Avec 20 filleuls actifs → <strong>140$/mois</strong> de revenus passifs !</p>
          </div>
        </CardContent>
      </Card>

      {/* Liste des filleuls */}
      {stats?.referrals?.length > 0 && (
        <Card>
          <CardHeader><CardTitle>👥 Vos filleuls</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.referrals.map((ref: any, i: number) => (
                <div key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                  <div>
                    <p className="font-bold text-sm">{ref.name || ref.email}</p>
                    <p className="text-xs text-slate-400">{ref.email}</p>
                  </div>
                  <Badge className={ref.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}>
                    {ref.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}