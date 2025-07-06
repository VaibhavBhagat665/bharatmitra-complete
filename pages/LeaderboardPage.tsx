import React, { useState, useEffect } from 'react';
import { useUser } from '../contexts/UserContext';
import { Trophy, Medal, Award, TrendingUp, Users, Clock, Star, Crown, Target, RefreshCw, AlertCircle } from 'lucide-react';

const LeaderboardPage: React.FC = () => {
  const { 
    leaderboardData, 
    user, 
    userData, 
    userRank, 
    userBadge, 
    getUserProgress,
    refreshLeaderboard,
    loading 
  } = useUser();
  
  const [timeFilter, setTimeFilter] = useState<'all' | 'week' | 'month'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'students' | 'professionals'>('all');
  const [showUserCard, setShowUserCard] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const userProgress = getUserProgress();

  // Fetch leaderboard data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setError(null);
        await refreshLeaderboard();
      } catch (err) {
        setError('Failed to load leaderboard data');
        console.error('Error fetching leaderboard:', err);
      }
    };

    if (user && !leaderboardData.length) {
      fetchData();
    }
  }, [user, refreshLeaderboard]);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      setError(null);
      await refreshLeaderboard();
    } catch (err) {
      setError('Failed to refresh leaderboard');
      console.error('Error refreshing leaderboard:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Crown className="w-6 h-6 text-yellow-500" />;
      case 2:
        return <Trophy className="w-6 h-6 text-gray-400" />;
      case 3:
        return <Medal className="w-6 h-6 text-amber-600" />;
      default:
        return <span className="w-6 h-6 flex items-center justify-center text-sm font-bold text-gray-500">#{rank}</span>;
    }
  };

  const getBadgeColor = (badge: string) => {
    if (badge?.includes('Champion')) return 'bg-gradient-to-r from-yellow-400 to-orange-500';
    if (badge?.includes('Expert')) return 'bg-gradient-to-r from-blue-400 to-purple-500';
    if (badge?.includes('Scholar')) return 'bg-gradient-to-r from-green-400 to-teal-500';
    if (badge?.includes('Learner')) return 'bg-gradient-to-r from-pink-400 to-red-500';
    if (badge?.includes('Explorer')) return 'bg-gradient-to-r from-indigo-400 to-blue-500';
    return 'bg-gradient-to-r from-gray-400 to-gray-500';
  };

  const getProgressColor = (level: number) => {
    if (level >= 10) return 'bg-gradient-to-r from-purple-500 to-pink-500';
    if (level >= 5) return 'bg-gradient-to-r from-blue-500 to-purple-500';
    if (level >= 3) return 'bg-gradient-to-r from-green-500 to-blue-500';
    return 'bg-gradient-to-r from-yellow-500 to-orange-500';
  };

  const filteredLeaderboard = leaderboardData.filter(leaderUser => {
    if (categoryFilter === 'students' && !leaderUser.occupation?.toLowerCase().includes('student')) return false;
    if (categoryFilter === 'professionals' && leaderUser.occupation?.toLowerCase().includes('student')) return false;
    return true;
  });

  // Loading state
  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="text-center py-12">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={handleRefresh}
            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <TrendingUp className="w-8 h-8 text-red-600" />
          <h1 className="text-4xl font-bold text-gray-900">Community Leaderboard</h1>
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="ml-4 p-2 text-gray-600 hover:text-red-600 transition-colors disabled:opacity-50"
            title="Refresh leaderboard"
          >
            <RefreshCw className={`w-5 h-5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
        <p className="text-gray-600 text-lg">
          Compete with fellow learners and climb the ranks by exploring government schemes
        </p>
        <div className="flex items-center justify-center gap-2 mt-2 text-sm text-gray-500">
          <Users className="w-4 h-4" />
          <span>{leaderboardData.length} active users</span>
          <Clock className="w-4 h-4 ml-4" />
          <span>Updated in real-time</span>
        </div>
      </div>

      {/* User Progress Card */}
      {showUserCard && user && userData && (
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 mb-8 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Your Progress</h2>
            <button
              onClick={() => setShowUserCard(false)}
              className="text-gray-400 hover:text-gray-600 p-1"
            >
              <span className="sr-only">Close</span>
              ✕
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Trophy className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Your Rank</p>
                  <p className="text-2xl font-bold text-blue-600">#{userRank || 'Unranked'}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-green-50 to-teal-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Star className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Current Tokens</p>
                  <p className="text-2xl font-bold text-green-600">{userData.bharat_tokens}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Target className="w-6 h-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Level</p>
                  <p className="text-2xl font-bold text-purple-600">{userProgress.level}</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-red-50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                  <Award className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Badge</p>
                  <p className="text-sm font-bold text-orange-600">{userBadge}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600">Progress to Level {userProgress.level + 1}</span>
              <span className="text-sm font-medium text-gray-900">
                {userProgress.tokensToNextLevel} tokens to go
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${getProgressColor(userProgress.level)} transition-all duration-300`}
                style={{ 
                  width: `${Math.max(10, 100 - (userProgress.tokensToNextLevel / 100) * 100)}%` 
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex gap-2">
          <span className="text-sm text-gray-600 self-center">Time:</span>
          {(['all', 'week', 'month'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setTimeFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                timeFilter === filter
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex gap-2">
          <span className="text-sm text-gray-600 self-center">Category:</span>
          {(['all', 'students', 'professionals'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setCategoryFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                categoryFilter === filter
                  ? 'bg-red-600 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {filter.charAt(0).toUpperCase() + filter.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-red-50 to-pink-50 px-6 py-4 border-b border-gray-200">
          <div className="grid grid-cols-12 gap-4 text-left font-bold text-sm text-gray-700 uppercase tracking-wider">
            <span className="col-span-1">Rank</span>
            <span className="col-span-4">User</span>
            <span className="col-span-2">Badge</span>
            <span className="col-span-2">Level</span>
            <span className="col-span-3 text-right">Tokens</span>
          </div>
        </div>

        <div className="divide-y divide-gray-100">
          {filteredLeaderboard.length === 0 ? (
            <div className="text-center py-12">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No users found in this category</p>
              <button
                onClick={handleRefresh}
                className="mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Refresh Leaderboard
              </button>
            </div>
          ) : (
            filteredLeaderboard.map((leaderUser, index) => {
              const isCurrentUser = leaderUser.uid === user?.uid;
              const userLevel = Math.floor(leaderUser.bharat_tokens / 100) + 1;
              
              return (
                <div
                  key={leaderUser.uid}
                  className={`px-6 py-4 transition-all duration-200 ${
                    isCurrentUser 
                      ? 'bg-gradient-to-r from-blue-50 to-purple-50 border-l-4 border-blue-500' 
                      : 'hover:bg-gray-50'
                  } ${index < 3 ? 'bg-gradient-to-r from-yellow-50 to-orange-50' : ''}`}
                >
                  <div className="grid grid-cols-12 gap-4 items-center">
                    {/* Rank */}
                    <div className="col-span-1">
                      {getRankIcon(index + 1)}
                    </div>

                    {/* User Info */}
                    <div className="col-span-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold">
                          {(leaderUser.username || 'U').charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-gray-900">
                              {leaderUser.username || 'Anonymous'}
                              {isCurrentUser && (
                                <span className="text-blue-600 text-sm ml-1">(You)</span>
                              )}
                            </p>
                            {index < 3 && (
                              <div className="flex items-center">
                                {index === 0 && <Crown className="w-4 h-4 text-yellow-500" />}
                                {index === 1 && <Trophy className="w-4 h-4 text-gray-400" />}
                                {index === 2 && <Medal className="w-4 h-4 text-amber-600" />}
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-500">
                            {leaderUser.occupation || 'Government Scheme Explorer'}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Badge */}
                    <div className="col-span-2">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${
                        getBadgeColor(leaderUser.badge || 'Explorer')
                      }`}>
                        {leaderUser.badge || 'Explorer'}
                      </span>
                    </div>

                    {/* Level */}
                    <div className="col-span-2">
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                          getProgressColor(userLevel)
                        }`}>
                          {userLevel}
                        </div>
                        <span className="text-sm text-gray-600">Level {userLevel}</span>
                      </div>
                    </div>

                    {/* Tokens */}
                    <div className="col-span-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Star className="w-4 h-4 text-yellow-500" />
                        <span className="text-lg font-bold text-gray-900">
                          {leaderUser.bharat_tokens?.toLocaleString() || '0'}
                        </span>
                      </div>
                      {leaderUser.weeklyTokens && (
                        <p className="text-sm text-gray-500">
                          +{leaderUser.weeklyTokens} this week
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Progress Bar for Top 3 */}
                  {index < 3 && (
                    <div className="mt-3 ml-16">
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(userLevel)} transition-all duration-500`}
                          style={{ 
                            width: `${Math.min(100, (leaderUser.bharat_tokens % 100))}%` 
                          }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        {100 - (leaderUser.bharat_tokens % 100)} tokens to next level
                      </p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Statistics */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Active Users</p>
              <p className="text-2xl font-bold text-blue-600">{leaderboardData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <Star className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tokens in Circulation</p>
              <p className="text-2xl font-bold text-green-600">
                {leaderboardData.reduce((sum, user) => sum + (user.bharat_tokens || 0), 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <Award className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Champions</p>
              <p className="text-2xl font-bold text-purple-600">
                {leaderboardData.filter(user => (user.bharat_tokens || 0) >= 1000).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational Footer */}
      <div className="mt-8 bg-gradient-to-r from-red-600 to-pink-600 rounded-xl p-6 text-white text-center">
        <h3 className="text-xl font-bold mb-2">🚀 Ready to Climb Higher?</h3>
        <p className="mb-4">
          Explore more government schemes, help others, and earn tokens to reach the top!
        </p>
        <div className="flex flex-wrap justify-center gap-4 text-sm">
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="font-medium">💰 Rare schemes = More tokens</span>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="font-medium">🎯 Daily login streaks = Bonus rewards</span>
          </div>
          <div className="bg-white/20 rounded-full px-4 py-2">
            <span className="font-medium">🌟 Weekend activities = Extra multipliers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
