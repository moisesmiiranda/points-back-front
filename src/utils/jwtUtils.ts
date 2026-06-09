export function decodeBase64Json(b64: string): any {
  try {
    // Add padding if missing
    const padded = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
    const str = atob(padded.replace(/-/g, '+').replace(/_/g, '/'));
    return JSON.parse(decodeURIComponent(escape(str)));
  } catch (e) {
    return {};
  }
}

export function isTokenExpired(token: string | null): boolean {
  if (!token) return true;
  try {
    const parts = token.split('.');
    if (parts.length < 2) return true;
    const payload = decodeBase64Json(parts[1]);
    const exp = payload.exp;
    if (!exp) return true;
    const now = Math.floor(Date.now() / 1000);
    return now >= exp;
  } catch (e) {
    return true;
  }
}
