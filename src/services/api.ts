import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const API_BASE_URLS = [
  ENV_API_URL,
  'http://10.0.2.2:4000',
  'http://localhost:4000'
].filter(Boolean) as string[];

const TOKEN_KEY = 'bossitive_token';

export const setToken = async (token: string | null) => {
  if (!token) {
    await AsyncStorage.removeItem(TOKEN_KEY);
    return;
  }
  await AsyncStorage.setItem(TOKEN_KEY, token);
};

export const getToken = async () => {
  return AsyncStorage.getItem(TOKEN_KEY);
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const TIMEOUT_MS = 5000;

  for (const baseUrl of API_BASE_URLS) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(id);
      if (!response.ok) throw new Error('Fail');

      const data = await response.json();
      return data as T;
    } catch {
      clearTimeout(id);
    }
  }

  throw new Error('Offline');
}

export const API_BASE_URL = API_BASE_URLS[0];