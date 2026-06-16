import { getToken, setToken } from '@/app/lib/esimAuth';

export function getEsimApiUrl(path: string) {
  const baseUrl = process.env.ESIM_API_BASE_URL?.trim();

  if (!baseUrl) {
    throw new Error('Missing ESIM_API_BASE_URL environment variable.');
  }

  const normalizedBaseUrl = baseUrl.replace(/\/+$/, '');
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
  const token = data?.access_token;

  if (!token) {
    throw new Error('Failed to get token');
  }

  setToken(token);
  return token;
}

export async function getValidToken() {
  let token = getToken();

  if (!token) {
    token = await loginAndGetToken();
  }

  return token;
}
