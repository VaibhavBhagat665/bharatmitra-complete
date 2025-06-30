
import React from 'react';
import { LEADERBOARD_DATA } from '../constants';
import LeaderboardItem from '../components/LeaderboardItem';

const LeaderboardPage: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-bharat-blue-900 mb-2">Community Leaderboard</h1>
        <p className="text-lg text-gray-600">Top users earning tokens by learning and sharing knowledge.</p>
      </div>
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-left font-bold text-sm text-gray-500 uppercase tracking-wider">
                <span className="col-span-1">#</span>
                <span className="col-span-5">User</span>
                <span className="col-span-3">Location</span>
                <span className="col-span-3 text-right">Tokens</span>
            </div>
        </div>
        <div className="divide-y divide-gray-200">
            {LEADERBOARD_DATA.map((user, index) => (
            <LeaderboardItem key={user.rank} user={user} isTopThree={index < 3} />
            ))}
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPage;
