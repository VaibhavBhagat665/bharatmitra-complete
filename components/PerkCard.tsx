import React from 'react';
import { TokenIcon } from './icons/TokenIcon';

// Updated type to match your RedeemPage structure
type Perk = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  category: 'Premium' | 'Mentorship' | 'Exam' | 'Daily' | 'Mystery';
};

interface PerkCardProps {
  perk: Perk;
  userTokens: number;
  onRedeem: (perkId: string, price: number) => void;
  isRedeeming?: boolean;
}

const PerkCard: React.FC<PerkCardProps> = ({ perk, userTokens, onRedeem, isRedeeming = false }) => {
  const canAfford = userTokens >= perk.price;
  const IconComponent = perk.icon;

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Premium': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Mentorship': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Exam': return 'bg-green-100 text-green-800 border-green-200';
      case 'Daily': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Mystery': return 'bg-pink-100 text-pink-800 border-pink-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div
      className={`
        bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 
        border-t-4 border-red-600 flex flex-col justify-between hover:shadow-2xl 
        hover:shadow-red-300 transform hover:scale-[1.02] ${isRedeeming ? 'opacity-75' : ''}
      `}
    >
      <div className="p-6">
        {/* Category Badge */}
        <div className="flex justify-between items-start mb-4">
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-semibold border ${getCategoryColor(perk.category)}`}>
            {perk.category}
          </span>
        </div>

        {/* Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center text-3xl">
            <IconComponent />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-center text-red-800 mb-2">{perk.name}</h3>

        {/* Description */}
        <p className="text-gray-600 text-center text-sm">{perk.description}</p>
      </div>

      {/* Price & Button */}
      <div className="px-6 py-4 bg-gray-50 border-t">
        <div className="flex items-center justify-center text-lg font-bold text-red-700 mb-4">
          <TokenIcon className="w-5 h-5 mr-1" />
          <span>{perk.price === 0 ? 'Free' : perk.price}</span>
        </div>

        <button
          onClick={() => onRedeem(perk.id, perk.price)}
          disabled={!canAfford || isRedeeming}
          className={`
            w-full font-bold py-3 px-4 rounded-lg text-white transition-all duration-200 flex items-center justify-center space-x-2
            ${canAfford && !isRedeeming
              ? 'bg-red-600 hover:bg-red-700 hover:scale-105'
              : 'bg-gray-300 cursor-not-allowed'}
          `}
        >
          {isRedeeming ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : canAfford ? (
            'Redeem Now'
          ) : (
            'Not Enough Tokens'
          )}
        </button>

        {/* Debug info (remove in production) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="mt-2 text-xs text-gray-500 text-center">
            Need: {perk.price} | Have: {userTokens} | Can afford: {canAfford ? 'Yes' : 'No'}
          </div>
        )}
      </div>
    </div>
  );
};

export default PerkCard;
