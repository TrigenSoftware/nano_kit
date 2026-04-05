import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  transpilePackages: [
    'agera',
    'kida',
    '@nano_kit/store',
    '@nano_kit/router',
    '@nano_kit/react',
    '@nano_kit/react-router',
    '@nano_kit/next-router',
    '@nano_kit/query'
  ],
  webpack(config) {
    config.resolve.extensionAlias = {
      '.js': ['.ts', '.js'],
      '.jsx': ['.tsx', '.jsx']
    }
    config.optimization.minimize = false
    return config
  }
}

export default nextConfig
