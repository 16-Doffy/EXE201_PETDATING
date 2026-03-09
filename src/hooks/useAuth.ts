import { useEffect, useState } from 'react';
import { AuthUser, bootstrapAuth, subscribeAuth } from '@/services/authService';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeAuth(setUser);

    bootstrapAuth().finally(() => {
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  return { user, loading };
};
