import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;

const API_BASE_URLS = [ENV_API_URL, 'http://10.0.2.2:4000', 'http://127.0.0.1:4000', 'http://localhost:4000'].filter(
  Boolean
) as string[];

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

  let lastError: Error | null = null;

  for (const baseUrl of API_BASE_URLS) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      const raw = await response.text();
      let data: unknown = null;

      if (raw) {
        try {
          data = JSON.parse(raw);
        } catch {
          data = raw;
        }
      }

      if (!response.ok) {
        const message =
          typeof data === 'object' && data !== null && 'message' in data
            ? String((data as { message?: string }).message)
            : `Request failed: ${response.status}`;
        throw new Error(message);
      }

      return data as T;
    } catch (error: any) {
      if (error?.name === 'AbortError') {
        lastError = new Error('Kết nối server quá thời gian chờ. Hãy kiểm tra backend đã chạy chưa.');
      } else {
        lastError = new Error(error?.message || 'Không thể kết nối server. Hãy kiểm tra backend và địa chỉ API.');
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw lastError ?? new Error('Không thể kết nối server. Hãy kiểm tra backend và địa chỉ API.');
}

export const API_BASE_URL = API_BASE_URLS[0];
