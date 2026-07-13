'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  CreditCard, Plus, Eye, EyeOff, Copy, Snowflake as SnowflakeIcon, 
  XCircle, Loader2, Shield, Zap, Globe, Lock,
  Wallet, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FrozenModal } from '@/components/FrozenModal';
import { ToastContainer, Toast } from '@/components/ui/toast';
import { api } from '@/lib/api';
import { logger } from '@/lib/logger';

export default function VirtualCardsPage() {
  const locale = useLocale();

  const [cards, setCards] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newCard, setNewCard] = useState<any>(null);
  const [selectedBrand, setSelectedBrand] = useState<'visa' | 'mastercard'>('visa');
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [cancelTarget, setCancelTarget] = useState<any>(null);
  const [showNumber, setShowNumber] = useState<number | null>(null);
  const [revealedDetails, setRevealedDetails] = useState<Record<number, any>>({});
  const [loadingDetails, setLoadingDetails] = useState<Record<number, boolean>>({});
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copied, setCopied] = useState('');
  const [rechargeTarget, setRechargeTarget] = useState<any>(null);
  const [rechargeAmount, setRechargeAmount] = useState('');
  const [recharging, setRecharging] = useState(false);

  // Frozen check
  const [frozenData, setFrozenData] = useState<any>(null);
  const [frozenModalOpen, setFrozenModalOpen] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const token = sessionStorage.getItem('paymaestro_token');
        if (!token) return;
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
        const res = await fetch(`${API_URL}/wallet/frozen-status`, {
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        });
        const d = await res.json();
        if (d.success && d.data) setFrozenData(d.data);
      } catch {}
    })();
  }, []);

  const isCardRechargeFrozen = frozenData && (frozenData.freezeType === 'ALL' || frozenData.freezeType === 'BANK');

  useEffect(() => { loadCards(); }, []);

  const showToast = (message: string, type: 'success' | 'error' | 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  const loadCards = async () => {
    try {
      const d = await api.cards.list();
      setCards(d || []);
    } catch (e) { logger.error(e); }
    setLoading(false);
  };

  const handleCreateCard = async () => {
    setCreating(true);
    setCreateError('');
    try {
      const d = await api.cards.create({ brand: selectedBrand, billingCurrency: 'USD', provider: 'auto' });
      setNewCard(d.card || d);
      setShowCreate(false);
      loadCards();
    } catch (e: any) {
      setCreateError(e.message || 'Erreur lors de la création de la carte');
    }
    setCreating(false);
  };

  const handleToggleCard = async (cardId: number, action: string) => {
    try {
      await api.cards.toggle(cardId, action as 'freeze' | 'unfreeze');
      loadCards();
    } catch (e) { logger.error(e); }
  };

  const handleCancelCard = async (cardId: number) => {
    try {
      await api.cards.cancel(cardId);
      setCancelTarget(null);
      loadCards();
    } catch (e: any) {
      setCancelTarget(null);
      showToast(e.message || "Erreur lors de l'annulation", 'error');
    }
  };

  const handleRecharge = async () => {
    if (!rechargeTarget || !rechargeAmount || parseFloat(rechargeAmount) <= 0) return;
    if (isCardRechargeFrozen) { setFrozenModalOpen(true); return; }
    setRecharging(true);
    try {
      await api.cards.recharge(rechargeTarget.id, parseFloat(rechargeAmount));
      showToast(`Carte rechargée de ${rechargeAmount}$`, 'success');
      setRechargeTarget(null);
      setRechargeAmount('');
      loadCards();
    } catch (e: any) {
      showToast(e.message || 'Erreur de recharge', 'error');
    }
    setRecharging(false);
  };

  const handleToggleShow = async (card: any) => {
    if (showNumber === card.id) {
      setShowNumber(null);
      return;
    }
    if (revealedDetails[card.id]) {
      setShowNumber(card.id);
      return;
    }
    setLoadingDetails(prev => ({ ...prev, [card.id]: true }));
    try {
      const details = await api.cards.details(card.id);
      setRevealedDetails(prev => ({ ...prev, [card.id]: details }));
      setShowNumber(card.id);
    } catch (e: any) {
      showToast(e.message || 'Impossible de récupérer les détails', 'error');
    }
    setLoadingDetails(prev => ({ ...prev, [card.id]: false }));
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatCardNumber = (number: string) => {
    return number?.replace(/(\d{4})/g, '$1 ').trim() || '•••• •••• •••• ••••';
  };

  const getCardDetails = (card: any) => {
    if (showNumber !== card.id) return null;
    const d = revealedDetails[card.id];
    if (d) return d;
    if (card.cardNumber) return card;
    return null;
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-violet-600" />
            Virtual Cards
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Prepaid virtual Visa/Mastercard cards</p>
        </div>
        <Button onClick={() => setShowCreate(true)} icon={<Plus className="w-4 h-4" />}>
          Nouvelle carte
        </Button>
      </div>

      {/* Avantages */}
      <Card className="bg-gradient-to-r from-violet-50 to-indigo-50 border-violet-200">
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
            <div>
              <Zap className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800">Instantanée</p>
              <p className="text-xs text-violet-600">Création immédiate</p>
            </div>
            <div>
              <Globe className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800">Internationale</p>
              <p className="text-xs text-violet-600">Acceptée partout</p>
            </div>
            <div>
              <Shield className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800">Sécurisée</p>
              <p className="text-xs text-violet-600">Gel/dégel en 1 clic</p>
            </div>
            <div>
              <Wallet className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800">Prépayée</p>
              <p className="text-xs text-violet-600">Rechargez depuis votre wallet</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarifs */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 font-bold">💰 Tarifs</p>
          <p className="text-xs text-yellow-700">Création : 2$ • Recharge : Gratuit • Paiement international : 2% (change)</p>
        </CardContent>
      </Card>

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => {
          const details = getCardDetails(card);
          const isLoading = loadingDetails[card.id];
          return (
          <div key={card.id} className="relative">
            {/* Fond de carte */}
            <div className={`rounded-2xl p-6 text-white shadow-xl ${
              card.brand === 'visa' 
                ? 'bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800' 
                : 'bg-gradient-to-br from-orange-500 via-red-500 to-red-700'
            } ${card.status !== 'active' ? 'opacity-60' : ''}`}>
              {/* Logo */}
              <div className="flex justify-between items-start mb-8">
                <CreditCard className="w-10 h-10" />
                <p className="text-lg font-bold">{card.brand}</p>
              </div>

              {/* Numéro */}
              <p className="text-xl font-mono tracking-wider mb-4">
                {details
                  ? formatCardNumber(details.cardNumber)
                  : `•••• •••• •••• ${card.last_four}`}
              </p>

              {/* Infos */}
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Expire</p>
                  <p className="font-mono">{details ? details.expiry : `${card.exp_month}/${card.exp_year}`}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase">CVV</p>
                  <p className="font-mono">{details ? details.cvv : '•••'}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Statut</p>
                  <Badge className={card.status === 'active' ? 'bg-green-500' : card.status === 'frozen' ? 'bg-blue-500' : 'bg-red-500'}>
                    {card.status === 'active' ? 'Active' : card.status === 'frozen' ? 'Gelée' : 'Annulée'}
                  </Badge>
                </div>
              </div>

              {/* Dépenses */}
              {card.spending_limit && (
                <div className="mt-4 pt-3 border-t border-white/20">
                  <div className="flex justify-between text-xs">
                    <span>Dépensé : ${card.total_spent?.toFixed(2)}</span>
                    <span>Limite : ${card.spending_limit}</span>
                  </div>
                  <div className="w-full bg-white/30 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-white rounded-full h-1.5" 
                      style={{ width: `${Math.min((card.total_spent / card.spending_limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Solde */}
              <div className="mt-4 pt-3 border-t border-white/20 flex justify-between items-center">
                <span className="text-xs opacity-70">Solde disponible</span>
                <span className="font-bold text-lg">${parseFloat(card.balance || 0).toFixed(2)}</span>
              </div>
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 mt-3 flex-wrap">
              {card.status === 'active' && (
                <>
                  <button onClick={() => handleToggleCard(card.id, 'freeze')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <SnowflakeIcon className="w-3 h-3" /> Geler
                  </button>
                  <button onClick={() => handleToggleShow(card)} disabled={isLoading} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                    {isLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : showNumber === card.id ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    {showNumber === card.id ? 'Masquer' : 'Afficher'}
                  </button>
                  {details && (
                    <>
                      <button onClick={() => handleCopy(details.cardNumber, 'number')} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                        <Copy className="w-3 h-3" /> {copied === 'number' ? 'Copié !' : 'N°'}
                      </button>
                      <button onClick={() => handleCopy(details.cvv, 'cvv')} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                        <Copy className="w-3 h-3" /> {copied === 'cvv' ? 'Copié !' : 'CVV'}
                      </button>
                    </>
                  )}
                  <button onClick={() => setRechargeTarget(card)} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                    <RefreshCw className="w-3 h-3" /> Recharger
                  </button>
                </>
              )}
              {card.status === 'frozen' && (
                <button onClick={() => handleToggleCard(card.id, 'unfreeze')} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                  <SnowflakeIcon className="w-3 h-3" /> Dégeler
                </button>
              )}
              <button onClick={() => setCancelTarget(card)} className="flex items-center gap-1 text-xs text-red-500 hover:underline ml-auto">
                  <XCircle className="w-3 h-3" /> Cancel
              </button>
            </div>
          </div>
          );
        })}

        {/* Carte "Ajouter" */}
        {cards.length === 0 && (
          <div className="col-span-full text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-300 dark:text-slate-400 mx-auto mb-4" />
            <p className="text-slate-500 dark:text-slate-400 text-lg">Aucune carte virtuelle</p>
            <p className="text-sm text-slate-400 mt-1">Créez votre première carte Visa ou Mastercard</p>
            <Button className="mt-4" onClick={() => setShowCreate(true)}>
              Créer une carte
            </Button>
          </div>
        )}
      </div>

      {/* Modale création */}
      {showCreate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nouvelle carte virtuelle</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold">Type de carte</label>
                <div className="flex gap-3 mt-1">
                  <button onClick={() => setSelectedBrand('visa')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      selectedBrand === 'visa' ? 'border-blue-500 bg-blue-50' : 'border-slate-200 dark:border-slate-700'
                    }`}>
                    <p className="font-bold text-blue-700">VISA</p>
                  </button>
                  <button onClick={() => setSelectedBrand('mastercard')}
                    className={`flex-1 p-4 rounded-xl border-2 text-center transition-all ${
                      selectedBrand === 'mastercard' ? 'border-red-500 bg-red-50' : 'border-slate-200 dark:border-slate-700'
                    }`}>
                    <p className="font-bold text-red-700">MASTERCARD</p>
                  </button>
                </div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-3 text-sm text-yellow-800">
                <p> Frais de création : <strong>2$</strong></p>
                <p> Recharge : <strong>Gratuite</strong></p>
                <p> Paiement international : <strong>2%</strong></p>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  {createError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowCreate(false)}>Cancel</Button>
              <Button fullWidth onClick={handleCreateCard} disabled={creating}>
                {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Créer (2$)'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modale confirmation annulation */}
      {cancelTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <XCircle className="w-7 h-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Cancel card</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Are you sure you want to permanently cancel the card <strong>{cancelTarget.brand?.toUpperCase()} •••• {cancelTarget.last_four}</strong>?
            </p>
            <p className="text-xs text-red-500 mt-2 font-semibold">Cette action est irréversible.</p>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setCancelTarget(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Non, conserver
              </button>
              <button
                onClick={() => handleCancelCard(cancelTarget.id)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white font-medium hover:bg-red-700 transition-colors"
              >
                Yes, cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale recharge */}
      {rechargeTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Recharger la carte</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
              {rechargeTarget.brand?.toUpperCase()} •••• {rechargeTarget.last_four}
            </p>

            <div className="bg-violet-50 dark:bg-violet-950/30 rounded-xl p-4 mb-4">
              <p className="text-sm text-violet-700 dark:text-violet-300">
                Solde actuel : <strong>${parseFloat(rechargeTarget.balance || 0).toFixed(2)}</strong>
              </p>
              <p className="text-xs text-violet-500 dark:text-violet-400 mt-1">Recharge gratuite depuis votre wallet</p>
            </div>

            <input
              type="number"
              value={rechargeAmount}
              onChange={(e) => setRechargeAmount(e.target.value)}
              className="w-full px-4 py-3 border rounded-xl text-lg font-bold text-center dark:border-slate-600 dark:bg-slate-800 dark:text-white"
              placeholder="Montant en USD"
              min="1"
              max="10000"
            />

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => { setRechargeTarget(null); setRechargeAmount(''); }}>
                Cancel
              </Button>
              <Button fullWidth onClick={handleRecharge} disabled={recharging || !rechargeAmount || parseFloat(rechargeAmount) <= 0}>
                {recharging ? <Loader2 className="w-4 h-4 animate-spin" /> : `Recharger ${rechargeAmount ? `${parseFloat(rechargeAmount).toFixed(2)}$` : ''}`}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Toast notifications */}
      {toast && (
        <ToastContainer>
          <Toast message={toast.message} type={toast.type as any} onClose={() => setToast(null)} />
        </ToastContainer>
      )}

      {isCardRechargeFrozen && (
        <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl text-sm text-red-700 dark:text-red-400 flex items-center gap-2">
          <SnowflakeIcon className="w-5 h-5 shrink-0" />
          Recharge de carte bloquée — compte suspendu
        </div>
      )}

      <FrozenModal isOpen={frozenModalOpen} data={frozenData} onClose={() => setFrozenModalOpen(false)} />

      {/* Modale carte créée */}
      {newCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <CreditCard className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Carte créée !</h3>
            <p className="text-sm text-amber-600 font-bold mt-2"> Rechargez-la depuis votre wallet pour l'utiliser</p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-4 space-y-2 text-left">
              <p><strong>N° :</strong> <span className="font-mono">{formatCardNumber(newCard.cardNumber)}</span></p>
              <p><strong>CVV :</strong> <span className="font-mono">{newCard.cvv}</span></p>
              <p><strong>Expire :</strong> {newCard.expiry}</p>
              <p><strong>Titulaire :</strong> {newCard.cardholderName}</p>
              <p><strong>Solde :</strong> $0.00</p>
            </div>

            <p className="text-xs text-slate-400 dark:text-slate-500 mt-3">
              Vos informations sont stockées de manière sécurisée. Vous pourrez les révéler à tout moment.
            </p>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" fullWidth onClick={() => handleCopy(newCard.cardNumber, 'new-number')}>
                {copied === 'new-number' ? ' Copié' : ' Copier N°'}
              </Button>
              <Button variant="outline" fullWidth onClick={() => handleCopy(newCard.cvv, 'new-cvv')}>
                {copied === 'new-cvv' ? ' Copié' : ' Copier CVV'}
              </Button>
            </div>

            <Button fullWidth className="mt-3" onClick={() => setNewCard(null)}>Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}
