'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft, FileText, MapPin, Loader2, Mail, Phone, Globe,
  CheckCircle, XCircle, Clock, AlertTriangle, DollarSign, Wallet,
  CreditCard, Bitcoin, PiggyBank, BookOpen, Shield, LifeBuoy,
  Key, Snowflake, TrendingUp, Activity, Headphones
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Transaction } from '@/lib/api';
import { generateTransactionPDF } from '@/lib/pdf-export';
import MapEmbed from '@/components/ui/MapEmbed';

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
        kycStatus: userProfile?.kyc_status,
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
                  {userProfile?.name || 'Utilisateur'}
                </h1>
                <p className="text-sm text-slate-400 mt-1">{userProfile?.id}</p>
                <div className="flex flex-wrap gap-2 mt-3">
                  <Badge variant={userProfile?.kyc_status === 'APPROVED' ? 'success' : userProfile?.kyc_status === 'REJECTED' ? 'error' : 'warning'} className="text-xs">
                    {userProfile?.kyc_status === 'APPROVED' ? 'KYC Approuvé' : userProfile?.kyc_status === 'REJECTED' ? 'KYC Rejeté' : 'KYC: ' + (userProfile?.kyc_status || 'NONE')}
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

        {/* Statistiques */}
        {userActivity && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4 text-center">
                <DollarSign className="w-5 h-5 text-green-600 mx-auto mb-1" />
                <p className="text-2xl font-bold text-green-600">
                  ${(userActivity.wallet?.reduce((s: number, t: any) => s + parseFloat(t.amount_usd || 0), 0) || 0).toFixed(2)}
                </p>
                <p className="text-xs text-slate-400">Volume Wallet</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Activity className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">
                  {(userActivity.wallet?.length || 0) + (userActivity.paypal?.length || 0)}
                </p>
                <p className="text-xs text-slate-400">Transactions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Wallet className="w-5 h-5 text-violet-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">{userActivity.wallet?.length || 0}</p>
                <p className="text-xs text-slate-400">Wallet</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <CreditCard className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                <p className="text-2xl font-bold">{userActivity.paypal?.length || 0}</p>
                <p className="text-xs text-slate-400">PayPal / Legacy</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Toutes les transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Dernières transactions</span>
              <span className="text-sm font-normal text-slate-400">
                {((userActivity?.wallet?.length || 0) + (userActivity?.paypal?.length || 0))} au total
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
              {userActivity?.wallet?.slice(0, 50).map((tx: any) => (
                <div key={`w-${tx.id}`} className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant={tx.type === 'DEPOSIT' ? 'success' : tx.type === 'WITHDRAWAL' ? 'error' : 'info'} className="shrink-0">
                      {tx.type === 'DEPOSIT' ? 'DÉPÔT' : tx.type === 'WITHDRAWAL' ? 'RETRAIT' : tx.type === 'FEE' ? 'FRAIS' : tx.type === 'CONVERSION' ? 'CONV' : tx.type}
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
              ))}
              {userActivity?.paypal?.slice(0, 50).map((tx: any) => (
                <div key={`p-${tx.id}`} className="flex items-center justify-between text-xs p-3 bg-slate-50 dark:bg-slate-800 rounded-xl">
                  <div className="flex items-center gap-2 min-w-0">
                    <Badge variant="info" className="shrink-0">PAYPAL</Badge>
                    <span className="font-medium truncate">
                      ${parseFloat(tx.amount_usd || 0).toFixed(2)} → {parseFloat(tx.amount_local_currency || 0).toLocaleString('fr-FR')} {tx.currency_code}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <Badge variant={tx.status === 'MOBILE_MONEY_SENT' ? 'success' : tx.status === 'FAILED' ? 'error' : 'warning'}>
                      {tx.status === 'MOBILE_MONEY_SENT' ? 'Succès' : tx.status === 'FAILED' ? 'Échec' : tx.status}
                    </Badge>
                    <span className="text-slate-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              ))}
              {(!userActivity?.wallet?.length && !userActivity?.paypal?.length) && (
                <p className="text-slate-400 text-center py-8 text-sm">Aucune transaction trouvée</p>
              )}
            </div>
          </CardContent>
        </Card>
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
