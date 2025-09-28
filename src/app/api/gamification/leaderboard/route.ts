import { NextRequest, NextResponse } from 'next/server';
import { createGamificationEngine } from '@/lib/gamification/gamification-engine';
import { withRateLimit } from '@/lib/rateLimiter';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'TOTAL_SPENT';
    const period = searchParams.get('period') || 'ALL_TIME';
    const limit = parseInt(searchParams.get('limit') || '10');

    const gamificationEngine = createGamificationEngine();
    const leaderboard = await gamificationEngine.getLeaderboard(
      category as any,
      period as any,
      limit
    );

    return NextResponse.json({ leaderboard });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
