import { NextResponse } from 'next/server';
import { createGamificationEngine } from '@/lib/gamification/gamification-engine';

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || 'XP';
    const period = (searchParams.get('period') || 'ALL_TIME') as any;
    const limit = parseInt(searchParams.get('limit') || '50', 10);

    const engine = createGamificationEngine();
    const leaderboard = await engine.getLeaderboard(category, period, limit);

    return NextResponse.json(leaderboard);
  } catch (error) {
    console.error('Failed to fetch leaderboard:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
