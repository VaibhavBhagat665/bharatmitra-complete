import React from 'react';
import { RedeemPerk } from '../types';
import { TokenIcon } from './icons/TokenIcon';

interface PerkCardProps {
    perk: RedeemPerk;
    userTokens: number;
    onRedeem: (perkId: string, price: number) => void;
}

const PerkCard: React.FC<PerkCardProps> = ({ perk, userTokens, onRedeem }) => {
    const canAfford = userTokens >= perk.price;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden border-t-4 border-bharat-blue-600 flex flex-col justify-between">
            <div className="p-6">
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-bharat-blue-100 rounded-full flex items-center justify-center">
                        <perk.icon className="w-8 h-8 text-bharat-blue-700" />
                    </div>
                </div>
                <h3 className="text-xl font-bold text-center text-bharat-blue-900 mb-2">{perk.name}</h3>
                <p className="text-gray-600 text-center text-sm mb-4">{perk.description}</p>
            </div>
            <div className="px-6 py-4 bg-gray-50 border-t">
                <div className="flex items-center justify-center text-2xl font-bold text-bharat-green-700 mb-4">
                    <TokenIcon className="w-6 h-6 mr-2" />
                    <span>{perk.price}</span>
                </div>
                <button 
                    onClick={() => onRedeem(perk.id, perk.price)}
                    disabled={!canAfford}
                    className="w-full font-bold py-2 px-4 rounded text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed bg-bharat-blue-700 hover:bg-bharat-blue-800"
                >
                    {canAfford ? 'Redeem Now' : 'Not Enough Tokens'}
                </button>
            </div>
        </div>
    );
};

export default PerkCard;
