
import React from 'react';
import { LeaderboardUser } from '../types';
import { TokenIcon } from './icons/TokenIcon';

interface LeaderboardItemProps {
  user: LeaderboardUser;
  isTopThree: boolean;
}

const LeaderboardItem: React.FC<LeaderboardItemProps> = ({ user, isTopThree }) => {
    const rankColor = 
        user.rank === 1 ? 'text-yellow-500' : 
        user.rank === 2 ? 'text-gray-400' : 
        user.rank === 3 ? 'text-orange-500' : 'text-gray-500';

  return (
    <div className={`px-6 py-4 ${isTopThree ? 'bg-bharat-blue-50' : 'bg-white'}`}>
        <div className="grid grid-cols-12 gap-4 items-center">
            <div className={`col-span-1 font-bold text-lg ${rankColor}`}>
                {user.rank}
            </div>
            <div className="col-span-5 flex items-center space-x-4">
                <img src={user.avatarUrl} alt={user.name} className="h-10 w-10 rounded-full object-cover" />
                <div>
                    <p className="font-semibold text-bharat-blue-900">{user.name}</p>
                </div>
            </div>
            <div className="col-span-3 text-gray-600">{user.location}</div>
            <div className="col-span-3 text-right flex items-center justify-end space-x-2">
                <TokenIcon className="h-5 w-5 text-bharat-green-500"/>
                <span className="font-bold text-lg text-gray-800">{user.tokens}</span>
            </div>
        </div>
    </div>
  );
};

export default LeaderboardItem;
