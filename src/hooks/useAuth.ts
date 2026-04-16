import { useEffect, useState } from 'react';
import { AuthUser, bootstrapAuth, subscribeAuth } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setUser);
    const fallbackId = setTimeout(() => {
      setLoading(false);
    }, 4500);

    bootstrapAuth().finally(() => {
      clearTimeout(fallbackId);
      setLoading(false);
    });

    return () => {
      clearTimeout(fallbackId);
      unsubscribe();
    };
  }, []);

  return { user, loading };
};
