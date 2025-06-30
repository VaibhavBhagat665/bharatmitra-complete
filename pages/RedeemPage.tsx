

import React, { useState, useContext } from 'react';
import { UserContext } from '../contexts/UserContext';
import { REDEEM_PERKS } from '../constants';
import PerkCard from '../components/PerkCard';

const RedeemPage: React.FC = () => {
    const { userData, redeemPerk } = useContext(UserContext);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

    const handleRedeem = async (perkId: string, price: number) => {
        const success = await redeemPerk(perkId, price);
        if (success) {
            setNotification({ message: 'Redemption successful! You will be contacted shortly.', type: 'success' });
        } else {
            setNotification({ message: 'Not enough tokens to redeem this perk.', type: 'error' });
        }
        // Hide notification after 3 seconds
        setTimeout(() => setNotification(null), 3000);
    };

    const userTokens = userData?.bharat_tokens ?? 0;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
                <h1 className="text-4xl font-extrabold text-bharat-blue-900 mb-2">Redeem Your Tokens</h1>
                <p className="text-lg text-gray-600">Use your hard-earned tokens to get exclusive perks and benefits.</p>
            </div>

            {notification && (
                <div className={`p-4 mb-8 rounded-md text-center font-semibold ${notification.type === 'success' ? 'bg-bharat-green-100 text-bharat-green-800' : 'bg-red-100 text-red-800'}`}>
                    {notification.message}
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {REDEEM_PERKS.map(perk => (
                    <PerkCard 
                        key={perk.id} 
                        perk={perk} 
                        userTokens={userTokens} 
                        onRedeem={handleRedeem} 
                    />
                ))}
            </div>
        </div>
    );
};

export default RedeemPage;