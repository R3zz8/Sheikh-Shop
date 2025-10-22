// src/app/api/affiliate/performance/route.ts
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  // In a real application, you would fetch this data from your database.
  // For this example, we'll return some mock data.
  const performanceData = [
    { name: 'Jan', sales: 4000, clicks: 2400 },
    { name: 'Feb', sales: 3000, clicks: 1398 },
    { name: 'Mar', sales: 2000, clicks: 9800 },
    { name: 'Apr', sales: 2780, clicks: 3908 },
    { name: 'May', sales: 1890, clicks: 4800 },
    { name: 'Jun', sales: 2390, clicks: 3800 },
    { name: 'Jul', sales: 3490, clicks: 4300 },
  ];

  const progressGoals = {
    sales: { value: 56, goal: 100 },
    clicks: { value: 1234, goal: 5000 },
  };

  return NextResponse.json({
    performanceData,
    progressGoals,
  });
}
