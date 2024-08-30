/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: ['placeholder.com'], // Add any domains you'll be loading images from
  },
  api: {
    bodyParser: {
      sizeLimit: '100mb', // Increase this limit as needed
    },
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        path: false,
      }
    }
    return config
  },
};

export default nextConfig;