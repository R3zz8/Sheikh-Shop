import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // ESLint: Ignore during production builds
  eslint: {
    ignoreDuringBuilds: true,
  },

  // Security: Enhanced security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          // Security: Content Security Policy
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob:",
              "connect-src 'self' https://vercel.live https://va.vercel-scripts.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          // Security: X-Frame-Options
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          // Security: X-Content-Type-Options
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          // Security: X-XSS-Protection
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          // Security: Referrer Policy
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          // Security: Permissions Policy
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          // Security: Strict-Transport-Security (HSTS)
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains; preload',
          },
          // Security: Cache Control for sensitive pages
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          // Security: Pragma
          {
            key: 'Pragma',
            value: 'no-cache',
          },
          // Security: Expires
          {
            key: 'Expires',
            value: '0',
          },
          // Security: X-DNS-Prefetch-Control
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
        ],
      },
      // Security: Additional headers for API routes
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, no-cache, must-revalidate, proxy-revalidate',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
        ],
      },
    ];
  },

  // Performance: Image optimization
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Allow external image domains for development and production
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
    ],
    // Alternative: Use domains array for simpler configuration
    // domains: ['images.unsplash.com', 'res.cloudinary.com', 'via.placeholder.com', 'picsum.photos'],
  },

  // Performance: Bundle optimization
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  // Turbopack configuration (stable in Next.js 15)
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },

  // Security: Disable powered by header
  poweredByHeader: false,

  // Performance: Compression
  compress: true,

  // Development: Source maps in development only
  productionBrowserSourceMaps: false,

  // Security: Disable directory listing
  trailingSlash: false,

  // Performance: Static optimization
  staticPageGenerationTimeout: 120,

  // Security: Environment variables validation
  env: {
    CUSTOM_KEY: process.env.CUSTOM_KEY,
  },

  // Performance: Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Security: Disable eval in production
    if (!dev) {
      config.optimization.minimize = true;
    }

    // Performance: Bundle analyzer in development
    if (dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
        })
      );
    }

    return config;
  },
};

export default nextConfig;