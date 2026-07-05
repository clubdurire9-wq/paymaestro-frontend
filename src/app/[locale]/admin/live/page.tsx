'use client';

import { useState, useEffect, useCallback } from 'react';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import { 
  Activity, Eye, RefreshCw, DollarSign, Users, 
  TrendingUp, Undo2, Loader2, Search, ArrowLeft, MapPin,
  FileText
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { api, Transaction } from '@/lib/api';
import { generateTransactionPDF } from '@/lib/pdf-export';
import MapEmbed from '@/components/ui/MapEmbed';

export default function AdminLivePage() {
  const locale = useLocale();
  const searchParams = useSearchParams();

  const [activities, setActivities] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userActivity, setUserActivity] = useState<any>(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [refunding, setRefunding] = useState<number | null>(null);
  const [userGeo, setUserGeo] = useState<any>(null);
  const [userCountries, setUserCountries] = useState<any>(null);

  // États pour la modale de remboursement avec vérification
  const [showRefundModal, setShowRefundModal] = useState(false);
  const [refundTx, setRefundTx] = useState<any>(null);
  const [refundOption, setRefundOption] = useState<'WALLET' | 'CORRECT_NUMBER' | 'PAYPAL'>('WALLET');
  const [correctPhone, setCorrectPhone] = useState('');
  const [correctOperator, setCorrectOperator] = useState('');
  const [refundReason, setRefundReason] = useState('');
  const [verificationAnswers, setVerificationAnswers] = useState({ email: '', amount: '', date: '', number: '', operator: '' });
  const [verificationPassed, setVerificationPassed] = useState(false);

  // États pour la modale de vérification de réclamation
  const [claimData, setClaimData] = useState<any>(null);
  const [refundType, setRefundType] = useState<string>('WALLET');
  const [refundPhone, setRefundPhone] = useState('');
  const [refundOperator, setRefundOperator] = useState('');
  const [refundPaypalEmail, setRefundPaypalEmail] = useState('');
  const [refundBankIban, setRefundBankIban] = useState('');
  const [refundBankSwift, setRefundBankSwift] = useState('');
  const [refundBankHolder, setRefundBankHolder] = useState('');
  const [refundBankName, setRefundBankName] = useState('');

  const getFlagEmoji = (countryCode: string) => {
    if (!countryCode) return '🌍';
    const codePoints = countryCode
      .toUpperCase()
      .split('')
      .map((char: string) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
  };

  const loadData = useCallback(async () => {
    try {
      const [act, st] = await Promise.all([
        api.admin.getLiveActivity(),
        api.admin.getLiveStats(),
      ]);
      setActivities(act || []);
      setStats(st);
    } catch {}
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    let interval: any;
    if (autoRefresh) {
      interval = setInterval(loadData, 5000);
    }
    return () => clearInterval(interval);
  }, [autoRefresh, loadData]);

  const [userProfile, setUserProfile] = useState<any>(null);

  const handleViewUser = async (userId: string) => {
    try {
      const [d, profile] = await Promise.all([
        api.admin.getUserActivity(userId),
        api.admin.getUserProfile(userId).catch(() => null),
      ]);
      setUserActivity(d);
      setUserProfile(profile);
      setSelectedUser(userId);
    } catch {}
  };

  // Charger l'utilisateur depuis l'URL ?userId=xxx (lien depuis la recherche admin)
  useEffect(() => {
    const userId = searchParams?.get('userId');
    if (userId) {
      handleViewUser(userId);
    }
  }, []);

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
      console.error('❌ Erreur export PDF admin:', e);
    }
  };

  const handleShowGeo = async (email: string) => {
    try {
      const d = await api.admin.getUserGeo(email);
      const geoLoc = d?.geoLocations?.find((g: any) => g.isCurrentIP) || d?.geoLocations?.[0];
      setUserGeo({
        userEmail: d?.user?.email || email,
        lastIP: d?.user?.lastIP || d?.user?.last_ip || '',
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
  };

  const handleVerifyClaim = async (transactionId: number) => {
    try {
      const d = await api.admin.verifyClaim(String(transactionId));
      setClaimData(d);

      if (d?.transaction?.type === 'WITHDRAWAL' && d?.transaction?.method === 'INTERNAL') {
        try {
          const pmData = await api.admin.getPmToPmDetails(String(transactionId));
          setClaimData({ ...d, pm2pmDetails: pmData });
        } catch {}
      }
    } catch {}
  };

  // Clic sur le bouton de remboursement (ouvre la modale)
  const handleRefundClick = (tx: any) => {
    setRefundTx(tx);
    setShowRefundModal(true);
    setVerificationPassed(false);
    setVerificationAnswers({ email: '', amount: '', date: '', number: '', operator: '' });
    setRefundOption('WALLET');
    setCorrectPhone('');
    setCorrectOperator('');
    setRefundReason('');
  };

  // Vérification des réponses de l'utilisateur
  const handleVerify = () => {
    const tx = refundTx;
    const ans = verificationAnswers;
    const userEmail = tx?.user?.email || '';
    const txAmount = tx?.amountUSD?.toFixed(2) || '';
    const txDate = new Date(tx?.createdAt).toLocaleDateString('fr-FR');
    
    if (
      ans.email.toLowerCase() === userEmail.toLowerCase() &&
      ans.amount === txAmount &&
      ans.date === txDate
    ) {
      setVerificationPassed(true);
    } else {
      alert('❌ Vérification échouée. Les informations ne correspondent pas.');
    }
  };

  // Remboursement avec option enrichie
  const handleRefund = async (transactionId: number, type?: string) => {
    const reason = refundReason || 'Remboursement admin';
    if (!reason) return;

    setRefunding(transactionId);
    try {
      if (type === 'WALLET' || !type) {
        await api.admin.refund(String(transactionId), reason);
      } else if (type === 'MOBILE_MONEY') {
        await api.admin.refundToMobile({ transactionId, targetPhone: refundPhone, targetOperator: refundOperator, reason });
      } else if (type === 'MOBILE_TO_WALLET') {
        await api.admin.refund(String(transactionId), reason);
      } else if (type === 'PAYPAL') {
        await api.admin.refundToPayPal({ transactionId, amount: parseFloat(claimData?.transaction?.amount_usd || 0), paypalEmail: refundPaypalEmail, reason });
      } else if (type === 'BANK') {
        await api.admin.refundToBank({ transactionId, amount: parseFloat(claimData?.transaction?.amount_usd || 0), bankDetails: { iban: refundBankIban, swift: refundBankSwift, accountHolder: refundBankHolder }, reason });
      } else if (type === 'STRIPE') {
        await api.admin.refund(String(transactionId), reason);
      } else if (type === 'PM2PM') {
        await api.admin.reversePmToPm(String(claimData?.transaction?.id), reason);
      } else if (refundOption === 'CORRECT_NUMBER') {
        await api.admin.refundWithOptions({ transactionId, reason, refundOption: 'CORRECT_NUMBER', correctPhone, correctOperator });
      } else {
        await api.admin.refund(String(transactionId), reason);
      }
    } catch {}
    setRefunding(null);
    setShowRefundModal(false);
    setClaimData(null);
    loadData();
  };

  // Soumission du remboursement depuis la modale
  const handleRefundSubmit = async () => {
    if (!refundReason) { alert('Veuillez entrer un motif'); return; }
    setRefunding(refundTx.id);
    try {
      await api.admin.refundWithOptions({ transactionId: refundTx.id, reason: refundReason, refundOption, correctPhone, correctOperator });
    } catch {}
    setRefunding(null);
    setShowRefundModal(false);
    loadData();
  };

  const getTypeBadge = (type: string) => {
    const colors: any = {
      DEPOSIT: 'bg-green-100 text-green-800',
      WITHDRAWAL: 'bg-red-100 text-red-800',
      CONVERSION: 'bg-blue-100 text-blue-800',
      FEE: 'bg-yellow-100 text-yellow-800',
    };
    return colors[type] || 'bg-gray-100';
  };

  if (loading) {
    return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-violet-600" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-8 h-8 text-red-600 animate-pulse" />
            Activité en Temps Réel
          </h1>
          <p className="text-sm text-slate-500 mt-1">Surveillez toutes les transactions des utilisateurs</p>
        </div>
        <div className="flex gap-2">
          <Button variant={autoRefresh ? 'primary' : 'outline'} onClick={() => setAutoRefresh(!autoRefresh)} size="sm">
            {autoRefresh ? '⏸️ Pause' : '▶️ Live'}
          </Button>
          <Button variant="outline" onClick={loadData} size="sm">
            <RefreshCw className="w-4 h-4 mr-1" />
            Rafraîchir
          </Button>
        </div>
      </div>

      {/* STATS */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Utilisateurs</p><p className="text-2xl font-bold">{stats.totalUsers}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Volume Total</p><p className="text-2xl font-bold text-green-600">${stats.totalVolumeUSD}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Transactions</p><p className="text-2xl font-bold">{stats.totalTransactions}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">En Attente</p><p className="text-2xl font-bold text-orange-600">{stats.pendingTransfers}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Volume Aujourd'hui</p><p className="text-2xl font-bold text-blue-600">${stats.todayVolumeUSD}</p></CardContent></Card>
          <Card><CardContent className="p-4 text-center"><p className="text-xs text-slate-500">Actifs Aujourd'hui</p><p className="text-2xl font-bold">{stats.activeUsersToday}</p></CardContent></Card>
        </div>
      )}

      {/* UTILISATEURS PAR PAYS */}
      {userCountries && (
        <Card>
          <CardHeader><CardTitle>🌍 Utilisateurs connectés par pays</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 max-h-[300px] overflow-y-auto">
              {Object.entries(userCountries || {}).map(([country, count]: any) => (
                <div key={country} className="p-2 bg-slate-50 rounded-lg text-center">
                  <p className="text-2xl">{getFlagEmoji(country)}</p>
                  <p className="text-xs font-bold">{country}</p>
                  <p className="text-lg font-extrabold text-violet-600">{count}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* FLUX D'ACTIVITÉ */}
      <Card>
        <CardHeader><CardTitle>Flux en direct</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-[600px] overflow-y-auto">
            {activities.map((act: any) => (
              <div key={act.id} className={`flex items-center justify-between p-3 rounded-xl ${act.status === 'REFUNDED' ? 'bg-yellow-50 border border-yellow-200' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3 flex-1">
                  <Badge variant={act.type === 'DEPOSIT' ? 'success' : act.type === 'WITHDRAWAL' ? 'error' : 'info'}>
                    {act.type === 'DEPOSIT' ? '⬇️ Dépôt' : act.type === 'WITHDRAWAL' ? '⬆️ Retrait' : '🔄 Conv'}
                  </Badge>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold truncate">{act.user?.email || act.user?.name}</span>
                      {act.status === 'REFUNDED' && (
                        <Badge variant="warning">REMBOURSÉ</Badge>
                      )}
                      <button onClick={() => handleShowGeo(act.user?.email)} className="text-xs text-blue-600 hover:underline flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        Localiser
                      </button>
                    </div>
                    <p className="text-xs text-slate-400 truncate">
                      {act.amountCurrency?.toLocaleString('fr-FR')} {act.currencyCode} 
                      {act.metadata?.targetPhone ? ` → ${act.metadata.targetPhone}` : ''}
                      {act.notes ? ` - ${act.notes}` : ''}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <span className={`text-sm font-bold ${act.type === 'DEPOSIT' ? 'text-green-600' : 'text-red-600'}`}>
                    {act.type === 'DEPOSIT' ? '+' : '-'}${act.amountUSD?.toFixed(2)}
                  </span>
                  <span className="text-xs text-slate-400">
                    {new Date(act.createdAt).toLocaleTimeString('fr-FR')}
                  </span>
                  <button onClick={() => handleViewUser(act.user_id)} className="p-1 hover:bg-violet-100 rounded" title="Voir utilisateur">
                    <Eye className="w-4 h-4 text-slate-400" />
                  </button>
                  {act.type === 'WITHDRAWAL' && act.status !== 'REFUNDED' && (
                    <>
                      <button 
                        onClick={() => handleRefundClick(act)} 
                        className="p-1 hover:bg-green-100 rounded" 
                        title="Rembourser (vérification)"
                      >
                        <Undo2 className="w-4 h-4 text-green-600" />
                      </button>
                      <button 
                        onClick={() => handleVerifyClaim(act.id)} 
                        className="p-1 hover:bg-orange-100 rounded" 
                        title="Vérifier réclamation"
                      >
                        <Search className="w-4 h-4 text-orange-600" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {activities.length === 0 && (
              <p className="text-slate-400 text-center py-8">Aucune activité</p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ACTIVITÉ UTILISATEUR (si sélectionné) */}
      {userActivity && (
        <Card className="border-2 border-violet-300">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Activité de l'utilisateur</CardTitle>
              <div className="flex items-center gap-2">
                {userProfile && (
                  <button onClick={handleExportUserPDF} className="p-1.5 hover:bg-violet-100 rounded-lg text-violet-600 transition-colors" title="Exporter le relevé PDF officiel">
                    <FileText className="w-4 h-4" />
                  </button>
                )}
                <button onClick={() => { setSelectedUser(null); setUserActivity(null); setUserProfile(null); }}>
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold mb-2">Transactions Wallet</h4>
                {userActivity.wallet?.slice(0, 10).map((tx: any) => (
                  <div key={tx.id} className="text-xs p-2 bg-slate-50 rounded mb-1 flex justify-between">
                    <span>{tx.type} - {tx.amount_currency} {tx.currency_code}</span>
                    <span className="text-slate-400">{new Date(tx.created_at).toLocaleDateString('fr-FR')}</span>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="font-semibold mb-2">Transactions PayPal</h4>
                {userActivity.paypal?.slice(0, 10).map((tx: any) => (
                  <div key={tx.id} className="text-xs p-2 bg-slate-50 rounded mb-1 flex justify-between">
                    <span>${tx.amount_usd} → {tx.amount_local_currency} {tx.currency_code}</span>
                    <Badge variant={tx.status === 'MOBILE_MONEY_SENT' ? 'success' : tx.status === 'FAILED' ? 'error' : 'warning'}>
                      {tx.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* MODALE DE LOCALISATION */}
      {userGeo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="font-bold text-lg mb-4">📍 Localisation de l'utilisateur</h3>
            
            <div className="space-y-3">
              <p><strong>Email :</strong> {userGeo.userEmail}</p>
              <p><strong>Dernière IP :</strong> {userGeo.lastIP}</p>
              <p><strong>Dernière connexion :</strong> {new Date(userGeo.lastLogin).toLocaleString('fr-FR')}</p>
              
              <div className="bg-blue-50 rounded-xl p-4 space-y-2">
                <p><strong>Pays :</strong> {getFlagEmoji(userGeo.geo?.countryCode)} {userGeo.geo?.country}</p>
                <p><strong>Ville :</strong> {userGeo.geo?.city}</p>
                <p><strong>Région :</strong> {userGeo.geo?.region}</p>
                <p><strong>FAI :</strong> {userGeo.geo?.isp}</p>
                <p><strong>Organisation :</strong> {userGeo.geo?.org}</p>
              </div>

              <MapEmbed
                lat={userGeo.geo?.lat || 0}
                lon={userGeo.geo?.lon || 0}
                country={userGeo.geo?.country}
                city={userGeo.geo?.city}
                className="w-full h-48"
              />
            </div>

            <Button className="w-full mt-4" onClick={() => setUserGeo(null)}>Fermer</Button>
          </div>
        </div>
      )}

      {/* MODALE DE REMBOURSEMENT AVEC VÉRIFICATION */}
      {showRefundModal && refundTx && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto space-y-4">
            <h3 className="text-xl font-bold">🔍 Vérification & Remboursement</h3>

            {!verificationPassed ? (
              <>
                <p className="text-sm text-slate-600">Posez ces questions à l'utilisateur :</p>
                <div className="space-y-2">
                  <input 
                    placeholder="Email de l'utilisateur" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setVerificationAnswers({...verificationAnswers, email: e.target.value})} 
                  />
                  <input 
                    placeholder="Montant exact ($)" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setVerificationAnswers({...verificationAnswers, amount: e.target.value})} 
                  />
                  <input 
                    placeholder="Date du retrait (JJ/MM/AAAA)" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setVerificationAnswers({...verificationAnswers, date: e.target.value})} 
                  />
                  <input 
                    placeholder="Numéro utilisé" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setVerificationAnswers({...verificationAnswers, number: e.target.value})} 
                  />
                  <input 
                    placeholder="Opérateur" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setVerificationAnswers({...verificationAnswers, operator: e.target.value})} 
                  />
                </div>
                <Button onClick={handleVerify} className="w-full">Vérifier l'identité</Button>
              </>
            ) : (
              <>
                <Badge variant="success">✅ Identité vérifiée</Badge>
                <div className="space-y-3">
                  <label className="text-sm font-semibold">Option de remboursement</label>
                  <div className="space-y-2">
                    {[
                      { value: 'WALLET', label: '💰 Recharger le Wallet USD' },
                      { value: 'CORRECT_NUMBER', label: '📱 Envoyer sur le bon numéro' },
                      { value: 'PAYPAL', label: '🏦 Rembourser sur PayPal' },
                    ].map(opt => (
                      <button 
                        key={opt.value} 
                        onClick={() => setRefundOption(opt.value as any)}
                        className={`w-full p-3 rounded-xl border-2 text-left text-sm ${refundOption === opt.value ? 'border-violet-600 bg-violet-50' : 'border-slate-200'}`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>

                  {refundOption === 'CORRECT_NUMBER' && (
                    <>
                      <input 
                        placeholder="Numéro correct" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                        onChange={(e) => setCorrectPhone(e.target.value)} 
                      />
                      <input 
                        placeholder="Opérateur correct" 
                        className="w-full px-3 py-2 border rounded-lg text-sm" 
                        onChange={(e) => setCorrectOperator(e.target.value)} 
                      />
                    </>
                  )}

                  <input 
                    placeholder="Motif du remboursement" 
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                    onChange={(e) => setRefundReason(e.target.value)} 
                  />
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="w-full" onClick={() => setShowRefundModal(false)}>Annuler</Button>
                  <Button 
                    className="w-full" 
                    onClick={handleRefundSubmit} 
                    disabled={refunding === refundTx?.id}
                  >
                    {refunding === refundTx?.id ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅ Rembourser'}
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* MODALE DE VÉRIFICATION RÉCLAMATION */}
      {claimData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto shadow-2xl">
            <h2 className="text-xl font-bold mb-4">🔍 Vérification de réclamation</h2>
            
            {/* Infos transaction */}
            <div className="bg-slate-50 p-4 rounded-xl mb-4 space-y-2 text-sm">
              <p><strong>Transaction :</strong> #{claimData.transaction.id}</p>
              <p><strong>Montant :</strong> {claimData.transaction.amount_currency} {claimData.transaction.currency_code} (${claimData.transaction.amount_usd})</p>
              <p><strong>Destinataire :</strong> {claimData.transaction.metadata?.targetPhone}</p>
              <p><strong>Date :</strong> {new Date(claimData.transaction.created_at).toLocaleString('fr-FR')}</p>
            </div>

            {/* Évaluation des risques */}
            <div className="grid grid-cols-3 gap-2 mb-4">
              <div className={`p-2 rounded-lg text-center text-xs ${claimData.riskAssessment.isFirstRefund ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {claimData.riskAssessment.isFirstRefund ? '✅ Première réclamation' : `⚠️ ${claimData.riskAssessment.previousRefunds} réclamations`}
              </div>
              <div className={`p-2 rounded-lg text-center text-xs ${claimData.riskAssessment.otherTransfersToTarget === 0 ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
                {claimData.riskAssessment.otherTransfersToTarget === 0 ? '✅ Numéro inconnu' : `⚠️ ${claimData.riskAssessment.otherTransfersToTarget} transferts vers ce N°`}
              </div>
              <div className={`p-2 rounded-lg text-center text-xs ${!claimData.riskAssessment.isRepeatTarget ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                {!claimData.riskAssessment.isRepeatTarget ? '✅ 1er envoi vers ce N°' : '⚠️ Transferts répétés'}
              </div>
            </div>

            {/* Questions de vérification */}
            <div className="space-y-2 mb-4">
              <h4 className="font-semibold text-sm">📋 Questions à poser :</h4>
              {claimData.questions.map((q: any) => (
                <div key={q.id} className="bg-blue-50 p-2 rounded-lg text-xs">
                  <p className="text-blue-900">{q.id}. {q.question}</p>
                  <p className="text-blue-600 font-semibold">Réponse attendue : {q.expectedAnswer}</p>
                </div>
              ))}
            </div>

            {/* Options de remboursement */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">💳 Type de remboursement :</h4>
              {claimData.refundOptions.map((opt: any) => (
                <button
                  key={opt.type}
                  onClick={() => setRefundType(opt.type)}
                  disabled={opt.disabled}
                  className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                    refundType === opt.type ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                  } ${opt.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <span className="font-semibold">{opt.label}</span>
                  {opt.note && <span className="text-xs text-slate-400 ml-2">({opt.note})</span>}
                </button>
              ))}
              
              {/* Ajout de l'option PM2PM */}
              <button
                onClick={() => setRefundType('PM2PM')}
                disabled={false}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'PM2PM' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">🔄 Rembourser PM→PM (inverser)</span>
              </button>
              
              {/* Ajout des options PayPal et Banque */}
              <button
                onClick={() => setRefundType('PAYPAL')}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'PAYPAL' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">💳 Rembourser sur PayPal</span>
              </button>
              
              <button
                onClick={() => setRefundType('BANK')}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'BANK' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">🏦 Rembourser sur compte bancaire</span>
              </button>

              <button
                onClick={() => setRefundType('STRIPE')}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'STRIPE' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">🏦 Rembourser via Stripe (IBAN)</span>
              </button>

              {/* NOUVEAU : Option Banque → Wallet */}
              <button
                onClick={() => setRefundType('BANK_TO_WALLET')}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'BANK_TO_WALLET' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">🏦 Rembourser Banque → Wallet</span>
              </button>

              {/* NOUVEAU : Option Mobile → Wallet */}
              <button
                onClick={() => setRefundType('MOBILE_TO_WALLET')}
                className={`w-full p-3 rounded-xl border-2 text-left text-sm transition-all ${
                  refundType === 'MOBILE_TO_WALLET' ? 'border-violet-600 bg-violet-50' : 'border-slate-200'
                }`}
              >
                <span className="font-semibold">📱 Rembourser Mobile → Wallet</span>
              </button>

              {/* Section PM2PM */}
              {refundType === 'PM2PM' && claimData && (
                <div className="space-y-2 pl-2 mt-3">
                  <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-xl border border-green-200">
                    <p className="text-sm font-bold text-green-800 mb-2">🔄 Remboursement PM→PM</p>
                    
                    {claimData.pm2pmDetails ? (
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Expéditeur :</span>
                          <span className="font-bold">{claimData.pm2pmDetails.sender?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email :</span>
                          <span className="font-mono text-xs">{claimData.pm2pmDetails.sender?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Destinataire :</span>
                          <span className="font-bold">{claimData.pm2pmDetails.recipient?.name}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Email :</span>
                          <span className="font-mono text-xs">{claimData.pm2pmDetails.recipient?.email}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Montant :</span>
                          <span className="font-bold text-lg">${claimData.pm2pmDetails.transaction?.amount?.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Solde destinataire :</span>
                          <span className={`font-bold ${claimData.pm2pmDetails.recipient?.balance >= claimData.pm2pmDetails.transaction?.amount ? 'text-green-600' : 'text-red-600'}`}>
                            ${claimData.pm2pmDetails.recipient?.balance?.toFixed(2)}
                          </span>
                        </div>
                        
                        {!claimData.pm2pmDetails.canRefund && (
                          <div className="bg-red-50 p-2 rounded-lg text-xs text-red-700 mt-2">
                            ⚠️ {claimData.pm2pmDetails.reasonIfCannot}
                          </div>
                        )}
                        
                        {claimData.pm2pmDetails.canRefund && (
                          <div className="bg-green-50 p-2 rounded-lg text-xs text-green-700 mt-2">
                            ✅ Remboursement possible. L'argent sera retourné du destinataire vers l'expéditeur.
                          </div>
                        )}
                      </div>
                    ) : (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>
              )}

              {/* Section Mobile → Wallet */}
              {refundType === 'MOBILE_TO_WALLET' && (
                <div className="space-y-2 pl-2 mt-3">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-xl border border-blue-200">
                    <p className="text-sm font-bold text-blue-800 mb-2">📱 Remboursement Mobile → Wallet</p>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Montant :</span>
                        <span className="font-bold text-lg">${claimData?.transaction?.amount_usd || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Destinataire :</span>
                        <span className="font-mono text-xs">{claimData?.transaction?.user?.email}</span>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg text-xs text-green-700 mt-2">
                        ✅ Le montant sera crédité sur le wallet de l'utilisateur.
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {refundType === 'MOBILE_MONEY' && (
                <div className="space-y-2 pl-2">
                  <input 
                    type="tel" 
                    placeholder="Bon numéro" 
                    value={refundPhone} 
                    onChange={(e) => setRefundPhone(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Opérateur (Orange, MTN...)" 
                    value={refundOperator} 
                    onChange={(e) => setRefundOperator(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                </div>
              )}

              {refundType === 'PAYPAL' && (
                <div className="space-y-2 pl-2 mt-3">
                  <input 
                    type="email" 
                    placeholder="Email PayPal du destinataire" 
                    value={refundPaypalEmail} 
                    onChange={(e) => setRefundPaypalEmail(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                </div>
              )}

              {refundType === 'BANK' && (
                <div className="space-y-2 pl-2 mt-3">
                  <input 
                    type="text" 
                    placeholder="IBAN" 
                    value={refundBankIban} 
                    onChange={(e) => setRefundBankIban(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="SWIFT / BIC" 
                    value={refundBankSwift} 
                    onChange={(e) => setRefundBankSwift(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Nom du titulaire" 
                    value={refundBankHolder} 
                    onChange={(e) => setRefundBankHolder(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                  <input 
                    type="text" 
                    placeholder="Nom de la banque" 
                    value={refundBankName} 
                    onChange={(e) => setRefundBankName(e.target.value)}
                    className="w-full px-3 py-2 border rounded-lg text-sm" 
                  />
                </div>
              )}

              {refundType === 'STRIPE' && (
                <div className="space-y-2 pl-2 mt-3">
                  <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800">
                    <p className="font-semibold mb-1">💡 Remboursement Stripe</p>
                    <p>L'argent sera crédité sur le portefeuille de l'utilisateur via son compte Stripe.</p>
                    <p className="mt-1">Si l'utilisateur n'a pas encore d'IBAN, un compte sera créé automatiquement.</p>
                  </div>
                </div>
              )}

              {/* NOUVEAU : Section Banque → Wallet */}
              {refundType === 'BANK_TO_WALLET' && (
                <div className="space-y-2 pl-2 mt-3">
                  <div className="bg-blue-50 p-3 rounded-xl text-xs text-blue-800">
                    <p className="font-semibold mb-1">🏦 Remboursement Banque → Wallet</p>
                    <p>L'argent sera crédité directement sur le portefeuille de l'utilisateur comme un dépôt bancaire.</p>
                    <p className="mt-1">Frais : 0% (remboursement admin)</p>
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" className="w-full" onClick={() => setClaimData(null)}>Annuler</Button>
              <Button 
                className="w-full" 
                onClick={() => handleRefund(claimData.transaction.id, refundType)}
                disabled={refunding !== null || (refundType === 'MOBILE_MONEY' && (!refundPhone || !refundOperator)) || (refundType === 'PM2PM' && claimData?.pm2pmDetails && !claimData.pm2pmDetails.canRefund)}
              >
                {refunding ? <Loader2 className="w-4 h-4 animate-spin" /> : '✅ Confirmer le remboursement'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}