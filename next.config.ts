// next.config.ts
import type { NextConfig } from 'next';
import type { Configuration as WebpackConfig } from 'webpack';
import { withSentryConfig } from '@sentry/nextjs';

// === تایپ درست برای webpack callback در Next.js 15+ ===
interface WebpackContext {
  dev: boolean;
  isServer: boolean;
  buildId: string;
  dir: string;
  config: NextConfig;
  defaultLoaders: any;
  totalPages: number;
}

// === NextConfig اصلی ===
let nextConfig: NextConfig = {
  output: 'standalone',
  reactCompiler: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://vercel.live https://va.vercel-scripts.com https://*.googletagmanager.com https://www.google-analytics.com https://ssl.google-analytics.com https://script.google.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: https: blob: https://res.cloudinary.com",
              "connect-src 'self' https://vercel.live https://va.vercel-scripts.com https://vitals.vercel-insights.com https://www.google-analytics.com https://ssl.google-analytics.com https://*.googletagmanager.com https://script.google.com",
              "frame-src 'self'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
              "frame-ancestors 'none'",
              "upgrade-insecure-requests",
            ].join('; '),
          },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' },
          { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains; preload' },
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'Pragma', value: 'no-cache' },
          { key: 'Expires', value: '0' },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          { key: 'Cache-Control', value: 'no-store, no-cache, must-revalidate, proxy-revalidate' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'X-Frame-Options', value: 'DENY' },
        ],
      },
    ];
  },

  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'picsum.photos', pathname: '/**' },
    ],
  },

  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },

  turbopack: {},

  poweredByHeader: false,
  compress: true,
  productionBrowserSourceMaps: true, // Sentry: Must be true for source maps
  trailingSlash: false,
  staticPageGenerationTimeout: 120,

  // === Webpack با تایپ کامل (بدون ارور) ===
  webpack: (
    config: WebpackConfig,
    context: WebpackContext
  ): WebpackConfig => {
    const { dev, isServer } = context;

    // BUILD FIX: Exclude 'webworker-threads' from the server bundle using IgnorePlugin.
    // The 'natural' package has a dependency on this module, which is not
    // compatible with the Next.js environment. This plugin prevents it from
    // being bundled.
    config.plugins = config.plugins || [];
    config.plugins.push(
      new (require('webpack').IgnorePlugin)({
        resourceRegExp: /webworker-threads/,
      })
    );

    // حذف ماژول‌های غیرضروری از کلاینت
    if (!isServer) {
      config.resolve = config.resolve || {};
      config.resolve.fallback = {
        ...config.resolve.fallback,
        natural: false,
        aws4: false,
      };
    }

    // فشرده‌سازی در production
    if (!dev) {
      config.optimization = config.optimization || {};
      config.optimization.minimize = true;
    }

    // آنالیز باندل فقط در dev
    if (!dev && !isServer) {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer') as typeof import('webpack-bundle-analyzer');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          openAnalyzer: false,
          reportFilename: '../.reports/bundle-analyzer-report.html',
        })
      );
    }

    return config;
  },
};

const sentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure to put Sentry last in the export so it can wrap everything else.
export default withSentryConfig(nextConfig, sentryWebpackPluginOptions);
