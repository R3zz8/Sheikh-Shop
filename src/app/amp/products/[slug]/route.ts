import { NextResponse } from 'next/server';
import { getBaseUrl } from '@/lib/seo/hreflang';
import { getProductBySlug } from '@/modules/products/services';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  const baseUrl = getBaseUrl();
  
  if (!product) {
    return new NextResponse('Product not found', { status: 404 });
  }
  
  const ampHtml = `<!doctype html>
<html ⚡ lang="en">
<head>
  <meta charset="utf-8">
  <script async src="https://cdn.ampproject.org/v0.js"></script>
  <script async custom-element="amp-img" src="https://cdn.ampproject.org/v0/amp-img-0.1.js"></script>
  <meta name="viewport" content="width=device-width,minimum-scale=1,initial-scale=1">
  <link rel="canonical" href="${baseUrl}/products/${product.slug || product.id}">
  <title>${product.name} - Premium ${product.category} | Sheikh Shop</title>
  <style amp-custom>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      margin: 0;
      padding: 0;
      background: linear-gradient(to bottom right, #451a03, #1c1917, #451a03);
      color: #fff;
    }
    .container {
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
    }
    h1 {
      font-size: 2.5rem;
      margin: 20px 0;
    }
    .product-detail {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 30px;
      margin-top: 30px;
    }
    .product-image {
      background: rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 20px;
    }
    .product-info {
      padding: 20px;
    }
    .product-price {
      font-size: 2.5rem;
      font-weight: bold;
      color: #fbbf24;
      margin: 20px 0;
    }
    .product-description {
      font-size: 1.1rem;
      line-height: 1.6;
      margin: 20px 0;
    }
    .cta-button {
      background: linear-gradient(to right, #d97706, #f59e0b, #f97316);
      color: white;
      padding: 15px 30px;
      border: none;
      border-radius: 8px;
      font-size: 1.1rem;
      font-weight: bold;
      text-decoration: none;
      display: block;
      text-align: center;
      margin-top: 20px;
    }
    @media (max-width: 768px) {
      .product-detail {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>
<body>
  <div class="container">
    <a href="${baseUrl}/products" style="color: #fbbf24; text-decoration: none; margin-bottom: 20px; display: block;">
      ← Back to Products
    </a>
    <h1>${product.name}</h1>
    <div class="product-detail">
      <div class="product-image">
        <amp-img
          src="${product.images?.[0]?.image || `${baseUrl}/og-image.jpg`}"
          alt="${product.name} - Premium ${product.category} from Sheikh Shop"
          width="500"
          height="500"
          layout="responsive"
        ></amp-img>
      </div>
      <div class="product-info">
        <div class="product-price">$${product.basePrice.toFixed(2)}</div>
        <div style="margin-bottom: 20px;">
          <span style="
            background: rgba(255, 255, 255, 0.2);
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 0.9rem;
          ">${product.category}</span>
        </div>
        <div class="product-description">
          ${product.description || 'Premium quality product with exceptional features.'}
        </div>
        <a href="${baseUrl}/products/${product.slug || product.id}" class="cta-button">
          View Full Details
        </a>
      </div>
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


