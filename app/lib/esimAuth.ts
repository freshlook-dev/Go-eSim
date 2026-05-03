let esimToken: string | null = null;

export function setToken(token: string) {
  esimToken = token;
}

export function getToken() {
  return esimToken;
}

export function clearToken() {
  esimToken = null;
}