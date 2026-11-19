/**
 * Minimal stand-in for `NextResponse` so the route handlers run on Express unchanged.
 * Handlers keep returning `NextResponse.json(data, { status })`; the adapter (adapter.ts) turns the result into an
 * Express response. Only what the handlers use is implemented: json(), status, headers and cookies.set / delete.
 */
export interface CookieOptions {
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: 'lax' | 'strict' | 'none' | boolean;
  path?: string;
  maxAge?: number; // seconds (as in Next.js)
  domain?: string;
}

export type CookieOp =
  | { type: 'set'; name: string; value: string; options?: CookieOptions }
  | { type: 'delete'; name: string };

export interface ResponseInit {
  status?: number;
  headers?: Record<string, string>;
}

export class NextResponse {
  status: number;
  body: unknown;
  headers: Record<string, string>;
  cookieOps: CookieOp[] = [];

  cookies = {
    set: (name: string, value: string, options?: CookieOptions) => {
      this.cookieOps.push({ type: 'set', name, value, options });
      return this;
    },
    delete: (name: string) => {
      this.cookieOps.push({ type: 'delete', name });
      return this;
    },
  };

  constructor(body?: unknown, init: ResponseInit = {}) {
    this.body = body;
    this.status = init.status ?? 200;
    this.headers = init.headers ?? {};
  }

  static json(data: unknown, init: ResponseInit = {}) {
    return new NextResponse(data, init);
  }
}

export type NextRequest = Request;
