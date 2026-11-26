import { motionHubHtml } from '../../lib/motion-hub-page';

// A standalone page: it deliberately does not go through the shared page handler, so none of the global
// layers (menu, footer, shared CSS) are injected into it. It carries the same security headers.
export const dynamic = 'force-dynamic';

const CSP = "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: https:; media-src 'self' blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'self' https://chatgpt.com; upgrade-insecure-requests";

export function GET() {
  const headers: Record<string, string> = {
    'Content-Type': 'text/html; charset=utf-8',
    'Cache-Control': 'public, max-age=0, must-revalidate',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
    'X-Permitted-Cross-Domain-Policies': 'none'
  };
  if (!import.meta.env.DEV) {
    headers['Content-Security-Policy'] = CSP;
    headers['Strict-Transport-Security'] = 'max-age=31536000';
  }
  return new Response(motionHubHtml.replace('</head>','<link rel="stylesheet" href="/v2-layout-repair.css?v=20261126-r42"></head>'), { status: 200, headers });
}
