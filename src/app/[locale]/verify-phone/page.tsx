'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Phone, ArrowRight, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { COUNTRY_CODES } from '@/data/countries';

export default function VerifyPhonePage() {
  const locale = useLocale();
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'otp' | 'done'>('phone');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setStep('otp');
  };

  const handleVerifyOTP = async () => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    
    // Mettre à jour le localStorage
    const user = JSON.parse(localStorage.getItem('pm_auth_user') || '{}');
    user.isPhoneVerified = true;
    user.phone = phone;
    localStorage.setItem('pm_auth_user', JSON.stringify(user));
    
    setStep('done');
  };

  const handleContinue = () => {
    router.push(`/${locale}/kyc`);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-xl rounded-3xl overflow-hidden">
        <CardContent className="p-8">
          {/* Étape 1 : Saisie du téléphone */}
          {step === 'phone' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Vérification du téléphone</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Entrez votre numéro Mobile Money pour recevoir un code de vérification.
                </p>
              </div>
              <div className="flex gap-3">
                <select className="px-3 py-3 border border-gray-300 rounded-xl text-sm font-semibold max-w-[120px]">
                  {COUNTRY_CODES.map((c: any) => (
                    <option key={c.code} value={c.code}>
                      {c.flag} {c.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="01 02 03 04 05"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-violet-500 focus:border-violet-500 outline-none"
                />
              </div>
              <Button onClick={handleSendOTP} fullWidth disabled={loading || phone.length < 8}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <>Envoyer le code <ArrowRight className="w-4 h-4 ml-2" /></>}
              </Button>
            </div>
          )}

          {/* Étape 2 : Saisie OTP */}
          {step === 'otp' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto">
                <Phone className="w-8 h-8 text-violet-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Code de vérification</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Un code à 6 chiffres a été envoyé au {phone}
                </p>
              </div>
              <input
                type="text"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="000000"
                className="w-full text-center text-3xl font-bold tracking-widest px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 outline-none"
              />
              <Button onClick={handleVerifyOTP} fullWidth disabled={loading || otp.length !== 6}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Vérifier le code'}
              </Button>
              <button onClick={() => setStep('phone')} className="text-sm text-violet-600 hover:underline">
                Modifier le numéro
              </button>
            </div>
          )}

          {/* Étape 3 : Terminé */}
          {step === 'done' && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Téléphone vérifié !</h1>
                <p className="text-sm text-gray-500 mt-2">
                  Votre numéro a été vérifié avec succès.
                </p>
              </div>
              <Button onClick={handleContinue} fullWidth>
                Continuer vers la vérification d&apos;identité <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}