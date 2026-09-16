export function getApiUrl(endpoint: string): string {
  const customBase = (import.meta as any).env?.VITE_API_BASE_URL;
  if (customBase) {
    const base = customBase.replace(/\/+$/, '');
    const path = endpoint.replace(/^\/+/, '');
    return `${base}/${path}`;
  }

  // Always use relative path so Cloudflare Pages Functions handle /api/ endpoints
  return endpoint;
}

export async function safeFetchJson<T = any>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const url = getApiUrl(endpoint);

  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get('content-type') || '';
    
    if (contentType.includes('application/json')) {
      const data = await res.json();
      if (res.ok) {
        return data as T;
      } else {
        throw new Error(data?.error || data?.message || `Serverfel (${res.status})`);
      }
    } else {
      const text = await res.text();
      console.warn(`[API] Non-JSON response (${res.status}) from ${url}:`, text.slice(0, 150));
      if (res.status === 404) {
        throw new Error(`API-slutpunkten hittades inte (404). Om du använder Cloudflare Pages, se till att Functions har aktiverats.`);
      }
      if (res.status === 405) {
        throw new Error(`Servern returnerade 405 (Method Not Allowed). Se till att 'functions'-mappen ingår i din Cloudflare Pages-distribution.`);
      }
      throw new Error(`Servern returnerade ett ogiltigt svar (Status ${res.status}).`);
    }
  } catch (err: any) {
    console.warn(`[API] Could not reach ${url}:`, err.message);
    if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
      throw new Error(`Kunde inte ansluta till API-funktionen (${url}). Om du använder Cloudflare Pages, kontrollera att 'functions'-mappen har pushats till GitHub och att den senaste byggnationen är klar.`);
    }
    throw err;
  }
}

export interface SmtpConfig {
  host: string;
  port: number | string;
  user: string;
  pass: string;
  fromName: string;
  fromEmail: string;
  secure: boolean;
}

export function getStoredSmtpConfig(): SmtpConfig | null {
  try {
    const raw = localStorage.getItem('anixi_smtp_config');
    if (raw) {
      return JSON.parse(raw);
    }
  } catch (e) {
    console.warn('[SMTP Config] Could not parse stored SMTP config from localStorage');
  }
  return null;
}

export async function saveStoredSmtpConfig(config: SmtpConfig): Promise<boolean> {
  try {
    localStorage.setItem('anixi_smtp_config', JSON.stringify(config));
    // Sync with backend server
    await safeFetchJson('/api/admin/smtp-config', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    }).catch(err => console.warn('[SMTP Config Backend Sync Note]', err));
    return true;
  } catch (e) {
    console.error('[SMTP Config Save Error]', e);
    return false;
  }
}

export async function sendDirectEmail(payload: {
  to: string;
  subject: string;
  message?: string;
  html?: string;
  smtpConfig?: SmtpConfig;
  attachments?: any[];
}): Promise<any> {
  const smtpConfig = payload.smtpConfig || getStoredSmtpConfig() || undefined;

  return safeFetchJson('/api/send-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      ...payload,
      smtpConfig
    })
  });
}



