// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://paymaestro-backend.onrender.com/api/v1';
const apiOrigin = new URL(apiUrl).origin;

const csp = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paypal.com https://*.paypal.com https://www.google.com https://*.google.com https://accounts.google.com https://*.accounts.google.com https://www.googletagmanager.com https://*.googletagmanager.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https://flagcdn.com https://*.flagcdn.com https://www.google.com https://*.google.com https://maps.google.com",
  "font-src 'self' https://fonts.gstatic.com",
  "frame-src 'self' https://www.paypal.com https://*.paypal.com https://www.google.com https://*.google.com",
  `connect-src 'self' ${apiOrigin} https://*.paypal.com https://accounts.google.com https://*.googleapis.com https://flagcdn.com`,
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
].join('; ');

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Content-Security-Policy', value: csp },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/:locale/withdraw',
        destination: '/:locale/paypal',
        permanent: true,
      },
      {
        source: '/withdraw',
        destination: '/paypal',
        permanent: true,
      },
    ];
  },
};

export default withNextIntl(nextConfig);
