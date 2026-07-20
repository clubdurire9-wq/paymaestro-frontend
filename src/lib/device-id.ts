const FALLBACK_ID = 'unknown-device';
let cachedId: string | null = null;
let initPromise: Promise<string> | null = null;

export function getDeviceIdSync(): string {
  return cachedId || FALLBACK_ID;
}

export async function getDeviceId(): Promise<string> {
  if (cachedId) return cachedId;
  if (initPromise) return initPromise;

  if (typeof window === 'undefined') {
    cachedId = FALLBACK_ID;
    return cachedId;
  }

  initPromise = (async () => {
    const components = [
      navigator.userAgent || '',
      screen.width,
      screen.height,
      screen.colorDepth,
      navigator.language || '',
      Intl.DateTimeFormat().resolvedOptions().timeZone || '',
      navigator.platform || '',
      navigator.hardwareConcurrency || '',
      (navigator as any).deviceMemory || '',
    ].join('|||');

    const encoder = new TextEncoder();
    const data = encoder.encode(components);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');

    cachedId = hashHex;
    return hashHex;
  })();

  return initPromise;
}

getDeviceId();
