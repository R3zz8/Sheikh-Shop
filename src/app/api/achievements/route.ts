import { NextResponse } from 'next/server';
import { createGamificationEngine } from '@/lib/gamification/gamification-engine';

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const engine = createGamificationEngine();
    const achievements = await engine.getAvailableAchievements();
    return NextResponse.json(achievements);
  } catch (error) {
    console.error('Failed to fetch achievements:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
