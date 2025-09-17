import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const alt = 'Sheikh Shop Product';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');
  if (!id) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: 'linear-gradient(135deg, #78350f, #d97706)',
            width: '100%',
            height: '100%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
          }}
        >
          Sheikh Shop
        </div>
      ),
      { ...size }
    );
  }

  const product = await prisma.product.findUnique({
    where: { id },
    include: { images: true },
  });

  if (!product) {
    return new ImageResponse(
      (
        <div
          style={{
            fontSize: 64,
            background: 'linear-gradient(135deg, #78350f, #d97706)',
            width: '100%',
            height: '100%',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'Inter',
          }}
        >
          Sheikh Shop
        </div>
      ),
      { ...size }
    );
  }

  const image = product.images?.[0]?.image;

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          background: 'linear-gradient(135deg, #111827, #0b0f19)',
          padding: 48,
          color: 'white',
          fontFamily: 'Inter',
        }}
      >
        <div style={{ fontSize: 42, color: '#f59e0b', marginBottom: 16 }}>Sheikh Shop</div>
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{product.name}</div>
        <div style={{ fontSize: 28, opacity: 0.9, marginTop: 16 }}>{product.category}</div>
        {image && (
          <img
            src={image.startsWith('http') ? image : `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}${image}`}
            width={1000}
            height={420}
            style={{ marginTop: 24, objectFit: 'cover', borderRadius: 12 }}
          />
        )}
      </div>
    ),
    { ...size }
  );
}

