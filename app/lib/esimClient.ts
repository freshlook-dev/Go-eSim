import { getToken, setToken } from '@/app/lib/esimAuth';

async function loginAndGetToken() {
  const res = await fetch(`${process.env.ESIM_API_BASE_URL}/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: process.env.ESIM_API_EMAIL,
      password: process.env.ESIM_API_PASSWORD,
    }),
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