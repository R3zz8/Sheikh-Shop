import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/seo/hreflang';

export async function GET() {
  const baseUrl = getBaseUrl();
  
  const ampHtml = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${baseUrl}/">
  <title>Sheikh Shop - Premium Natural Products</title>
  <style amp-custom>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom right, #451a03, #1c1917, #451a03);
      color: #fff;
    }
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin: 20px 0;
      text-align: center;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Welcome to Sheikh Shop</h1>
    <p style="text-align: center; font-size: 1.1rem; margin-bottom: 40px;">
      Experience luxury redefined with our curated collection of premium products,
      inspired by the elegance of Arabian heritage.
    </p>
    <div style="text-align: center;">
      <a href="${baseUrl}/products" style="
        background: linear-gradient(to right, #d97706, #f59e0b, #f97316);
        color: white;
        padding: 15px 30px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: bold;
        display: inline-block;
      ">View Products</a>
    </div>
  </div>
</body>
</html>`;

  return new NextResponse(ampHtml, {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
    },
  });
}


