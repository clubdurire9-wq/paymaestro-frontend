'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

declare global {
  interface Window {
    paypal?: any;
  }
}

interface PayPalButtonProps {
  paypalOrderId: string;
  transactionId: number;
  amount: number;
  currency: string;
  onSuccess: (result: any) => void;
  onError: (error: any) => void;
  onCancel: () => void;
}

export default function PayPalButton({
  paypalOrderId,
  transactionId,
  amount,
  currency,
  onSuccess,
  onError,
  onCancel,
}: PayPalButtonProps) {
  const paypalRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkError, setSdkError] = useState<string | null>(null);

  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'AZH1gx2_fFzDLlPG0q5-13Uj_5sDcknu9eB8UlAZ4BA9efY9Fds0lKTcPEvxq53UsvfFLis80N-3NpMl';

  // Charger le SDK PayPal
  useEffect(() => {
    if (window.paypal) {
      setSdkReady(true);
      return;
    }

    const script = document.createElement('script');
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD&intent=capture`;
    script.async = true;
    script.onload = () => setSdkReady(true);
    script.onerror = () => setSdkError('Impossible de charger PayPal. Vérifiez votre connexion.');

    document.body.appendChild(script);

    return () => {
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, [currency, PAYPAL_CLIENT_ID]);

  // Rendre le bouton PayPal
  useEffect(() => {
    if (!sdkReady || !paypalRef.current || !window.paypal) return;

    // Nettoyer le conteneur
    paypalRef.current.innerHTML = '';

    window.paypal.Buttons({
      // Style du bouton
      style: {
        layout: 'vertical',
        color: 'gold',
        shape: 'rect',
        label: 'pay',
        tagline: false,
      },

      // Quand l'utilisateur clique
      createOrder: () => {
        // On retourne l'ID de commande déjà créé par notre backend
        return paypalOrderId;
      },

      // Quand l'utilisateur approuve le paiement
      onApprove: async (data: any) => {
        // data.orderID contient l'ID PayPal
        onSuccess({
          paypalOrderId: data.orderID,
          transactionId,
          payerId: data.payerID,
        });
      },

      // Si l'utilisateur annule
      onCancel: () => {
        onCancel();
      },

      // Si une erreur survient
      onError: (err: any) => {
        console.error('PayPal error:', err);
        onError(err);
      },
    }).render(paypalRef.current);

  }, [sdkReady, paypalOrderId, transactionId, currency, onSuccess, onError, onCancel]);

  if (sdkError) {
    return (
      <div className="text-center p-4 bg-red-50 rounded-lg">
        <XCircle className="w-8 h-8 text-red-500 mx-auto mb-2" />
        <p className="text-sm text-red-700">{sdkError}</p>
      </div>
    );
  }

  if (!sdkReady) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="w-6 h-6 animate-spin text-violet-500" />
        <span className="ml-2 text-sm text-gray-500">Chargement de PayPal...</span>
      </div>
    );
  }

  return <div ref={paypalRef} />;
}