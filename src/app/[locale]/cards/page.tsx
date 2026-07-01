'use client';

import { useState, useEffect } from 'react';
import { useLocale } from 'next-intl';
import { 
  CreditCard, Plus, Eye, EyeOff, Copy, Snowflake, 
  XCircle, Loader2, Shield, Zap, Globe, Lock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ToastContainer, Toast } from '@/components/ui/toast';
import { api } from '@/lib/api';

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
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => { loadCards(); }, []);

  const loadCards = async () => {
    try {
      const d = await api.cards.list();
      setCards(d || []);
    } catch (e) { console.error(e); }
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
      console.error(e);
    }
    setCreating(false);
  };

  const handleToggleCard = async (cardId: number, action: string) => {
    try {
      await api.cards.toggle(cardId, action as 'freeze' | 'unfreeze');
      loadCards();
    } catch (e) { console.error(e); }
  };

  const handleCancelCard = async (cardId: number) => {
    try {
      await api.cards.cancel(cardId);
      setCancelTarget(null);
      loadCards();
    } catch (e: any) {
      setCancelTarget(null);
      setToast({ message: e.message || 'Erreur lors de l\'annulation', type: 'error' });
      console.error(e);
    }
  };

  const handleCopy = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const formatCardNumber = (number: string) => {
    return number?.replace(/(\d{4})/g, '$1 ').trim() || '•••• •••• •••• ••••';
  };

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin" /></div>;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <CreditCard className="w-8 h-8 text-violet-600" />
            Cartes Virtuelles
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cartes Visa/Mastercard virtuelles liées à votre wallet</p>
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
              <Lock className="w-8 h-8 text-violet-600 mx-auto mb-2" />
              <p className="font-bold text-violet-800">Wallet intégré</p>
              <p className="text-xs text-violet-600">Liée à votre solde</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tarifs */}
      <Card className="bg-yellow-50 border-yellow-200">
        <CardContent className="p-4">
          <p className="text-sm text-yellow-800 font-bold">💰 Tarifs</p>
          <p className="text-xs text-yellow-700">Création : 2$ • Recharge : 1% • Paiement international : 2% (change)</p>
        </CardContent>
      </Card>

      {/* Liste des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map(card => (
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
                {showNumber !== card.id || !card.cardNumber
                  ? `•••• •••• •••• ${card.last_four}`
                  : formatCardNumber(card.cardNumber)}
              </p>

              {/* Infos */}
              <div className="flex justify-between">
                <div>
                  <p className="text-[10px] opacity-70 uppercase">Expire</p>
                  <p className="font-mono">{card.exp_month}/{card.exp_year}</p>
                </div>
                <div>
                  <p className="text-[10px] opacity-70 uppercase">CVV</p>
                  <p className="font-mono">
                    {showNumber !== card.id || !card.cvv ? '•••' : card.cvv}
                  </p>
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
                  <div className="w-full bg-white/30 dark:bg-slate-800 rounded-full h-1.5 mt-1">
                    <div 
                      className="bg-white rounded-full h-1.5" 
                      style={{ width: `${Math.min((card.total_spent / card.spending_limit) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Boutons d'action */}
            <div className="flex gap-2 mt-3">
              {card.status === 'active' && (
                <>
                  <button onClick={() => handleToggleCard(card.id, 'freeze')} className="flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    <Snowflake className="w-3 h-3" /> Geler
                  </button>
                  {card.cardNumber && (
                    <>
                      <button onClick={() => setShowNumber(showNumber === card.id ? null : card.id)} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                        {showNumber === card.id ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                        {showNumber === card.id ? 'Afficher' : 'Masquer'}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(card.cardNumber); setCopied('number'); setTimeout(() => setCopied(''), 2000); }} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                        <Copy className="w-3 h-3" /> {copied === 'number' ? 'Copié !' : 'N°'}
                      </button>
                      <button onClick={() => { navigator.clipboard.writeText(card.cvv); setCopied('cvv'); setTimeout(() => setCopied(''), 2000); }} className="flex items-center gap-1 text-xs text-slate-600 dark:text-slate-300 hover:underline">
                        <Copy className="w-3 h-3" /> {copied === 'cvv' ? 'Copié !' : 'CVV'}
                      </button>
                    </>
                  )}
                </>
              )}
              {card.status === 'frozen' && (
                <button onClick={() => handleToggleCard(card.id, 'unfreeze')} className="flex items-center gap-1 text-xs text-green-600 hover:underline">
                  🔓 Dégeler
                </button>
              )}
              <button onClick={() => setCancelTarget(card)} className="flex items-center gap-1 text-xs text-red-500 hover:underline ml-auto">
                <XCircle className="w-3 h-3" /> Annuler
              </button>
            </div>
          </div>
        ))}

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
            <h2 className="text-xl font-bold mb-4">💳 Nouvelle carte virtuelle</h2>

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
                <p>💰 Frais de création : <strong>2$</strong></p>
                <p>💱 Frais de change : <strong>2%</strong></p>
              </div>

              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                  ❌ {createError}
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <Button variant="outline" fullWidth onClick={() => setShowCreate(false)}>Annuler</Button>
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
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Annuler la carte</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
              Êtes-vous sûr de vouloir annuler définitivement la carte <strong>{cancelTarget.brand?.toUpperCase()} •••• {cancelTarget.last_four}</strong> ?
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
                Oui, annuler
              </button>
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

      {/* Modale carte créée */}
      {newCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl text-center">
            <CreditCard className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <h3 className="font-bold text-lg">Carte créée !</h3>
            <p className="text-sm text-amber-600 font-bold mt-2">💡 Vous pourrez revoir ces informations à tout moment</p>

            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 mt-4 space-y-2 text-left">
              <p><strong>N° :</strong> <span className="font-mono">{formatCardNumber(newCard.cardNumber)}</span></p>
              <p><strong>CVV :</strong> <span className="font-mono">{newCard.cvv}</span></p>
              <p><strong>Expire :</strong> {newCard.expiry}</p>
              <p><strong>Titulaire :</strong> {newCard.cardholderName}</p>
            </div>

            <div className="flex gap-2 mt-4">
              <Button variant="outline" fullWidth onClick={() => handleCopy(newCard.cardNumber, 'new-number')}>
                {copied === 'new-number' ? '✅ Copié' : '📋 Copier N°'}
              </Button>
              <Button variant="outline" fullWidth onClick={() => handleCopy(newCard.cvv, 'new-cvv')}>
                {copied === 'new-cvv' ? '✅ Copié' : '📋 Copier CVV'}
              </Button>
            </div>

            <Button fullWidth className="mt-3" onClick={() => setNewCard(null)}>J'ai bien noté — Fermer</Button>
          </div>
        </div>
      )}
    </div>
  );
}