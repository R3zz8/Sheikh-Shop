import { ImageResponse } from 'next/og';
import { prisma } from '@/lib/prisma';

export const runtime = 'edge';
export const alt = 'Sheikh Shop Article';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const slug = searchParams.get('slug');

  if (!slug) {
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
          Sheikh Shop Blog
        </div>
      ),
      { ...size }
    );
  }

  const article = await prisma.article.findUnique({ where: { slug } });

  if (!article) {
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
          Sheikh Shop Blog
        </div>
      ),
      { ...size }
    );
  }

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
        <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.1 }}>{article.title}</div>
        <div style={{ fontSize: 28, opacity: 0.9, marginTop: 16 }}>Blog</div>
      </div>
    ),
    { ...size }
  );
}

