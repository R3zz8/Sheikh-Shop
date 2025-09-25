import { prisma } from '@/lib/prisma';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    
    // Test if the Product table exists and has the isAmazing field
    const productCount = await prisma.product.count();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      productCount,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Health check failed:', error);
    
    let errorMessage = 'Unknown error';
    if (error instanceof Error) {
      if (error.message.includes('Can\'t reach database server')) {
        errorMessage = 'Database connection failed';
      } else if (error.message.includes('Unknown column') || error.message.includes('does not exist')) {
        errorMessage = 'Database schema mismatch';
      } else {
        errorMessage = error.message;
      }
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: errorMessage,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
