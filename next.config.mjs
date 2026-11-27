/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '5mb' }, staleTimes: { dynamic: 0 } },
  async headers() {
    return [{
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
        { key: 'Strict-Transport-Security', value: 'max-age=31536000' },
        { key: 'Content-Security-Policy', value: "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'" },
      ],
    }];
  },
  async redirects() {
    const r = (source, destination) => ({ source, destination, permanent: true });
    return [
      r('/services', '/work'),
      r('/chat', '/inbox'),
      r('/chat/:id', '/inbox/:id'),
      r('/notifications', '/alerts'),
      r('/team', '/crew'),
      r('/conduct', '/code'),
      r('/terms', '/tnc'),
      r('/login', '/in'),
      r('/signup', '/join'),
      r('/engage/:id', '/e/:id'),
      r('/brief/:id', '/b/:id'),
    ];
  },
};
export default nextConfig;
