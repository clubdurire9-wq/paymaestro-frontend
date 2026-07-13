'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useLocale } from 'next-intl';
import { Shield, KeyRound, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function Verify2FAPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const mfaToken = searchParams.get('mfaToken');
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleVerify = async () => {
    setLoading(true);
    setError('');
    
    const res = await fetch(`${API_URL}/auth/verify-2fa`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mfaToken, code }),
    });
    const d = await res.json();
    
    if (d.success) {
      sessionStorage.setItem('paymaestro_token', d.token);
      sessionStorage.setItem('pm_auth_user', JSON.stringify(d.user));
      router.push(`/${locale}/dashboard`);
    } else {
      setError(d.error);
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <Card className="max-w-md w-full shadow-xl rounded-3xl">
        <CardContent className="p-8 text-center space-y-6">
          <Shield className="w-16 h-16 text-violet-600 mx-auto" />
          <h1 className="text-2xl font-bold">2FA Verification</h1>
          <p className="text-sm text-slate-500">Enter the code from your authenticator app</p>
          
          <input
            type="text"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="w-full text-center text-3xl font-bold tracking-widest px-4 py-4 border rounded-xl"
            placeholder="000000"
            autoFocus
          />
          
          {error && <p className="text-red-600 text-sm">{error}</p>}
          
          <Button onClick={handleVerify} fullWidth disabled={loading || code.length !== 6}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Verify'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}