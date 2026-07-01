'use client';

import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function PayPalRedirect() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale || 'fr';

  useEffect(() => {
    router.replace(`/${locale}/wallet`);
  }, []);

  return null;
}
