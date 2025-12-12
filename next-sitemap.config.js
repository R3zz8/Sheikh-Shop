/** @type {import('next-sitemap').IConfig} */

const siteUrl = 'https://sheikhshops.com';

// Define sensitive paths to be excluded from the sitemap and disallowed in robots.txt.
// Using wildcards for exclusion and specific directory/page rules for robots.txt.
const SENSITIVE_DIRECTORIES = [
  '/api',
  '/admin',
  '/dashboard',
  '/affiliate/dashboard',
  '/system',
  '/user',
  '/cart',
  '/checkout',
];

const SENSITIVE_PAGES = [
  '/system-login',
  '/login',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/test-userbadge',
];

// Combine and format rules for different uses.
const EXCLUSION_RULES = [
  ...SENSITIVE_DIRECTORIES,
  ...SENSITIVE_DIRECTORIES.map(dir => `${dir}/*`),
  ...SENSITIVE_PAGES,
  '/403',
  '/verify-email',
  '/verify-email-sent',
];

const DISALLOW_RULES = [
  ...SENSITIVE_DIRECTORIES.map(dir => `${dir}/`),
  ...SENSITIVE_PAGES,
];


module.exports = {
  // The base URL of your website.
  siteUrl,

  // Generate a robots.txt file and add it to the public directory.
  generateRobotsTxt: true,

  // Generate index sitemaps for large sites (best practice for e-commerce).
  generateIndexSitemap: true,

  // The maximum number of URLs per sitemap file.
  sitemapSize: 5000,

  // Ensure URLs are consistent with Next.js App Router's default behavior.
  trailingSlash: false,

  // Exclude sensitive and non-SEO paths from the sitemap.
  exclude: EXCLUSION_RULES,

  // Configuration for the auto-generated robots.txt file.
  robotsTxtOptions: {
    // Define access policies for web crawlers.
    policies: [
      {
        userAgent: '*',
        allow: '/',
        // Disallow crawling of all sensitive paths.
        disallow: DISALLOW_RULES,
      },
      {
        userAgent: 'AdsBot-Google',
        allow: '/',
        disallow: DISALLOW_RULES,
      },
    ],
    // The sitemap URL is automatically added, but this is how you'd add more.
    // additionalSitemaps: [
    //   `${siteUrl}/server-sitemap.xml`,
    // ],
  },

  // Add internationalization (hreflang) support for alternate locales.
  // This will add <xhtml:link rel="alternate" .../> tags to your sitemap entries.
  alternateRefs: [
    {
      href: siteUrl,
      hreflang: 'en',
    },
    {
      href: `${siteUrl}/ar`,
      hreflang: 'ar',
    },
    // The x-default hreflang is crucial for international targeting.
    {
        href: siteUrl,
        hreflang: 'x-default',
    }
  ],

  // Custom transformation function to programmatically set priority and change frequency.
  transform: async (config, path) => {
    let priority = 0.7; // Default priority for most pages.
    let changefreq = 'daily'; // Default change frequency.

    // Assign higher priority and specific frequencies to key pages.
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    } else if (path.startsWith('/products')) {
      priority = path === '/products' ? 0.9 : 0.8;
      changefreq = 'daily';
    } else if (path.startsWith('/categories')) {
      priority = 0.8;
      changefreq = 'weekly';
    } else if (path.startsWith('/article')) {
      priority = 0.7;
      changefreq = 'weekly';
    } else if (path.startsWith('/about-us') || path.startsWith('/contact')) {
      priority = 0.8;
      changefreq = 'monthly';
    } else if (path.startsWith('/privacy') || path.startsWith('/terms')) {
      priority = 0.3;
      changefreq = 'yearly';
    }

    // Return the final object for the sitemap entry.
    // `next-sitemap` will automatically handle combining this with `alternateRefs`.
    return {
      loc: path,
      changefreq: changefreq,
      priority: priority,
      lastmod: new Date().toISOString(),
    };
  },
};
