'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHead, TableRow, TableHeader, TableBody, TableCell } from '@/components/ui';
import { createGamificationEngine } from '@/lib/gamification/gamification-engine';

interface Entry {
  userId: string;
  score: number;
  rank: number;
  user?: { firstName: string | null; lastName: string | null; username: string | null };
}

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const engine = createGamificationEngine();
        const list = await engine.getLeaderboard('XP', 'ALL_TIME', 20);
        if (mounted) {
          setEntries(list as any);
        }
      } catch {
        if (mounted) setEntries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>Leaderboard</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div>Loading...</div>
          ) : entries.length === 0 ? (
            <div>No leaderboard data available.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Rank</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>XP</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map(e => (
                  <TableRow key={e.userId}>
                    <TableCell>{e.rank}</TableCell>
                    <TableCell>
                      {e.user?.username || [e.user?.firstName, e.user?.lastName].filter(Boolean).join(' ') || e.userId}
                    </TableCell>
                    <TableCell>{e.score}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


