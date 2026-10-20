/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Enable the instrumentation hook (runs env-validator on server start)
  experimental: {
    instrumentationHook: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.pexels.com' },
      { protocol: 'https', hostname: 'img.youtube.com' },
      { protocol: 'https', hostname: 'res.cloudinary.com' },
    ],
  },
  // Allow serving uploaded files from /public/uploads
  async headers() {
    return [
      {
        source: '/uploads/:path*',
        headers: [
          { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
        ],
      },
    ];
  },
  webpack(config, { isServer }) {
    // Cloudinary SDK uses Node built-ins — mark as external for server bundles
    if (isServer) {
      config.externals = [...(config.externals || []), 'cloudinary'];
    }
    return config;
  },
};

module.exports = nextConfig;
