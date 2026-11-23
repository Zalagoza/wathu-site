/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  experimental: { serverActions: { bodySizeLimit: '5mb' } },
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
