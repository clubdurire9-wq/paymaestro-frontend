'use client';

import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

const ADMIN_EMAILS = [
  'clubdurire9@gmail.com',
  'patriachemongai@gmail.com',
  'patriachemongai07@gmail.com',
  'patriachemongai307@gmail.com',
  'mongaipatriache@gmail.com',
  'mongaipatriache0@gmail.com',
  'patriachemongai26@gmail.com',
  'moiseomokoko77@gmail.com',
  'patriachemongai05@gmail.com',
];

export function isAdminEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

export function useAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkAdmin() {
      try {
        // Vérifier d'abord côté client (localStorage)
        const storedUser = sessionStorage.getItem('pm_auth_user');
        if (storedUser) {
          const user = JSON.parse(storedUser);
          if (user.email && isAdminEmail(user.email)) {
            setIsAdmin(true);
            setLoading(false);
            return;
          }
        }

        // Vérifier via l'API backend
        const token = sessionStorage.getItem('paymaestro_token');
        if (token) {
          const res = await api.auth.google('check'); // Utilise le token existant
          if (res.success) {
            setIsAdmin(false);
          }
        }
      } catch {
        setIsAdmin(false);
      }
      setLoading(false);
    }

    checkAdmin();
  }, []);

  return { isAdmin, loading };
}