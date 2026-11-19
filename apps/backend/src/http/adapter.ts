import type { NextFunction, Request as ExpressRequest, RequestHandler, Response as ExpressResponse } from 'express';
import { NextResponse } from './next-server';
import { parseCookies, requestContext } from './context';

type RouteHandler = (req: Request, ctx: { params: Record<string, string> }) => Promise<unknown> | unknown;

/** Express request -> standard Fetch `Request` (what the route handlers were written against). */
function toWebRequest(req: ExpressRequest): Request {
  const url = `${req.protocol}://${req.get('host') || 'localhost'}${req.originalUrl}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (value === undefined || key === 'content-length' || key === 'transfer-encoding') continue;
    headers.set(key, Array.isArray(value) ? value.join(', ') : value);
  }
  const hasBody = req.method !== 'GET' && req.method !== 'HEAD';
  return new Request(url, {
    method: req.method,
    headers,
    body: hasBody ? JSON.stringify(req.body ?? {}) : undefined,
  });
}

async function send(res: ExpressResponse, result: unknown) {
  if (result instanceof NextResponse) {
    for (const [k, v] of Object.entries(result.headers)) res.setHeader(k, v);
    for (const op of result.cookieOps) {
      if (op.type === 'set') {
        const { maxAge, sameSite, ...rest } = op.options || {};
        res.cookie(op.name, op.value, {
          ...rest,
          sameSite: sameSite as any,
          ...(maxAge !== undefined ? { maxAge: maxAge * 1000 } : {}), // Next uses seconds, Express milliseconds
        });
      } else {
        res.clearCookie(op.name, { path: '/' });
      }
    }
    return res.status(result.status).json(result.body);
  }
  if (result instanceof Response) {
    result.headers.forEach((v, k) => res.setHeader(k, v));
    return res.status(result.status).send(Buffer.from(await result.arrayBuffer()));
  }
  return res.status(204).end();
}

/** Wrap a route handler (`export async function GET(req, { params })`) as an Express handler. */
export function adapt(handler: RouteHandler): RequestHandler {
  return (req: ExpressRequest, res: ExpressResponse, next: NextFunction) => {
    requestContext.run({ cookies: parseCookies(req.headers.cookie), headers: req.headers }, async () => {
      try {
        const result = await handler(toWebRequest(req), { params: req.params as Record<string, string> });
        await send(res, result);
      } catch (err) {
        next(err);
      }
    });
  };
}
