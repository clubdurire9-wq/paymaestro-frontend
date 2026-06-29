'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  Shield, Lock, Unlock, AlertTriangle, Activity, 
  Globe, Server, Wifi, WifiOff, Loader2, RefreshCw,
  Eye, Trash2, Ban, CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

function getFlagEmoji(countryCode: string) {
  if (!countryCode || countryCode === 'XX' || countryCode === 'LO') return '🌍';
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map(char => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
}

export default function AdminSecurityPage() {
  const locale = useLocale();
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';
  const token = typeof window !== 'undefined' ? sessionStorage.getItem('paymaestro_token') : '';
  const headers = { Authorization: `Bearer ${token}` };

  const [bannedIPs, setBannedIPs] = useState<string[]>([]);
  const [tarpitStats, setTarpitStats] = useState<any[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'banned' | 'tarpit' | 'alerts'>('banned');

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [bannedRes, tarpitRes, alertsRes] = await Promise.all([
        fetch(`${API_URL}/admin/security/banned`, { headers }),
        fetch(`${API_URL}/admin/security/tarpit`, { headers }),
        fetch(`${API_URL}/admin/security/alerts`, { headers }),
      ]);
      
      if (bannedRes.ok) { const d = await bannedRes.json(); setBannedIPs(d.data || []); }
      if (tarpitRes.ok) { const d = await tarpitRes.json(); setTarpitStats(d.data || []); }
      if (alertsRes.ok) { const d = await alertsRes.json(); setFraudAlerts(d.data || []); }
    } catch (e) {}
    setLoading(false);
  };

  const handleUnban = async (ip: string) => {
    await fetch(`${API_URL}/admin/security/unban`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip }),
    });
    loadData();
  };

  const handleBlock = async (ip: string) => {
    await fetch(`${API_URL}/admin/security/block`, {
      method: 'POST', headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({ ip, reason: 'Blocage manuel admin' }),
    });
    loadData();
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Shield className="w-8 h-8 text-red-600" />
            Sécurité & Monitoring
          </h1>
          <p className="text-sm text-slate-500 mt-1">Surveillez les menaces et gérez les blocages en temps réel</p>
        </div>
        <Button variant="outline" onClick={loadData} icon={<RefreshCw className="w-4 h-4" />}>
          Rafraîchir
        </Button>
      </div>

      {/* STATS RAPIDES */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card className="bg-red-50 border-red-200">
          <CardContent className="p-4 text-center">
            <Ban className="w-6 h-6 text-red-600 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-red-700">{bannedIPs.length}</p>
            <p className="text-xs text-red-600">IPs Bannies</p>
          </CardContent>
        </Card>
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="p-4 text-center">
            <Activity className="w-6 h-6 text-orange-600 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-orange-700">{tarpitStats.length}</p>
            <p className="text-xs text-orange-600">En Tarpit</p>
          </CardContent>
        </Card>
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="p-4 text-center">
            <AlertTriangle className="w-6 h-6 text-yellow-600 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-yellow-700">{fraudAlerts.length}</p>
            <p className="text-xs text-yellow-600">Alertes Fraude</p>
          </CardContent>
        </Card>
        <Card className="bg-green-50 border-green-200">
          <CardContent className="p-4 text-center">
            <Server className="w-6 h-6 text-green-600 mx-auto mb-1" />
            <p className="text-2xl font-extrabold text-green-700">Actif</p>
            <p className="text-xs text-green-600">Forteresse Active</p>
          </CardContent>
        </Card>
      </div>

      {/* ONGLETS */}
      <div className="flex gap-2 bg-slate-100 p-1 rounded-xl">
        {[
          { id: 'banned' as const, label: `🚫 IPs Bannies (${bannedIPs.length})` },
          { id: 'tarpit' as const, label: `⏳ Tarpit (${tarpitStats.length})` },
          { id: 'alerts' as const, label: `🚨 Alertes (${fraudAlerts.length})` },
        ].map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id ? 'bg-white shadow text-slate-900' : 'text-slate-500'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* SECTION 1 : IPs BANNIES */}
      {activeTab === 'banned' && (
        <Card>
          <CardHeader><CardTitle>IPs Bannies</CardTitle></CardHeader>
          <CardContent>
            {bannedIPs.length === 0 ? (
              <p className="text-slate-400 text-center py-8">✅ Aucune IP bannie</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {bannedIPs.map((item: any) => (
                  <div key={item.ip} className="p-4 bg-red-50 border-2 border-red-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Ban className="w-5 h-5 text-red-600" />
                        <span className="font-mono font-bold text-red-800 text-lg">{item.ip}</span>
                        <Badge className="bg-red-100 text-red-700">{item.type || 'Inconnu'}</Badge>
                        {item.reason && <Badge className="bg-orange-100 text-orange-700 text-[10px]">{item.reason}</Badge>}
                        {item.permanent && <Badge className="bg-red-100 text-red-700 text-[10px]">PERMANENT</Badge>}
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleUnban(item.ip)} className="text-green-600">
                        <Unlock className="w-4 h-4 mr-1" /> Débloquer
                      </Button>
                    </div>
                    {item.bannedAt && (
                      <p className="text-[10px] text-slate-400">Banni le {new Date(item.bannedAt).toLocaleString('fr-FR')}</p>
                    )}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-[10px] text-slate-400 uppercase">Pays</p>
                        <p className="text-sm font-bold">{getFlagEmoji(item.countryCode)} {item.country}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-[10px] text-slate-400 uppercase">Ville</p>
                        <p className="text-sm font-bold">{item.city}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-[10px] text-slate-400 uppercase">Région</p>
                        <p className="text-sm font-bold">{item.region}</p>
                      </div>
                      <div className="bg-white rounded-lg p-2">
                        <p className="text-[10px] text-slate-400 uppercase">FAI</p>
                        <p className="text-xs font-bold">{item.isp}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 2 : TARPIT */}
      {activeTab === 'tarpit' && (
        <Card>
          <CardHeader><CardTitle>Connexions ralenties (Tarpit)</CardTitle></CardHeader>
          <CardContent>
            {tarpitStats.length === 0 ? (
              <p className="text-slate-400 text-center py-8">✅ Aucune connexion ralentie</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {tarpitStats.map((item: any) => (
                  <div key={item.key} className="p-4 bg-orange-50 border-2 border-orange-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-5 h-5 text-orange-600" />
                        <span className="font-mono font-bold text-orange-800 text-lg">{item.ip || item.key}</span>
                        <Badge className="bg-orange-100 text-orange-700">{item.count} tentatives</Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleBlock(item.ip)} className="text-red-600">
                        <Ban className="w-4 h-4 mr-1" /> Bloquer
                      </Button>
                    </div>
                    {item.geo && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Pays</p>
                          <p className="text-sm font-bold">{getFlagEmoji(item.geo.countryCode)} {item.geo.country}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Ville</p>
                          <p className="text-sm font-bold">{item.geo.city}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Région</p>
                          <p className="text-sm font-bold">{item.geo.region}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">FAI</p>
                          <p className="text-xs font-bold">{item.geo.isp}</p>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* SECTION 3 : ALERTES FRAUDE */}
      {activeTab === 'alerts' && (
        <Card>
          <CardHeader><CardTitle>Alertes de Fraude</CardTitle></CardHeader>
          <CardContent>
            {fraudAlerts.length === 0 ? (
              <p className="text-slate-400 text-center py-8">✅ Aucune alerte</p>
            ) : (
              <div className="space-y-3 max-h-[600px] overflow-y-auto">
                {fraudAlerts.map((alert: any, i: number) => (
                  <div key={i} className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        <span className="font-mono font-bold text-yellow-800 text-lg">{alert.ip}</span>
                        <Badge className={alert.flagged ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}>
                          {alert.flagged ? '🚨 FRAUDEUR' : '⚠️ Suspect'}
                        </Badge>
                      </div>
                      <Button variant="outline" size="sm" onClick={() => handleBlock(alert.ip)} className="text-red-600">
                        <Ban className="w-4 h-4 mr-1" /> Bloquer
                      </Button>
                    </div>
                    {alert.geo && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Pays</p>
                          <p className="text-sm font-bold">{getFlagEmoji(alert.geo.countryCode)} {alert.geo.country}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Ville</p>
                          <p className="text-sm font-bold">{alert.geo.city}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">Région</p>
                          <p className="text-sm font-bold">{alert.geo.region}</p>
                        </div>
                        <div className="bg-white rounded-lg p-2">
                          <p className="text-[10px] text-slate-400 uppercase">FAI</p>
                          <p className="text-xs font-bold">{alert.geo.isp}</p>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-slate-500">
                      {alert.type} — {alert.path} — {new Date(alert.timestamp).toLocaleString('fr-FR')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <div className="flex gap-2 text-xs text-slate-400 justify-center">
        <Globe className="w-3 h-3" />
        <span>Défenses actives : Rate Limiting • Token Bucket • Tarpitting • Fail2ban • VPN Blocker • Anti-Detect Browser</span>
      </div>
    </div>
  );
}