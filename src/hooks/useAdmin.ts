'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { useAuth } from './useAuth';

export function useAdmin() {
  const { user } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        if (user?.role === 'ADMIN' || user?.role === 'AGENT') {
          setIsAdmin(true);
          setLoading(false);
          return;
        }
        setIsAdmin(false);
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    if (user) {
      checkAdmin();
    } else {
      setLoading(false);
    }
  }, [user]);

  return { isAdmin, loading };
}
