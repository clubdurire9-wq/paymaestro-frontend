// next.config.ts
import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig: NextConfig = {
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