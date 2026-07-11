'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, XCircle } from 'lucide-react';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onSuccess: (details: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export default function PayPalButton({
  amount,
  currency = 'USD',
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';

  useEffect(() => {
    if (!PAYPAL_CLIENT_ID) { setSdkError('Configuration PayPal manquante'); return; }
    if (window.paypal) {
      setSdkReady(true);
      return;
    }
    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError('Impossible de charger PayPal.');
    document.body.appendChild(script);
    return () => { if (script.parentNode) script.parentNode.removeChild(script); };
  }, [currency, PAYPAL_CLIENT_ID]);

  useEffect(() => {
    if (!sdkReady || !paypalRef.current || !window.paypal) return;
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'rect', label: 'pay', tagline: false },
      createOrder: (data: any, actions: any) =>
        actions.order.create({
          purchase_units: [{ amount: { value: amount.toFixed(2), currency_code: currency } }],
        }),
      onApprove: (data: any, actions: any) =>
        actions.order.capture().then((details: any) => onSuccess(details)),
      onCancel: () => onCancel(),
      onError: (err: any) => { console.error('PayPal error:', err); onError(err); },
    }).render(paypalRef.current);
  }, [sdkReady, amount, currency, onSuccess, onError, onCancel]);

  if (sdkError) {
    return (
      <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700 dark:text-red-400">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">Chargement de PayPal...</span>
      </div>
    );
  }

  return <div ref={paypalRef} />;
}
