import { NextRequest, NextResponse } from 'next/server';
import { createGamificationEngine } from '@/lib/gamification/gamification-engine';
import { withRateLimit } from '@/lib/rateLimiter';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, xp, reason } = body;

    if (!userId || !xp) {
      return NextResponse.json(
        { error: 'User ID and XP amount are required' },
        { status: 400 }
      );
    }

    const gamificationEngine = createGamificationEngine();
    const result = await gamificationEngine.awardXP(userId, xp, reason || 'XP awarded');

    return NextResponse.json({ 
      success: true,
      newLevel: result.newLevel,
      leveledUp: result.leveledUp
    });
  } catch (error) {
    console.error('Error awarding XP:', error);
    return NextResponse.json(
      { error: 'Failed to award XP' },
      { status: 500 }
    );
  }
}
