/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["@algobattle/db", "@algobattle/types"],
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
};

module.exports = nextConfig;
