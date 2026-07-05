'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, MapPin, Loader2, Mail, Phone, Globe,
  CheckCircle, XCircle, Clock, DollarSign, Wallet,
  CreditCard, Bitcoin, PiggyBank, TrendingUp, Activity,
  ChevronDown, ChevronRight, Smartphone, Landmark
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Transaction } from '@/lib/api';
import { generateTransactionPDF } from '@/lib/pdf-export';
import MapEmbed from '@/components/ui/MapEmbed';

type ServiceKey = 'mobile_deposit' | 'withdrawal' | 'wallet' | 'iban_deposit' | 'crypto' | 'paypal' | 'cards' | 'conversion' | 'fee';

interface ServiceDef {
  key: ServiceKey;
  label: string;
  icon: React.ElementType;
  color: string;
  getCount: (activity: any) => number;
  getTxs: (activity: any) => any[];
}

const SERVICES: ServiceDef[] = [
  { key: 'mobile_deposit', label: 'Dépôt Mobile Money', icon: Smartphone, color: 'green',
    getCount: (a) => (a?.wallet || []).filter((t: any) => t.type === 'DEPOSIT').length,
    getTxs: (a) => (a?.wallet || []).filter((t: any) => t.type === 'DEPOSIT') },
  { key: 'withdrawal', label: 'Retrait', icon: TrendingUp, color: 'red',
    getCount: (a) => (a?.wallet || []).filter((t: any) => t.type === 'WITHDRAWAL').length,
    getTxs: (a) => (a?.wallet || []).filter((t: any) => t.type === 'WITHDRAWAL') },
  { key: 'wallet', label: 'Wallet (solde)', icon: Wallet, color: 'violet',
    getCount: (a) => (a?.wallet || []).filter((t: any) => t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL').length,
    getTxs: (a) => (a?.wallet || []).filter((t: any) => t.type === 'DEPOSIT' || t.type === 'WITHDRAWAL') },
  { key: 'conversion', label: 'Conversion', icon: Activity, color: 'blue',
    getCount: (a) => (a?.wallet || []).filter((t: any) => t.type === 'CONVERSION').length,
    getTxs: (a) => (a?.wallet || []).filter((t: any) => t.type === 'CONVERSION') },
  { key: 'fee', label: 'Frais', icon: Clock, color: 'yellow',
    getCount: (a) => (a?.wallet || []).filter((t: any) => t.type === 'FEE').length,
    getTxs: (a) => (a?.wallet || []).filter((t: any) => t.type === 'FEE') },
  { key: 'paypal', label: 'PayPal / Legacy', icon: CreditCard, color: 'orange',
    getCount: (a) => a?.paypal?.length || 0,
    getTxs: (a) => a?.paypal || [] },
  { key: 'iban_deposit', label: 'IBAN Dépôt', icon: Landmark, color: 'blue',
    getCount: () => 0, getTxs: () => [] },
  { key: 'crypto', label: 'Crypto (BTC/ETH/USDT)', icon: Bitcoin, color: 'orange',
    getCount: () => 0, getTxs: () => [] },
  { key: 'cards', label: 'Cartes virtuelles', icon: CreditCard, color: 'purple',
    getCount: () => 0, getTxs: () => [] },
];

const SERVICE_BADGE: Record<string, 'success' | 'error' | 'info' | 'warning'> = {
  DEPOSIT: 'success', WITHDRAWAL: 'error', CONVERSION: 'info', FEE: 'warning',
};

const SERVICE_LABEL: Record<string, string> = {
  DEPOSIT: 'DÉPÔT', WITHDRAWAL: 'RETRAIT', CONVERSION: 'CONV', FEE: 'FRAIS',
};

export default function AdminUserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const userId = params?.userId as string;

  const [userProfile, setUserProfile] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [userGeo, setUserGeo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showGeoModal, setShowGeoModal] = useState(false);
  const [loadingGeo, setLoadingGeo] = useState(false);
  const [expandedService, setExpandedService] = useState<ServiceKey | null>(null);

  useEffect(() => {
    if (!userId) return;
    (async () => {
      try {
        const [activity, profile] = await Promise.all([
          api.admin.getUserActivity(userId),
          api.admin.getUserProfile(userId).catch(() => null),
        ]);
        setUserActivity(activity);
        setUserProfile(profile);
      } catch (e) {
        console.error('Erreur chargement utilisateur:', e);
      } finally {
        setLoading(false);
      }
    })();
  }, [userId]);

  const handleShowGeo = async () => {
    const email = userProfile?.email;
    if (!email) return;
    setLoadingGeo(true);
    setShowGeoModal(true);
    try {
      const d = await api.admin.getUserGeo(email);
      const geoLoc = d?.geoLocations?.find((g: any) => g.isCurrentIP) || d?.geoLocations?.[0];
      setUserGeo({
        userEmail: d?.user?.email || email,
        lastIP: d?.user?.lastIP || '',
        lastLogin: d?.user?.createdAt || '',
        geo: geoLoc ? {
          countryCode: geoLoc.countryCode || '',
          country: geoLoc.country || '',
          city: geoLoc.city || '',
          region: geoLoc.region || '',
          isp: geoLoc.isp || '',
          org: geoLoc.org || '',
          lat: geoLoc.lat || 0,
          lon: geoLoc.lon || 0,
        } : null,
      });
    } catch {}
    setLoadingGeo(false);
  };

  const handleExportUserPDF = () => {
    if (!userActivity || !userProfile) return;
    try {
      const walletTxs: Transaction[] = (userActivity.wallet || []).map((tx: any) => ({
        id: String(tx.id),
        date: tx.created_at,
        amountUSD: parseFloat(tx.amount_usd || 0),
        receivedAmount: parseFloat(tx.amount_currency || 0),
        currency: tx.currency_code || 'USD',
        status: tx.status === 'COMPLETED' ? 'MOBILE_MONEY_SENT' : tx.status === 'PENDING' ? 'PENDING' : 'FAILED',
        reference: tx.paystack_reference || tx.flutterwave_reference || '',
        phone: tx.metadata?.targetPhone || '',
        exchangeRate: parseFloat(tx.exchange_rate || 1),
        timeline: [],
      }));
      const paypalTxs: Transaction[] = (userActivity.paypal || []).map((tx: any) => ({
        id: String(tx.id),
        date: tx.created_at,
        amountUSD: parseFloat(tx.amount_usd || 0),
        receivedAmount: parseFloat(tx.amount_local_currency || 0),
        currency: tx.currency_code || 'USD',
        status: tx.status === 'MOBILE_MONEY_SENT' ? 'MOBILE_MONEY_SENT' : tx.status === 'FAILED' ? 'FAILED' : 'PENDING',
        reference: tx.paypal_order_id || '',
        phone: tx.phone_number || '',
        exchangeRate: parseFloat(tx.exchange_rate || 1),
        timeline: [],
      }));
      const allTxs = [...walletTxs, ...paypalTxs].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const doc = generateTransactionPDF(allTxs, {
        name: userProfile?.name || userProfile?.email || 'N/A',
        email: userProfile?.email || 'N/A',
        id: userProfile?.id || 'N/A',
        kycStatus: userProfile?.kyc_status || userProfile?.kycStatus,
      });
      const filename = `PayMaestro_Releve_${userProfile?.name || userProfile?.email}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('Erreur export PDF:', e);
    }
  };

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '';
    const codePoints = countryCode.toUpperCase().split('').map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const kycStatus = userProfile?.kyc_status || userProfile?.kycStatus;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-10 h-10 animate-spin text-violet-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm font-medium">Retour</span>
          </button>
          <div className="flex items-center gap-2">
            <button
              onClick={handleShowGeo}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-500 transition-colors"
              title="Localiser l'utilisateur"
            >
              <MapPin className="w-4 h-4" />
            </button>
            <button
              onClick={handleExportUserPDF}
              className="p-2 hover:bg-violet-100 dark:hover:bg-violet-900/30 rounded-lg text-violet-600 transition-colors"
              title="Exporter le relevé PDF"
            >
              <FileText className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Contenu */}
      <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* Profil */}
        <Card>
          <CardContent className="p-6 md:p-8">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              <div className="w-20 h-20 rounded-full bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center text-violet-600 font-bold text-3xl shrink-0">
                {userProfile?.name?.charAt(0)?.toUpperCase() || userProfile?.email?.charAt(0)?.toUpperCase() || '?'}
              </div>
              <div className="flex-1 min-w-0">
                <h1 className="text-2xl md:text-3xl font-bold text-slate-900 dark:text-white truncate">
                  {userProfile?.name || userProfile?.email || 'Utilisateur'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">ID: {userProfile?.id}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={kycStatus === 'APPROVED' ? 'success' : kycStatus === 'REJECTED' ? 'error' : 'warning'} className="text-xs">
                    {kycStatus === 'APPROVED' ? 'KYC Approuvé ✔️' : kycStatus === 'REJECTED' ? 'KYC Rejeté' : 'KYC: ' + (kycStatus || 'NONE')}
                  </Badge>
                  <Badge variant="default">{userProfile?.role || 'USER'}</Badge>
                  {userProfile?.email && (
                    <Badge variant="info" className="flex items-center gap-1">
                      <Mail className="w-3 h-3" /> {userProfile.email}
                    </Badge>
                  )}
                  {userProfile?.phone && (
                    <Badge variant="info" className="flex items-center gap-1">
                      <Phone className="w-3 h-3" /> {userProfile.phone}
                    </Badge>
                  )}
                  {userProfile?.country && (
                    <Badge variant="info" className="flex items-center gap-1">
                      <Globe className="w-3 h-3" /> {getFlagEmoji(userProfile.country)} {userProfile.country}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Services - grille de cartes cliquables */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SERVICES.map((svc) => {
            const count = svc.getCount(userActivity);
            const txs = svc.getTxs(userActivity);
            const isOpen = expandedService === svc.key;
            const Icon = svc.icon;

            return (
              <Card
                key={svc.key}
                className={`cursor-pointer transition-all hover:shadow-md ${isOpen ? 'ring-2 ring-violet-400' : ''}`}
                onClick={() => setExpandedService(isOpen ? null : svc.key)}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        svc.color === 'green' ? 'bg-green-100 dark:bg-green-900/20' :
                        svc.color === 'red' ? 'bg-red-100 dark:bg-red-900/20' :
                        svc.color === 'violet' ? 'bg-violet-100 dark:bg-violet-900/20' :
                        svc.color === 'blue' ? 'bg-blue-100 dark:bg-blue-900/20' :
                        svc.color === 'yellow' ? 'bg-yellow-100 dark:bg-yellow-900/20' :
                        svc.color === 'orange' ? 'bg-orange-100 dark:bg-orange-900/20' :
                        svc.color === 'purple' ? 'bg-purple-100 dark:bg-purple-900/20' :
                        'bg-slate-100 dark:bg-slate-800'
                      }`}>
                        <Icon className={`w-5 h-5 ${
                          svc.color === 'green' ? 'text-green-600' :
                          svc.color === 'red' ? 'text-red-600' :
                          svc.color === 'violet' ? 'text-violet-600' :
                          svc.color === 'blue' ? 'text-blue-600' :
                          svc.color === 'yellow' ? 'text-yellow-600' :
                          svc.color === 'orange' ? 'text-orange-600' :
                          svc.color === 'purple' ? 'text-purple-600' :
                          'text-slate-600'
                        }`} />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-slate-900 dark:text-white">{svc.label}</p>
                        <p className="text-xs text-slate-400">{count} transaction{count !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {count > 0 && (
                        <Badge variant={svc.key === 'withdrawal' ? 'error' : svc.key === 'mobile_deposit' ? 'success' : 'info'}>
                          {count}
                        </Badge>
                      )}
                      {isOpen ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                    </div>
                  </div>

                  {/* Transactions depliées */}
                  {isOpen && (
                    <div className="mt-4 space-y-1.5 border-t border-slate-100 dark:border-slate-800 pt-4" onClick={e => e.stopPropagation()}>
                      {txs.length > 0 ? txs.slice(0, 30).map((tx: any) => (
                        <div key={`${svc.key}-${tx.id}`} className="flex items-center justify-between text-xs p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl">
                          <div className="flex items-center gap-2 min-w-0">
                            <Badge variant={SERVICE_BADGE[tx.type] || 'info'} className="shrink-0">
                              {SERVICE_LABEL[tx.type] || tx.type}
                            </Badge>
                            <span className="font-medium truncate">
                              {parseFloat(tx.amount_currency || 0).toLocaleString('fr-FR')} {tx.currency_code}
                            </span>
                            {tx.metadata?.targetPhone && (
                              <span className="text-slate-400 truncate">→ {tx.metadata.targetPhone}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2 shrink-0 ml-2">
                            <span className="font-bold text-slate-700 dark:text-slate-300">
                              ${parseFloat(tx.amount_usd || 0).toFixed(2)}
                            </span>
                            <Badge variant={tx.status === 'COMPLETED' ? 'success' : tx.status === 'PENDING' ? 'warning' : 'error'}>
                              {tx.status === 'COMPLETED' ? 'Succès' : tx.status === 'PENDING' ? 'En attente' : 'Échec'}
                            </Badge>
                            <span className="text-slate-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</span>
                          </div>
                        </div>
                      )) : (
                        <p className="text-xs text-slate-400 text-center py-4">Aucune transaction pour ce service</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Modale Géolocalisation */}
      {showGeoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={() => { setShowGeoModal(false); setUserGeo(null); }}>
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 max-w-md w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Localisation de l'utilisateur</h3>
              <button onClick={() => { setShowGeoModal(false); setUserGeo(null); }} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            {loadingGeo ? (
              <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-violet-600" /></div>
            ) : (
              <div className="space-y-3">
                <p className="text-sm"><strong>Email :</strong> {userGeo?.userEmail || userProfile?.email}</p>
                <p className="text-sm"><strong>Dernière IP :</strong> {userGeo?.lastIP}</p>
                {userGeo?.geo && (
                  <>
                    <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 space-y-2">
                      <p className="text-sm"><strong>Pays :</strong> {getFlagEmoji(userGeo.geo.countryCode)} {userGeo.geo.country}</p>
                      <p className="text-sm"><strong>Ville :</strong> {userGeo.geo.city}</p>
                      <p className="text-sm"><strong>Région :</strong> {userGeo.geo.region}</p>
                      <p className="text-sm"><strong>FAI :</strong> {userGeo.geo.isp}</p>
                      <p className="text-sm"><strong>Organisation :</strong> {userGeo.geo.org}</p>
                    </div>
                    <MapEmbed
                      lat={userGeo.geo.lat}
                      lon={userGeo.geo.lon}
                      country={userGeo.geo.country}
                      city={userGeo.geo.city}
                      className="w-full h-48 rounded-xl"
                    />
                  </>
                )}
                {!userGeo?.geo && (
                  <p className="text-sm text-slate-500">Géolocalisation non disponible pour cette IP.</p>
                )}
              </div>
            )}
            <Button className="w-full mt-4" onClick={() => { setShowGeoModal(false); setUserGeo(null); }}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}
