'use client';

import React, { useEffect, useState } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { 
  User, 
  Mail, 
  Phone, 
  Calendar, 
  Plus, 
  Trash2, 
  Star, 
  ShieldAlert, 
  Activity, 
  CreditCard,
  CheckCircle,
  HelpCircle,
  ShieldCheck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select } from '@/components/ui/select';
import { api, Wallet, Stats, WalletSchema, MobileOperator } from '@/lib/api';
import { useToast } from '@/hooks/useToast';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  // Wallet form state
  const [newPhone, setNewPhone] = useState('');
  const [newOperator, setNewOperator] = useState<MobileOperator>('Orange');
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, statsData, walletData] = await Promise.all([
          api.getCurrentUser(),
          api.getStats(),
          api.getWallets()
        ]);
        setUser(userData);
        setStats(statsData);
        setWallets(walletData);
      } catch (err) {
        console.error('Failed to load profile data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsAdding(true);

    // Validate phone structure
    const validation = WalletSchema.safeParse({
      phone: newPhone,
      operator: newOperator
    });

    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        fieldErrors[err.path[0]] = err.message;
      });
      setErrors(fieldErrors);
      setIsAdding(false);
      return;
    }

    try {
      const added = await api.addWallet({
        phone: newPhone,
        operator: newOperator
      });
      setWallets([...wallets, added]);
      setNewPhone('');
      setErrors({});
      success('Numéro Mobile Money ajouté avec succès !');
    } catch (err) {
      showError('Impossible d\'ajouter ce numéro.');
      setErrors({ general: 'Impossible d\'ajouter ce numéro.' });
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteWallet = async (id: string) => {
    if (confirm('Voulez-vous vraiment supprimer ce portefeuille ?')) {
      await api.deleteWallet(id);
      const updated = await api.getWallets();
      setWallets(updated);
      success('Portefeuille supprimé.');
    }
  };

  const handleSetDefault = async (id: string) => {
    await api.setDefaultWallet(id);
    const updated = await api.getWallets();
    setWallets(updated);
    success('Portefeuille par défaut mis à jour !');
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-400">
        {tCommon('loading')}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 pb-5">
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{t('title')}</h1>
        <p className="text-sm text-slate-500 mt-1">Gérez vos informations de compte et portefeuilles de retrait.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Details */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white text-center">
            <CardContent className="pt-8 space-y-4">
              <div className="relative w-20 h-20 mx-auto">
                <img 
                  src={user?.avatar} 
                  alt={user?.name} 
                  className="rounded-full w-full h-full object-cover border-2 border-violet-500/20"
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white" title="Identité vérifiée">✓</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800">{user?.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{user?.email}</p>
              </div>
              <div className="border-t border-slate-50 pt-4 text-left text-xs text-slate-500 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400">{t('personalInfo.memberSince')} :</span>
                  <span className="font-semibold text-slate-700">
                    {new Date(user?.joinedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Niveau de compte :</span>
                  <span className="font-semibold text-violet-600">Premium (Illimité)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Security placeholders */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {t('security.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4 text-sm">
              <div className="flex justify-between items-center py-1">
                <div>
                  <p className="text-xs font-semibold text-slate-800">{t('security.twoFactor')}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Sécurité renforcée de connexion</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                </div>
              </div>

              <div className="flex justify-between items-center py-1">
                <div>
                  <p className="text-xs font-semibold text-slate-800">Alertes de connexion</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">Notifié lors d&apos;un nouveau retrait</p>
                </div>
                <div className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked className="sr-only peer" />
                  <div className="w-9 h-5 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-violet-600"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Wallets & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Personal Stats */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-slate-50/30">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-violet-600" />
                {t('stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('stats.totalRetraits')}</p>
                <h4 className="text-lg font-bold text-slate-850 mt-1">{stats?.totalTransactions}</h4>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('stats.totalVolume')}</p>
                <h4 className="text-lg font-bold text-slate-850 mt-1">${stats?.totalReceived.toFixed(0)}</h4>
              </div>
              <div className="p-3 bg-white border border-slate-100 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 uppercase">{t('stats.successRate')}</p>
                <h4 className="text-lg font-bold text-slate-850 mt-1">{stats?.successRate.toFixed(0)}%</h4>
              </div>
            </CardContent>
          </Card>

          {/* Wallets Management */}
          <Card className="border border-slate-100 shadow-sm rounded-2xl bg-white">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-violet-600" />
                {t('wallets.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-6">
              {/* Wallets List */}
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <div 
                    key={wallet.id} 
                    className="flex justify-between items-center p-3.5 border border-slate-100 hover:border-slate-200 rounded-xl bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white border border-slate-100 flex items-center justify-center font-bold text-[10px] text-slate-400">
                        {wallet.operator.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800">{wallet.phone}</p>
                          {wallet.isDefault && (
                            <span className="inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              <Star className="w-2.5 h-2.5 fill-violet-700" />
                              {t('wallets.default')}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 mt-0.5">{wallet.operator} • Afrique de l&apos;Ouest</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!wallet.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-slate-400 hover:text-violet-600 text-[10px]"
                          onClick={() => handleSetDefault(wallet.id)}
                        >
                          {t('wallets.setDefault')}
                        </Button>
                      )}
                      <button 
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('wallets.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Wallet Form */}
              <form onSubmit={handleAddWallet} className="border-t border-slate-100 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {t('wallets.add')}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
                  <div className="sm:col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Numéro de téléphone</label>
                    <input
                      type="tel"
                      placeholder="+2250700000000"
                      value={newPhone}
                      onChange={(e) => setNewPhone(e.target.value)}
                      className={`
                        w-full px-3.5 py-2 text-xs font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500
                        ${errors.phone ? 'border-red-300' : 'border-slate-200'}
                      `}
                    />
                    {errors.phone && (
                      <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.phone}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Opérateur</label>
                    <Select
                      options={[
                        { value: 'Orange', label: 'Orange' },
                        { value: 'MTN', label: 'MTN' },
                        { value: 'Wave', label: 'Wave' },
                        { value: 'Moov', label: 'Moov' },
                        { value: 'Airtel', label: 'Airtel' },
                        { value: 'Safaricom', label: 'Safaricom' }
                      ]}
                      value={newOperator}
                      onChange={(e) => setNewOperator(e.target.value as MobileOperator)}
                    />
                  </div>
                </div>

                {errors.general && (
                  <p className="text-[10px] text-red-500 font-semibold">{errors.general}</p>
                )}

                <Button 
                  type="submit" 
                  variant="outline" 
                  fullWidth 
                  size="sm"
                  loading={isAdding}
                  icon={<Plus className="w-4 h-4" />}
                >
                  Ajouter le numéro
                </Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
