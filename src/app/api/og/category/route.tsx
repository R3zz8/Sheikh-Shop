import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Sheikh Shop Category';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export async function GET(req: Request) {
	const { searchParams } = new URL(req.url);
	const name = (searchParams.get('name') || 'Category').toUpperCase();

	return new ImageResponse(
		(
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					flexDirection: 'column',
					justifyContent: 'center',
					alignItems: 'center',
					background: 'linear-gradient(135deg, #111827, #0b0f19)',
					color: 'white',
					fontFamily: 'Inter',
					padding: 48,
				}}
			>
				<div style={{ fontSize: 42, color: '#f59e0b', marginBottom: 16 }}>Sheikh Shop</div>
				<div style={{ fontSize: 72, fontWeight: 800, lineHeight: 1.05 }}>{name}</div>
				<div style={{ fontSize: 28, opacity: 0.9, marginTop: 16 }}>Premium Collections</div>
			</div>
		),
		{ ...size }
	);
}

export default GET;
