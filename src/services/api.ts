import AsyncStorage from '@react-native-async-storage/async-storage';

const ENV_API_URL = process.env.EXPO_PUBLIC_API_URL;
const PUBLIC_API_URL = 'https://petdating-backend.onrender.com';
const RUNTIME_API_CONFIG_URL =
  'https://raw.githubusercontent.com/16-Doffy/EXE201_PETDATING/main/runtime-api-config.json';
const LAST_SUCCESSFUL_API_URL_KEY = 'bossitive_last_successful_api_url';
const RUNTIME_API_CONFIG_CACHE_KEY = 'bossitive_runtime_api_config';

// Prefer the currently provisioned public backend first, then fall back to the longer-lived backup.
const STATIC_API_BASE_URLS = Array.from(
  new Set(
    [
      ENV_API_URL,
      PUBLIC_API_URL,
      'http://10.0.2.2:4000',
      'http://localhost:4000',
    ].filter(Boolean)
  )
) as string[];

const TOKEN_KEY = 'bossitive_token';
let lastSuccessfulBaseUrl: string | null = null;
let runtimeApiConfigPromise: Promise<string[]> | null = null;

class ApiResponseError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = 'ApiResponseError';
    this.status = status;
  }
}

const readErrorMessage = (payload: unknown, status: number) => {
  if (payload && typeof payload === 'object') {
    const message = 'message' in payload ? payload.message : null;
    const detail = 'error' in payload ? payload.error : null;

    if (typeof detail === 'string' && detail.trim()) return detail;
    if (typeof message === 'string' && message.trim()) return message;
  }

  return `Request failed (${status})`;
};

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

const normalizeUrlList = (urls: Array<string | null | undefined>) =>
  Array.from(new Set(urls.filter((url): url is string => typeof url === 'string' && !!url.trim())));

const resolveRuntimeApiUrls = (payload: unknown) => {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const primary =
    'primaryApiUrl' in payload && typeof payload.primaryApiUrl === 'string' ? payload.primaryApiUrl : null;
  const backups =
    'backupApiUrls' in payload && Array.isArray(payload.backupApiUrls)
      ? payload.backupApiUrls.filter((item): item is string => typeof item === 'string')
      : [];

  return normalizeUrlList([primary, ...backups]);
};

const loadRuntimeApiUrls = async () => {
  if (runtimeApiConfigPromise) {
    return runtimeApiConfigPromise;
  }

  runtimeApiConfigPromise = (async () => {
    const cachedRaw = await AsyncStorage.getItem(RUNTIME_API_CONFIG_CACHE_KEY);
    const cachedUrls = cachedRaw ? resolveRuntimeApiUrls(JSON.parse(cachedRaw)) : [];

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    try {
      const response = await fetch(RUNTIME_API_CONFIG_URL, {
        method: 'GET',
        signal: controller.signal,
        headers: { Accept: 'application/json' },
      });

      clearTimeout(timeoutId);
      if (!response.ok) {
        return cachedUrls;
      }

      const payload = await response.json();
      const urls = resolveRuntimeApiUrls(payload);

      if (urls.length) {
        AsyncStorage.setItem(RUNTIME_API_CONFIG_CACHE_KEY, JSON.stringify(payload)).catch(() => {});
        return urls;
      }

      return cachedUrls;
    } catch {
      clearTimeout(timeoutId);
      return cachedUrls;
    }
  })();

  try {
    return await runtimeApiConfigPromise;
  } finally {
    runtimeApiConfigPromise = null;
  }
};

const getOrderedBaseUrls = async () => {
  const runtimeUrls = await loadRuntimeApiUrls();
  const persisted = lastSuccessfulBaseUrl || (await AsyncStorage.getItem(LAST_SUCCESSFUL_API_URL_KEY));
  const urls = normalizeUrlList([...runtimeUrls, ...STATIC_API_BASE_URLS]);

  if (persisted && urls.includes(persisted)) {
    return [persisted, ...urls.filter((url) => url !== persisted)];
  }

  return urls;
};

type RequestOptions = {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  timeoutMs?: number;
};

export async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const method = options.method ?? 'GET';
  const headers: Record<string, string> = {};
  let lastNetworkError = 'Offline';
  const baseUrls = await getOrderedBaseUrls();

  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  if (options.auth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const TIMEOUT_MS = options.timeoutMs ?? 8000;

  for (const baseUrl of baseUrls) {
    const controller = new AbortController();
    const effectiveTimeoutMs =
      options.timeoutMs ??
      (baseUrl.includes('trycloudflare.com') ? 2500 : baseUrl.includes('onrender.com') ? 6000 : 4000);
    const id = setTimeout(() => controller.abort(), effectiveTimeoutMs);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
        method,
        headers,
        body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
        signal: controller.signal,
      });

      clearTimeout(id);
      const text = await response.text();
      const data = text ? JSON.parse(text) : null;

      if (!response.ok) {
        const message = readErrorMessage(data, response.status);

        if (response.status >= 500) {
          lastNetworkError = message;
          continue;
        }

        throw new ApiResponseError(message, response.status);
      }

      lastSuccessfulBaseUrl = baseUrl;
      AsyncStorage.setItem(LAST_SUCCESSFUL_API_URL_KEY, baseUrl).catch(() => {});
      return data as T;
    } catch (error) {
      clearTimeout(id);

      if (error instanceof ApiResponseError) {
        throw error;
      }

      if (error instanceof SyntaxError) {
        throw new Error('Phan hoi tu may chu khong hop le.');
      }

      if (error instanceof Error) {
        lastNetworkError = error.name === 'AbortError' ? 'Ket noi may chu qua lau.' : error.message || 'Offline';
      }
    }
  }

  throw new Error(lastNetworkError);
}

export const API_BASE_URL = STATIC_API_BASE_URLS[0];
