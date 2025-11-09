import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/seo/hreflang';
import { getProductsByCategory } from '@/lib/data/products';
import { ProductCategoryType } from '@prisma/client';

export async function GET() {
  const baseUrl = getBaseUrl();
  const products = await getProductsByCategory(ProductCategoryType.SheikhFood);
  const limitedProducts = products.slice(0, 12);
  
  const productsHtml = limitedProducts.map(product => `
    <div style="
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 15px;
      text-align: center;
    ">
      <amp-img
        src="${product.images?.[0]?.image || `${baseUrl}/og-image.jpg`}"
        alt="${product.name} - Premium ${product.category} from Sheikh Shop"
        width="200"
        height="200"
        layout="responsive"
      ></amp-img>
      <div style="font-size: 1rem; font-weight: bold; margin: 10px 0;">
        ${product.name}
      </div>
      <div style="font-size: 1.25rem; font-weight: bold; color: #fbbf24; margin: 10px 0;">
        $${product.basePrice.toFixed(2)}
      </div>
      <a href="${baseUrl}/products/${product.slug || product.id}" style="
        display: block;
        margin-top: 10px;
        color: #fbbf24;
        text-decoration: none;
      ">View Details</a>
    </div>
  `).join('');
  
  const ampHtml = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${baseUrl}/products">
  <title>Premium Products Collection | Sheikh Shop</title>
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
      font-size: 2rem;
      margin: 20px 0;
      text-align: center;
    }
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
      gap: 20px;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Premium Products Collection</h1>
    <p style="text-align: center; margin-bottom: 30px;">
      Discover our curated collection of premium Middle Eastern products.
    </p>
    <div class="products-grid">
      ${productsHtml}
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


