'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTranslations, useLocale } from 'next-intl';
import { useSearchParams, useRouter } from 'next/navigation';
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
  ShieldCheck,
  Key,
  QrCode,
  Loader2,
  Eye,
  EyeOff,
  Smartphone,
  FileText,
  AlertTriangle,
  Upload,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import SearchableSelect from '@/components/ui/SearchableSelect';
import { Modal } from '@/components/ui/modal';
import { api, Wallet, Stats, WalletSchema, MobileOperator } from '@/lib/api';
import { MOBILE_MONEY_COUNTRIES, getOperatorsByCountryCode } from '@/data/mobile-money-countries';
import { useToast } from '@/hooks/useToast';
import { ALL_WORLD_COUNTRIES } from '@/data/all-countries';

export default function ProfilePage() {
  const t = useTranslations('profile');
  const tCommon = useTranslations('common');
  const locale = useLocale();
  const { success, error: showError } = useToast();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [stats, setStats] = useState<Stats | null>(null);
  const [wallets, setWallets] = useState<Wallet[]>([]);

  const searchParams = useSearchParams();
  const router = useRouter();
  const isKycTriggered = searchParams.get('trigger') === 'kyc';

  // Wallet form state
  const [newPhone, setNewPhone] = useState('');
  const [newCountry, setNewCountry] = useState('');
  const [newOperator, setNewOperator] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Password management
  const [passwordTab, setPasswordTab] = useState<'create' | 'change'>('create');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [hasPassword, setHasPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordStatusLoading, setPasswordStatusLoading] = useState(true);

  // 2FA management
  const [twoFAStatus, setTwoFAStatus] = useState<{ enabled: boolean; enabledAt?: string } | null>(null);
  const [twoFASecret, setTwoFASecret] = useState<{ secret: string; qrCode?: string } | null>(null);
  const [twoFAToken, setTwoFAToken] = useState('');
  const [twoFALoading, setTwoFALoading] = useState(false);
  const [twoFAStatusLoading, setTwoFAStatusLoading] = useState(true);

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    lastName: '',
    firstName: '',
    middleName: '',
    dateOfBirth: '',
    country: '',
    city: '',
    address: '',
  });
  const [profileSaving, setProfileSaving] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Vérifier la taille (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      showError('Image trop volumineuse. Maximum 2MB.');
      return;
    }

    // Vérifier le format
    if (!['image/png', 'image/jpeg', 'image/webp', 'image/gif'].includes(file.type)) {
      showError('Format invalide. Utilisez PNG, JPEG, WebP ou GIF.');
      return;
    }

    setAvatarUploading(true);
    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const base64 = event.target?.result as string;
        const result = await api.auth.uploadAvatar(base64);
        setUser((prev: any) => ({ ...prev, avatar: result.data.avatar }));
        success('Photo de profil mise à jour !');
        setAvatarUploading(false);
      };
      reader.readAsDataURL(file);
    } catch (err: any) {
      showError(err.message || 'Erreur lors du téléchargement');
      setAvatarUploading(false);
    }
  };

  useEffect(() => {
    async function loadData() {
      try {
        const [userData, statsData, walletData] = await Promise.all([
          api.auth.getMe(),
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

    async function loadSecurity() {
      try {
        const [pwdStatus, tfaStatus] = await Promise.all([
          api.auth.getPasswordStatus().catch(() => ({ hasPassword: false })),
          api.twoFactor.getStatus().catch(() => ({ enabled: false })),
        ]);
        setHasPassword(pwdStatus.hasPassword);
        setPasswordTab(pwdStatus.hasPassword ? 'change' : 'create');
        setTwoFAStatus(tfaStatus);
      } catch {}
      setPasswordStatusLoading(false);
      setTwoFAStatusLoading(false);
    }
    loadSecurity();
  }, []);

  useEffect(() => {
    if (user) {
      setProfileForm({
        lastName: user.lastName || '',
        firstName: user.firstName || '',
        middleName: user.postName || user.middleName || '',
        dateOfBirth: user.dateOfBirth || '',
        country: user.country || '',
        city: user.city || '',
        address: user.address || '',
      });
    }
  }, [user]);

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setIsAdding(true);

    // Validate phone & operator
    if (!newPhone || newPhone.length < 8) {
      setErrors({ phone: 'Numéro trop court' });
      setIsAdding(false);
      return;
    }
    if (!newCountry) {
      setErrors({ country: 'Sélectionnez un pays' });
      setIsAdding(false);
      return;
    }
    if (!newOperator) {
      setErrors({ operator: 'Sélectionnez un opérateur' });
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
      setNewCountry('');
      setNewOperator('');
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

  // Password management
  const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]).{8,}$/;

  const validatePasswordStrength = (pwd: string) => {
    return PASSWORD_REGEX.test(pwd);
  };

  const handleCreatePassword = async () => {
    if (!newPassword) { showError('Veuillez entrer un mot de passe'); return; }
    if (!validatePasswordStrength(newPassword)) {
      showError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
      return;
    }
    if (newPassword !== confirmPassword) { showError('Les mots de passe ne correspondent pas'); return; }
    setPasswordLoading(true);
    try {
      await api.auth.createPassword(newPassword, confirmPassword);
      success('Mot de passe créé avec succès');
      setHasPassword(true);
      setPasswordTab('change');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) { showError(e.message); }
    setPasswordLoading(false);
  };

  const handleChangePassword = async () => {
    if (!oldPassword) { showError('Veuillez entrer votre mot de passe actuel'); return; }
    if (!newPassword) { showError('Veuillez entrer un nouveau mot de passe'); return; }
    if (!validatePasswordStrength(newPassword)) {
      showError('Le mot de passe doit contenir au moins 8 caractères, 1 majuscule, 1 minuscule, 1 chiffre et 1 caractère spécial.');
      return;
    }
    if (newPassword !== confirmPassword) { showError('Les mots de passe ne correspondent pas'); return; }
    setPasswordLoading(true);
    try {
      await api.auth.changePassword(oldPassword, newPassword, confirmPassword);
      success('Mot de passe modifié avec succès');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (e: any) { showError(e.message); }
    setPasswordLoading(false);
  };

  // 2FA management
  const handleGenerate2FA = async () => {
    setTwoFALoading(true);
    try {
      const secret = await api.twoFactor.generateSecret();
      setTwoFASecret(secret);
    } catch (e: any) { showError(e.message); }
    setTwoFALoading(false);
  };

  const handleEnable2FA = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) { showError('Entrez un code à 6 chiffres'); return; }
    setTwoFALoading(true);
    try {
      await api.twoFactor.enable(twoFAToken);
      success('2FA activé avec succès');
      setTwoFAStatus({ enabled: true, enabledAt: new Date().toISOString() });
      setTwoFASecret(null);
      setTwoFAToken('');
    } catch (e: any) { showError(e.message); }
    setTwoFALoading(false);
  };

  const handleDisable2FA = async () => {
    if (!twoFAToken || twoFAToken.length !== 6) { showError('Entrez votre code 2FA à 6 chiffres'); return; }
    setTwoFALoading(true);
    try {
      await api.twoFactor.disable(twoFAToken);
      success('2FA désactivé');
      setTwoFAStatus({ enabled: false });
      setTwoFAToken('');
    } catch (e: any) { showError(e.message); }
    setTwoFALoading(false);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.lastName || !profileForm.firstName || !profileForm.dateOfBirth || !profileForm.country) {
      showError('Veuillez remplir tous les champs obligatoires (nom, prénom, date de naissance, pays).');
      return;
    }
    setShowConfirmModal(true);
  };

  const confirmSaveProfile = async () => {
    setShowConfirmModal(false);
    setProfileSaving(true);
    try {
      await api.auth.updateProfile(profileForm);
      setUser((prev: any) => ({
        ...prev,
        ...profileForm,
        postName: profileForm.middleName,
      }));
      success('Informations légales mises à jour avec succès.');
    } catch (e: any) {
      showError(e.message || 'Erreur lors de la mise à jour du profil.');
      setProfileSaving(false);
      return;
    }
    setProfileSaving(false);
    if (isKycTriggered) {
      window.location.href = `/${locale}/kyc`;
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center text-slate-400 dark:text-slate-300">
        {tCommon('loading')}
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-8 animate-in fade-in duration-300">
      <div className="border-b border-slate-100 dark:border-slate-700 pb-5">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">{t('title')}</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Gérez vos informations de compte et portefeuilles de retrait.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left Column: Profile Card & Security */}
        <div className="lg:col-span-1 space-y-6">
          {/* User Details */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800 text-center">
            <CardContent className="pt-8 space-y-4">
              <div className="relative w-20 h-20 mx-auto group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                <img 
                  src={user?.avatar} 
                  alt={user?.name} 
                  className="rounded-full w-full h-full object-cover border-2 border-violet-500/20"
                />
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  {avatarUploading ? (
                    <Loader2 className="w-5 h-5 text-white animate-spin" />
                  ) : (
                    <Upload className="w-5 h-5 text-white" />
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
                <span className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-emerald-500 border-2 border-white flex items-center justify-center text-[10px] text-white" title="Identité vérifiée">✓</span>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-800 dark:text-white">{user?.name}</h3>
                <p className="text-xs text-slate-400 dark:text-slate-300 mt-1">{user?.email}</p>
              </div>
              <div className="border-t border-slate-50 pt-4 text-left text-xs text-slate-500 dark:text-slate-400 space-y-3">
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-300">{t('personalInfo.memberSince')} :</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {new Date(user?.joinedAt).toLocaleDateString(locale === 'fr' ? 'fr-FR' : 'en-US', {
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 dark:text-slate-300">Niveau de compte :</span>
                  <span className="font-semibold text-violet-600">Premium (Illimité)</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Password Management */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-violet-600" />
                Mot de passe
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              {passwordStatusLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-400 dark:text-slate-300" /></div>
              ) : hasPassword ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Mot de passe actuel</label>
                    <div className="relative mt-1">
                      <input type={showOldPassword ? 'text' : 'password'} value={oldPassword} onChange={e => setOldPassword(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="Entrez votre mot de passe" />
                      <button onClick={() => setShowOldPassword(!showOldPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Nouveau mot de passe</label>
                    <div className="relative mt-1">
                      <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="Min. 8 car., 1 maj., 1 min., 1 chiffre, 1 spé." />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Confirmer</label>
                    <div className="relative mt-1">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="Répétez le mot de passe" />
                      <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <Button variant="primary" fullWidth size="sm" loading={passwordLoading} onClick={handleChangePassword}>
                    Modifier le mot de passe
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Nouveau mot de passe</label>
                    <div className="relative mt-1">
                      <input type={showNewPassword ? 'text' : 'password'} value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="Min. 8 car., 1 maj., 1 min., 1 chiffre, 1 spé." />
                      <button onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Confirmer</label>
                    <div className="relative mt-1">
                      <input type={showConfirmPassword ? 'text' : 'password'} value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="Répétez le mot de passe" />
                      <button onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-300"><Eye className="w-3.5 h-3.5" /></button>
                    </div>
                  </div>
                  <Button variant="primary" fullWidth size="sm" loading={passwordLoading} onClick={handleCreatePassword}>
                    Créer un mot de passe
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 2FA Management */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-3.5 h-3.5 text-violet-600" />
                Authentification à deux facteurs (2FA)
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-3 text-sm">
              {twoFAStatusLoading ? (
                <div className="flex justify-center py-4"><Loader2 className="w-4 h-4 animate-spin text-slate-400 dark:text-slate-300" /></div>
              ) : twoFAStatus?.enabled ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl">
                    <ShieldCheck className="w-5 h-5 text-emerald-500" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">2FA Activé</p>
                      {twoFAStatus.enabledAt && <p className="text-[10px] text-emerald-600">Depuis le {new Date(twoFAStatus.enabledAt).toLocaleDateString()}</p>}
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Code 2FA pour désactiver</label>
                    <div className="flex gap-2 mt-1">
                      <input type="text" value={twoFAToken} onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))} className="flex-1 px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="000000" maxLength={6} />
                      <Button variant="outline" size="sm" loading={twoFALoading} onClick={handleDisable2FA}>Désactiver</Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs text-slate-500 dark:text-slate-400">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                  {!twoFASecret ? (
                    <Button variant="primary" fullWidth size="sm" loading={twoFALoading} onClick={handleGenerate2FA}>
                      <QrCode className="w-3.5 h-3.5 mr-1" /> Activer 2FA
                    </Button>
                  ) : (
                    <div className="space-y-3">
                      {twoFASecret.qrCode && (
                        <div className="flex justify-center">
                          <img src={twoFASecret.qrCode} alt="QR Code 2FA" className="w-32 h-32" />
                        </div>
                      )}
                      <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3">
                        <p className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase mb-1">Clé secrète</p>
                        <p className="font-mono text-xs break-all select-all">{twoFASecret.secret}</p>
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase">Code de vérification</label>
                        <div className="flex gap-2 mt-1">
                          <input type="text" value={twoFAToken} onChange={e => setTwoFAToken(e.target.value.replace(/\D/g, '').slice(0, 6))} className="flex-1 px-3 py-2 text-xs text-slate-800 dark:text-white border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500" placeholder="000000" maxLength={6} />
                          <Button variant="primary" size="sm" loading={twoFALoading} onClick={handleEnable2FA}>Vérifier</Button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Wallets & Stats */}
        <div className="lg:col-span-2 space-y-6">
          {/* Legal Information Form */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-violet-600" />
                Informations légales
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 space-y-4">
              {isKycTriggered && (
                <div className="p-3 bg-violet-50 border border-violet-200 rounded-xl flex items-start gap-2">
                  <ShieldAlert className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-800">
                    <strong>Étape 1 :</strong> Vérifiez et enregistrez vos informations légales ici. Vous serez ensuite automatiquement redirigé vers l'envoi de vos documents.
                  </p>
                </div>
              )}
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Ces informations seront utilisées pour la vérification KYC. Assurez-vous qu&apos;elles correspondent exactement à vos documents d&apos;identité.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Input
                  label="Nom"
                  required
                  value={profileForm.lastName}
                  onChange={(e) => setProfileForm({ ...profileForm, lastName: e.target.value })}
                />
                <Input
                  label="Post-nom"
                  value={profileForm.middleName}
                  onChange={(e) => setProfileForm({ ...profileForm, middleName: e.target.value })}
                />
                <Input
                  label="Prénom"
                  required
                  value={profileForm.firstName}
                  onChange={(e) => setProfileForm({ ...profileForm, firstName: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Date de naissance"
                  type="date"
                  required
                  value={profileForm.dateOfBirth}
                  onChange={(e) => setProfileForm({ ...profileForm, dateOfBirth: e.target.value })}
                />
                <SearchableSelect
                  label="Pays"
                  required
                  value={profileForm.country}
                  onChange={(value) => setProfileForm({ ...profileForm, country: value })}
                  options={ALL_WORLD_COUNTRIES}
                  placeholder="Sélectionnez votre pays"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Ville"
                  value={profileForm.city}
                  onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                />
                <Input
                  label="Adresse"
                  value={profileForm.address}
                  onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })}
                />
              </div>
              <Button
                variant="primary"
                fullWidth
                size="sm"
                loading={profileSaving}
                onClick={handleSaveProfile}
              >
                Enregistrer les informations
              </Button>
            </CardContent>
          </Card>

          {/* Personal Stats */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-slate-50/30 dark:bg-slate-800/50">
            <CardHeader className="pb-3">
              <CardTitle className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-violet-600" />
                {t('stats.title')}
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0 grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase">{t('stats.totalRetraits')}</p>
                <h4 className="text-lg font-bold text-slate-850 dark:text-white mt-1">{stats?.totalTransactions}</h4>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase">{t('stats.totalVolume')}</p>
                <h4 className="text-lg font-bold text-slate-850 dark:text-white mt-1">${stats?.totalReceived.toFixed(0)}</h4>
              </div>
              <div className="p-3 bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 rounded-xl shadow-xs">
                <p className="text-[10px] font-semibold text-slate-400 dark:text-slate-300 uppercase">{t('stats.successRate')}</p>
                <h4 className="text-lg font-bold text-slate-850 dark:text-white mt-1">{stats?.successRate.toFixed(0)}%</h4>
              </div>
            </CardContent>
          </Card>

          {/* Wallets Management */}
          <Card className="border border-slate-100 dark:border-slate-700 shadow-sm rounded-2xl bg-white dark:bg-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
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
                    className="flex justify-between items-center p-3.5 border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded bg-white dark:bg-slate-800 border border-slate-100 dark:border-slate-700 flex items-center justify-center font-bold text-[10px] text-slate-400 dark:text-slate-300">
                        {wallet.operator.charAt(0)}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-xs font-semibold text-slate-800 dark:text-white">{wallet.phone}</p>
                          {wallet.isDefault && (
                            <span className="inline-flex items-center gap-0.5 bg-violet-100 text-violet-700 text-[9px] font-bold px-1.5 py-0.5 rounded">
                              <Star className="w-2.5 h-2.5 fill-violet-700" />
                              {t('wallets.default')}
                            </span>
                          )}
                        </div>
                        <p className="text-[9px] text-slate-400 dark:text-slate-300 mt-0.5">{wallet.operator}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      {!wallet.isDefault && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          className="text-slate-400 dark:text-slate-300 hover:text-violet-600 text-[10px]"
                          onClick={() => handleSetDefault(wallet.id)}
                        >
                          {t('wallets.setDefault')}
                        </Button>
                      )}
                      <button 
                        onClick={() => handleDeleteWallet(wallet.id)}
                        className="p-1.5 text-slate-400 dark:text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title={t('wallets.delete')}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Wallet Form */}
              <form onSubmit={handleAddWallet} className="border-t border-slate-100 dark:border-slate-700 pt-6 space-y-4">
                <h4 className="text-xs font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider">
                  {t('wallets.add')}
                </h4>

                {/* Country + Operator row */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Pays</label>
                    <div className="relative">
                      <select
                        value={newCountry}
                        onChange={(e) => { setNewCountry(e.target.value); setNewOperator(''); setNewPhone(''); setErrors({}); }}
                        className={`
                          w-full px-3.5 py-2 text-xs text-slate-800 dark:text-white font-semibold border rounded-xl appearance-none cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500
                          ${errors.country ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'}
                          bg-white dark:bg-slate-800
                        `}
                      >
                        <option value="">Sélectionnez un pays</option>
                        {MOBILE_MONEY_COUNTRIES.map((c) => (
                          <option key={c.code} value={c.code}>
                            {c.flag} {c.name} ({c.dialCode})
                          </option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                    </div>
                    {errors.country && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.country}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Opérateur</label>
                    <div className="relative">
                      <select
                        value={newOperator}
                        onChange={(e) => setNewOperator(e.target.value)}
                        disabled={!newCountry}
                        className={`
                          w-full px-3.5 py-2 text-xs border rounded-xl appearance-none cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500
                          ${errors.operator ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'}
                          ${!newCountry ? 'text-slate-400 bg-slate-50 dark:bg-slate-900' : 'text-slate-800 dark:text-white bg-white dark:bg-slate-800'}
                          font-semibold
                        `}
                      >
                        <option value="">{newCountry ? 'Choisissez...' : 'Sélectionnez d\'abord le pays'}</option>
                        {getOperatorsByCountryCode(newCountry).map((op) => (
                          <option key={op.value} value={op.value}>{op.label}</option>
                        ))}
                      </select>
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none text-xs">▼</span>
                    </div>
                    {errors.operator && <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.operator}</p>}
                  </div>
                </div>

                {/* Phone number */}
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 dark:text-slate-300 uppercase tracking-wider mb-1.5">Numéro de téléphone</label>
                  <input
                    type="tel"
                    placeholder={
                      newCountry
                        ? MOBILE_MONEY_COUNTRIES.find(c => c.code === newCountry)?.placeholder || '+225 00 00 00 00'
                        : '+225 00 00 00 00'
                    }
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className={`
                      w-full px-3.5 py-2 text-xs text-slate-800 dark:text-white font-semibold border rounded-xl focus:outline-none focus:ring-2 focus:ring-violet-500/40 focus:border-violet-500
                      ${errors.phone ? 'border-red-300' : 'border-slate-200 dark:border-slate-700'}
                      bg-white dark:bg-slate-800
                    `}
                  />
                  {errors.phone && (
                    <p className="text-[10px] text-red-500 mt-1 font-semibold">{errors.phone}</p>
                  )}
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

      {/* Confirmation Modal */}
      <Modal isOpen={showConfirmModal} onClose={() => setShowConfirmModal(false)} title="Confirmer la mise à jour" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-xl">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <p className="text-xs text-amber-800 dark:text-amber-200">
              <strong>Attention :</strong> La mise à jour de vos informations légales n&apos;est autorisée qu&apos;<strong>une seule fois par mois</strong>. Assurez-vous que toutes les données sont correctes avant de confirmer.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" fullWidth size="sm" onClick={() => setShowConfirmModal(false)}>
              Annuler
            </Button>
            <Button variant="primary" fullWidth size="sm" onClick={confirmSaveProfile}>
              Valider
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
