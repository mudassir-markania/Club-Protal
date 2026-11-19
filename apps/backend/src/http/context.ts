import { AsyncLocalStorage } from 'node:async_hooks';

/**
 * Per-request data made available to the route handlers without passing Express objects around
 * (the handlers read the session from the cookie / Authorization header through lib/auth.ts).
 */
export interface RequestContext {
  cookies: Record<string, string>;
  headers: Record<string, string | string[] | undefined>;
}

export const requestContext = new AsyncLocalStorage<RequestContext>();

export const getRequestContext = () => requestContext.getStore();

export function parseCookies(header: string | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(';')) {
    const idx = part.indexOf('=');
    if (idx < 0) continue;
    const name = part.slice(0, idx).trim();
    const value = part.slice(idx + 1).trim();
    if (name) {
      try {
        out[name] = decodeURIComponent(value);
      } catch {
        out[name] = value;
      }
    }
  }
  return out;
}
