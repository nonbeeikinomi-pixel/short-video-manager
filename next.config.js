/** @type {import('next').NextConfig} */
const nextConfig = {
  // ビルド時にSupabaseクライアントを初期化しないよう動的レンダリングを強制
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
