'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { Bitcoin, ArrowUp, Copy, Loader2, QrCode, CheckCircle2, TrendingUp, TrendingDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

export default function CryptoPage() {
  const locale = useLocale();
  const { user } = useAuth();
  const isGatewayAdmin = user?.role === 'ADMIN' || user?.role === 'AGENT';

  const [rates, setRates] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCrypto, setSelectedCrypto] = useState('USDT');
  const [selectedNetwork, setSelectedNetwork] = useState('TRC20');
  const [depositAddress, setDepositAddress] = useState<any>(null);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');
  
  // États pour le retrait
  const [activeTab, setActiveTab] = useState<'deposit' | 'withdraw'>('deposit');
  const [withdrawAddress, setWithdrawAddress] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [withdrawing, setWithdrawing] = useState(false);
  const [withdrawResult, setWithdrawResult] = useState<any>(null);
  const [showCryptoConfirm, setShowCryptoConfirm] = useState(false);

  useEffect(() => {
    api.crypto.getRates()
      .then(d => { setRates(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const handleGenerateAddress = async () => {
    setGenerating(true);
    setError('');
    try {
      const d = await api.crypto.generateAddress(selectedCrypto, selectedNetwork);
      setDepositAddress(d);
    } catch (e: any) {
      setError(e.message || 'Erreur lors de la génération de l\'adresse');
    }
    setGenerating(false);
  };

  const handleWithdraw = async () => {
    if (!withdrawAddress || !withdrawAmount) return;
    setWithdrawing(true);
    try {
      const d = await api.crypto.withdraw({
        currency: selectedCrypto,
        network: selectedNetwork,
        amountUSD: parseFloat(withdrawAmount),
        destinationAddress: withdrawAddress,
      });
      setWithdrawResult(d);
    } catch (e: any) { alert(e.message || e); }
    setWithdrawing(false);
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
      <div className="flex items-center gap-3">
        <Bitcoin className="w-8 h-8 text-orange-500" />
        <h1 className="text-3xl font-bold">Dépôt Crypto</h1>
      </div>

      {/* Taux en direct */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {rates && Object.entries(rates).filter(([k]) => k !== 'supportedNetworks').map(([currency, data]: any) => (
          <Card key={currency} className="cursor-pointer hover:shadow-lg transition-all"
            onClick={() => setSelectedCrypto(currency)}>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{data.symbol} {currency}</p>
              <p className="text-3xl font-extrabold mt-2">${data.usd?.toLocaleString()}</p>
              <p className={`text-sm ${data.change24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {data.change24h >= 0 ? <TrendingUp className="w-3 h-3 inline" /> : <TrendingDown className="w-3 h-3 inline" />}
                {data.change24h}% (24h)
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Onglets Dépôt/Retrait */}
      <div className="flex gap-2 bg-slate-100 dark:bg-slate-700 p-1 rounded-xl">
        <button onClick={() => setActiveTab('deposit')}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'deposit' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-500 dark:text-slate-400'}`}>
          📥 Dépôt Crypto → Wallet
        </button>
        {isGatewayAdmin && (
          <button onClick={() => setActiveTab('withdraw')}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold ${activeTab === 'withdraw' ? 'bg-white dark:bg-slate-800 shadow' : 'text-slate-500 dark:text-slate-400'}`}>
            📤 Wallet → Crypto
          </button>
        )}
      </div>

      {/* Section Dépôt */}
      {activeTab === 'deposit' && (
        <>
          {/* Génération adresse */}
          <Card>
            <CardHeader><CardTitle>Déposer des {selectedCrypto}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                {rates?.supportedNetworks?.[selectedCrypto]?.map((net: string) => (
                  <button key={net} onClick={() => setSelectedNetwork(net)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold ${selectedNetwork === net ? 'bg-violet-600 text-white' : 'bg-slate-100 dark:bg-slate-700'}`}>
                    {net}
                  </button>
                ))}
              </div>

              <Button onClick={handleGenerateAddress} disabled={generating} icon={<QrCode className="w-4 h-4" />}>
                {generating ? 'Génération...' : 'Générer l\'adresse de dépôt'}
              </Button>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-700">
                  {error}
                </div>
              )}

              {depositAddress && (
                <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 space-y-4 text-center">
                  <img src={depositAddress.qrCode} alt="QR Code" className="mx-auto w-40 h-40" />
                  <p className="font-mono text-sm break-all bg-white dark:bg-slate-800 p-3 rounded-lg">{depositAddress.address}</p>
                  <Button variant="outline" size="sm" onClick={() => navigator.clipboard.writeText(depositAddress.address)} icon={<Copy className="w-4 h-4" />}>
                    Copier l'adresse
                  </Button>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Min: {depositAddress.minAmount} {selectedCrypto} | Confirmations: {depositAddress.confirmationsRequired}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">⏱️ {depositAddress.estimatedTime}</p>
                </div>
              )}
            </CardContent>
          </Card>

        </>
      )}

      {/* Section Retrait — ADMIN uniquement */}
      {activeTab === 'withdraw' && isGatewayAdmin && (
        <Card>
          <CardHeader><CardTitle>Retirer vers un wallet crypto</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-semibold">Adresse de destination</label>
              <input type="text" value={withdrawAddress} onChange={(e) => setWithdrawAddress(e.target.value)}
                placeholder={`Adresse ${selectedCrypto} (${selectedNetwork})`}
                className="w-full px-4 py-3 border dark:border-slate-600 rounded-xl text-sm mt-1 font-mono dark:bg-slate-800 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-semibold">Montant (USD)</label>
              <div className="flex gap-4 mt-1">
                <input type="number" value={withdrawAmount} onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder="100" className="flex-1 px-4 py-3 border dark:border-slate-600 rounded-xl text-lg font-bold dark:bg-slate-800 dark:text-white" />
                <Button onClick={() => setShowCryptoConfirm(true)} disabled={withdrawing} className="bg-orange-600 hover:bg-orange-700">
                  {withdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUp className="w-4 h-4" />}
                </Button>
              </div>
            </div>
            {withdrawAmount && (
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm">
                <p>Vous recevrez : <strong>{(parseFloat(withdrawAmount) * 0.98 / (rates?.[selectedCrypto]?.usd || 1)).toFixed(6)} {selectedCrypto}</strong></p>
                <p className="text-xs text-slate-500 dark:text-slate-400">Frais : 2% | Réseau : {selectedNetwork}</p>
              </div>
            )}
            {withdrawResult && (
              <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-sm">
                <p className="font-bold text-green-800">✅ Retrait effectué !</p>
                <p>{withdrawResult.amountCrypto.toFixed(6)} {selectedCrypto} envoyés</p>
                <p className="text-xs">Réf: {withdrawResult.reference}</p>
                <p className="text-xs">⏱️ {withdrawResult.estimatedTime}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Frais */}
      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 text-sm text-slate-600 dark:text-slate-300">
        <p><strong>💱 Taux :</strong> En direct via CoinGecko/Binance</p>
        <p><strong>⏱️ Délai :</strong> 10-60 min (BTC) | 3-5 min (ETH) | Instantané (USDT)</p>
        <p><strong>🔄 Après dépôt :</strong> Les fonds sont en USD dans votre wallet → vous pouvez les utiliser pour tous les services PayMaestro</p>
      </div>

      {/* Modale de confirmation de retrait — ADMIN uniquement */}
      {showCryptoConfirm && isGatewayAdmin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <Bitcoin className="w-12 h-12 text-orange-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Confirmer le retrait</h3>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-4 text-left space-y-2 text-sm">
              <p><strong>Destinataire :</strong> <span className="font-mono text-xs">{withdrawAddress.substring(0, 15)}...</span></p>
              <p><strong>Montant :</strong> {withdrawAmount}$</p>
              <p><strong>Vous recevrez :</strong> {(parseFloat(withdrawAmount) * 0.98 / (rates?.[selectedCrypto]?.usd || 1)).toFixed(6)} {selectedCrypto}</p>
              <p><strong>Réseau :</strong> {selectedNetwork}</p>
              <p><strong>Frais :</strong> 2%</p>
            </div>
            <p className="text-red-600 text-xs mt-3">⚠️ Vérifiez l'adresse — les transactions crypto sont irréversibles !</p>
            <div className="flex gap-3 mt-4">
              <Button variant="outline" fullWidth onClick={() => setShowCryptoConfirm(false)}>Annuler</Button>
              <Button fullWidth onClick={() => { setShowCryptoConfirm(false); handleWithdraw(); }}>Confirmer</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}