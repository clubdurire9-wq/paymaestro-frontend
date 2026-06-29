'use client';

import { useState, useCallback } from 'react';
import { api } from '@/lib/api';

interface WithdrawData {
  amountUSD: number;
  currencyCode: string;
  phoneNumber: string;
  userEmail?: string;
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

export function usePayPal() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'creating' | 'approving' | 'capturing' | 'done' | 'error'>('idle');

  const createOrder = useCallback(async (data: WithdrawData): Promise<PayPalOrderResult | null> => {
    setLoading(true);
    setError(null);
    setStep('creating');

    try {
      const result = await api.payments.createOrder(data);
      if (result) {
        setStep('approving');
        return {
          paypalOrderId: result.paypalOrderId,
          transactionId: result.transactionId,
          approvalUrl: result.approvalUrl,
        };
      }
      throw new Error('Erreur création commande');
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
      const result = await api.payments.captureOrder(paypalOrderId, transactionId);
      if (result) {
        setStep('done');
        return {
          success: true,
          status: result.status || 'PAYPAL_APPROVED',
          transactionId,
        };
      }
      throw new Error('Erreur capture paiement');
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
