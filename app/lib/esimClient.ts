import { getToken, setToken } from '@/app/lib/esimAuth';

export function getEsimApiUrl(path: string) {
  const baseUrl = process.env.ESIM_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error('Missing ESIM_API_BASE_URL environment variable.');
  }

  const trimmedBaseUrl = baseUrl.replace(/\/+$/, '');
  const normalizedBaseUrl = trimmedBaseUrl.endsWith('/developer')
    ? `${trimmedBaseUrl}/reseller`
    : trimmedBaseUrl;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  return `${normalizedBaseUrl}${normalizedPath}`;
}

function getEsimCredentials() {
  const email = process.env.ESIM_API_EMAIL?.trim();
  const password = process.env.ESIM_API_PASSWORD?.trim();

  if (!email || !password) {
    throw new Error('Missing ESIM_API_EMAIL or ESIM_API_PASSWORD environment variable.');
  }

  return { email, password };
}

function getProviderMessage(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as Record<string, unknown>;
  const nestedData = response.data && typeof response.data === 'object'
    ? response.data as Record<string, unknown>
    : null;

  return response.message || response.error || nestedData?.message || nestedData?.error || null;
}

function extractToken(data: unknown) {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const response = data as Record<string, unknown>;
  const nestedData = response.data && typeof response.data === 'object'
    ? response.data as Record<string, unknown>
    : null;

  const token =
    response.access_token ||
    response.token ||
    response.bearer_token ||
    nestedData?.access_token ||
    nestedData?.token ||
    nestedData?.bearer_token;

  return typeof token === 'string' && token.trim() ? token : null;
}

async function loginAndGetToken() {
  const credentials = getEsimCredentials();

  const res = await fetch(getEsimApiUrl('/login'), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  const data = await res.json();
  const token = extractToken(data);

  if (!token) {
    const providerMessage = getProviderMessage(data);
    const details = providerMessage ? `: ${providerMessage}` : '';
    throw new Error(`Failed to get token (${res.status})${details}`);
  }

  setToken(token);
  return token;
}

export async function getValidToken() {
  const configuredToken = process.env.ESIM_API_TOKEN?.trim();

  if (configuredToken) {
    return configuredToken;
  }

  let token = getToken();

  if (!token) {
    token = await loginAndGetToken();
  }

  return token;
}
