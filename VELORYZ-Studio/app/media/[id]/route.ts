import { env } from 'cloudflare:workers';
import { mediaResponse } from '../../../lib/cms-api.mjs';
export const dynamic = 'force-dynamic';
export async function GET(request: Request) { return mediaResponse(request, env, new URL(request.url).pathname.split('/').filter(Boolean).pop()); }
export const HEAD = GET;
