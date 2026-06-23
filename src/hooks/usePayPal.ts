'use client';

import { useState, useCallback } from 'react';

interface WithdrawData {
  amountUSD: number;
  currencyCode: string;
  phoneNumber: string;
  userEmail: string;
}

interface PayPalOrderResult {
  paypalOrderId: string;
  transactionId: number;
  approvalUrl: string;
}

interface CaptureResult {
  success: boolean;
  status: string;
  transactionId: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('paymaestro_token');
}

export function usePayPal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'creating' | 'approving' | 'capturing' | 'done' | 'error'>('idle');

  const createOrder = useCallback(async (data: WithdrawData): Promise<PayPalOrderResult | null> => {
    setLoading(true);
    setError(null);
    setStep('creating');

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/payments/create-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          amountUSD: data.amountUSD,
          currencyCode: data.currencyCode,
          phoneNumber: data.phoneNumber,
          userEmail: data.userEmail,
        }),
      });

      const result = await res.json();

      if (result.success && result.data) {
        setStep('approving');
        return {
          paypalOrderId: result.data.paypalOrderId,
          transactionId: result.data.transactionId,
          approvalUrl: result.data.approvalUrl,
        };
      }

      throw new Error(result.error || 'Erreur création commande');
    } catch (err: any) {
      setError(err.message);
      setStep('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const captureOrder = useCallback(async (paypalOrderId: string, transactionId: number): Promise<CaptureResult | null> => {
    setLoading(true);
    setError(null);
    setStep('capturing');

    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/payments/capture-order`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ paypalOrderId, transactionId }),
      });

      const result = await res.json();

      if (result.success) {
        setStep('done');
        return {
          success: true,
          status: result.data?.status || 'PAYPAL_APPROVED',
          transactionId,
        };
      }

      throw new Error(result.error || 'Erreur capture paiement');
    } catch (err: any) {
      setError(err.message);
      setStep('error');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setLoading(false);
    setError(null);
    setStep('idle');
  }, []);

  return {
    loading,
    error,
    step,
    createOrder,
    captureOrder,
    reset,
  };
}