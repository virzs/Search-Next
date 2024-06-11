/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  async rewrites() {
    return [
      {
        source: "/:path*",
        destination: "/pages/:path*",
      },
    ];
  },
};

export default nextConfig;
