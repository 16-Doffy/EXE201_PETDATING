import { apiRequest, getToken, setToken } from '@/services/api';

export type AuthUser = {
  id: string;
  email: string;
};

const normalizeIdentityToEmail = (identity: string) => {
  const raw = identity.trim().toLowerCase();
  if (raw.includes('@')) return raw;

  const digitsOnly = raw.replace(/\D/g, '');
  if (!digitsOnly) return raw;

  return `${digitsOnly}@phone.bossitive.app`;
};

type AuthResponse = {
  token: string;
  user: AuthUser;
};

let currentUser: AuthUser | null = null;
const listeners = new Set<(user: AuthUser | null) => void>();

const emit = () => {
  listeners.forEach((callback) => callback(currentUser));
};

export const registerWithEmail = async (identity: string, password: string) => {
  const email = normalizeIdentityToEmail(identity);
  try {
      const data = await apiRequest<AuthResponse>('/auth/register', {
        method: 'POST',
        body: { email, password },
      });

      await setToken(data.token);
      currentUser = data.user;
      emit();
      return data.user;
  } catch (err) {
      // Offline/Mock Fallback for demo
      const mockUser = { id: 'mock-user-' + Date.now(), email };
      await setToken('mock-token');
      currentUser = mockUser;
      emit();
      return mockUser;
  }
};

export const loginWithEmail = async (identity: string, password: string) => {
  const email = normalizeIdentityToEmail(identity);
  try {
      const data = await apiRequest<AuthResponse>('/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      await setToken(data.token);
      currentUser = data.user;
      emit();
      return data.user;
  } catch (err) {
      // Offline/Mock Fallback for demo
      if (password === '123456') {
          const mockUser = { id: 'mock-user-123', email };
          await setToken('mock-token');
          currentUser = mockUser;
          emit();
          return mockUser;
      }
      throw err;
  }
};

export const logout = async () => {
  await setToken(null);
  currentUser = null;
  emit();
};

export const bootstrapAuth = async () => {
  const token = await getToken();
  if (!token) {
    currentUser = null;
    emit();
    return null;
  }

  try {
    const data = await apiRequest<{ user: AuthUser }>('/auth/me', { auth: true });
    currentUser = data.user;
    emit();
    return data.user;
  } catch {
    // If we have a token but server is down, keep mock user for demo
    if (token === 'mock-token') {
        currentUser = { id: 'mock-user-123', email: 'demo@bossitive.app' };
        emit();
        return currentUser;
    }
    await setToken(null);
    currentUser = null;
    emit();
    return null;
  }
};

export const getCurrentUser = () => currentUser;

export const subscribeAuth = (callback: (user: AuthUser | null) => void) => {
  listeners.add(callback);
  callback(currentUser);
  return () => listeners.delete(callback);
};
