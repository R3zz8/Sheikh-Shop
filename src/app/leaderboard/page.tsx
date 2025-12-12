'use client';
import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, Table, TableHead, TableRow, TableHeader, TableBody, TableCell, Badge } from '@/components/ui';
import { Crown, Trophy, Medal, Award, Sparkles, Users, Calendar, Filter } from 'lucide-react';
import Link from 'next/link';

interface Entry {
  userId: string;
  score: number;
  rank: number;
  user?: { firstName: string | null; lastName: string | null; username: string | null };
}

type LeaderboardPeriod = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY' | 'ALL_TIME';

export default function LeaderboardPage() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<LeaderboardPeriod>('ALL_TIME');
  const [category, setCategory] = useState('XP');

  useEffect(() => {
    let mounted = true;
    const fetchLeaderboard = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/leaderboard?category=${category}&period=${period}&limit=50`);
        if (!response.ok) {
          throw new Error('Failed to fetch leaderboard');
        }
        const data = await response.json();
        if (mounted) {
          setEntries(data);
        }
      } catch {
        if (mounted) setEntries([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchLeaderboard();
    return () => { mounted = false; };
  }, [period, category]);

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Medal className="w-5 h-5 text-amber-600" />;
    return <Award className="w-4 h-4 text-gray-500" />;
  };

  const getRankBadgeColor = (rank: number) => {
    if (rank === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (rank === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (rank === 3) return 'bg-gradient-to-r from-amber-400 to-amber-600 text-white';
    if (rank <= 10) return 'bg-gradient-to-r from-blue-400 to-blue-600 text-white';
    return 'bg-gray-100 text-gray-700';
  };

  const getDisplayName = (entry: Entry) => {
    if (entry.user?.username) return entry.user.username;
    if (entry.user?.firstName && entry.user?.lastName) {
      return `${entry.user.firstName} ${entry.user.lastName}`;
    }
    if (entry.user?.firstName) return entry.user.firstName;
    return `User ${entry.userId.slice(0, 8)}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-amber-600" />
            <h1 className="text-4xl font-bold text-gray-800">Leaderboard</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Compete with other users and climb the ranks! See who's leading in experience points and achievements.
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-8 bg-white/80 backdrop-blur-sm border-amber-200">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-2">
                <Filter className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-gray-700">Filters:</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value as LeaderboardPeriod)}
                  className="px-4 py-2 border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  aria-label="Select leaderboard period"
                >
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                  <option value="YEARLY">Yearly</option>
                  <option value="ALL_TIME">All Time</option>
                </select>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="px-4 py-2 border border-amber-300 rounded-lg bg-white focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  aria-label="Select leaderboard category"
                >
                  <option value="XP">Experience Points</option>
                  <option value="PURCHASES">Purchases</option>
                  <option value="REVIEWS">Reviews</option>
                </select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Leaderboard */}
        <Card className="max-w-4xl mx-auto bg-white/90 backdrop-blur-sm border-amber-200 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
            <CardTitle className="flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              Top {entries.length} Players
              <Badge variant="secondary" className="ml-auto bg-white/20 text-white">
                {period.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <div className="flex items-center gap-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
                  <span className="text-gray-600">Loading leaderboard...</span>
                </div>
              </div>
            ) : entries.length === 0 ? (
              <div className="text-center py-12">
                <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <h3 className="text-xl font-semibold text-gray-600 mb-2">No Data Available</h3>
                <p className="text-gray-500">No leaderboard data found for the selected period.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-amber-50">
                      <TableHead className="w-20 text-center font-semibold">Rank</TableHead>
                      <TableHead className="font-semibold">Player</TableHead>
                      <TableHead className="text-right font-semibold">
                        <div className="flex items-center justify-end gap-2">
                          <Sparkles className="w-4 h-4" />
                          {category}
                        </div>
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {entries.map((entry, index) => (
                      <TableRow 
                        key={entry.userId} 
                        className={`hover:bg-amber-50/50 transition-colors ${
                          entry.rank <= 3 ? 'bg-gradient-to-r from-amber-50/50 to-orange-50/50' : ''
                        }`}
                      >
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-2">
                            {getRankIcon(entry.rank)}
                            <Badge className={getRankBadgeColor(entry.rank)}>
                              #{entry.rank}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-amber-400 to-orange-400 rounded-full flex items-center justify-center text-white font-semibold">
                              {getDisplayName(entry).charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-800">
                                {getDisplayName(entry)}
                              </div>
                              <div className="text-sm text-gray-500">
                                {entry.user?.username ? 'Username' : 'Player'}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-lg font-bold text-amber-600">
                              {entry.score.toLocaleString()}
                            </span>
                            {entry.rank <= 3 && (
                              <div className="flex items-center gap-1">
                                {entry.rank === 1 && <Crown className="w-4 h-4 text-yellow-500" />}
                                {entry.rank === 2 && <Trophy className="w-4 h-4 text-gray-400" />}
                                {entry.rank === 3 && <Medal className="w-4 h-4 text-amber-600" />}
                              </div>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <Link 
            href="/user" 
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-semibold rounded-lg hover:from-amber-600 hover:to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            <Award className="w-5 h-5" />
            View Your Profile
          </Link>
        </div>
      </div>
    </div>
  );
}


