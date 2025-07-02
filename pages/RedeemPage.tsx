import React, { useState, useContext } from 'react';
import Confetti from 'react-confetti';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { UserContext } from '../contexts/UserContext';
import PerkCard from '../components/PerkCard';

// Define your Perk type inline (or import if defined elsewhere)
type Perk = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  category: 'Premium' | 'Mentorship' | 'Exam' | 'Daily' | 'Mystery';
};

// Create 15+ perks
const ALL_PERKS: Perk[] = [
  // Premium
  { id: 'premium-1', name: 'Premium Scheme Access', description: 'Unlock detailed guides & calculators.', price: 60, icon: () => <>🏆</>, category: 'Premium' },
  { id: 'premium-2', name: 'Exclusive Webinar', description: 'Attend govt strategy sessions.', price: 50, icon: () => <>🎤</>, category: 'Premium' },
  { id: 'premium-3', name: 'Monthly Masterclass', description: 'Webinar with expert panel.', price: 70, icon: () => <>🎓</>, category: 'Premium' },

  // Mentorship
  { id: 'mentorship-1', name: '1-on-1 Mentor Call', description: 'Talk to a verified expert.', price: 40, icon: () => <>📞</>, category: 'Mentorship' },
  { id: 'mentorship-2', name: 'Resume Review', description: 'Get resume feedback.', price: 30, icon: () => <>📝</>, category: 'Mentorship' },
  { id: 'mentorship-3', name: 'Mock Interview', description: 'Practice for govt job interview.', price: 35, icon: () => <>🎯</>, category: 'Mentorship' },

  // Exam
  { id: 'exam-1', name: 'Exam Prep Kit', description: 'Practice materials & tips.', price: 25, icon: () => <>📚</>, category: 'Exam' },
  { id: 'exam-2', name: 'Current Affairs Digest', description: 'Monthly e-mag for competitive exams.', price: 15, icon: () => <>📰</>, category: 'Exam' },
  { id: 'exam-3', name: 'Solved PYQs', description: 'Past paper solutions.', price: 20, icon: () => <>📄</>, category: 'Exam' },

  // Daily
  { id: 'daily-1', name: 'Daily Scheme Tip', description: 'Quick daily scheme tips.', price: 5, icon: () => <>📅</>, category: 'Daily' },
  { id: 'daily-2', name: 'Token Booster (Video)', description: 'Watch a 30s video for 10 tokens.', price: 0, icon: () => <>🎥</>, category: 'Daily' },
  { id: 'daily-3', name: 'Badge of Supporter', description: 'Special badge for engagement.', price: 5, icon: () => <>🏅</>, category: 'Daily' },

  // Mystery
  { id: 'mystery-1', name: '🎁 Mystery Box', description: 'Unlock a surprise reward!', price: 10, icon: () => <>🎁</>, category: 'Mystery' },
  { id: 'mystery-2', name: 'Secret Scheme Reveal', description: 'Unlock hidden high-benefit scheme.', price: 15, icon: () => <>🔍</>, category: 'Mystery' },
  { id: 'mystery-3', name: 'Lucky Spin', description: 'Try your luck for tokens or perks.', price: 20, icon: () => <>🎡</>, category: 'Mystery' },
];

const CATEGORIES: (Perk['category'] | 'All')[] = ['All', 'Premium', 'Mentorship', 'Exam', 'Daily', 'Mystery'];

const RedeemPage: React.FC = () => {
  const { tokenBalance, redeemPerk, user, userData } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState<'All' | Perk['category']>('All');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const filtered = selectedCategory === 'All'
    ? ALL_PERKS
    : ALL_PERKS.filter((perk) => perk.category === selectedCategory);

  const handleRedeem = async (id: string, price: number) => {
    console.log('=== REDEEM ATTEMPT ===');
    console.log('Perk ID:', id);
    console.log('Price:', price);
    console.log('Current token balance:', tokenBalance);
    console.log('User authenticated:', !!user);
    console.log('User data available:', !!userData);

    if (!user || !userData) {
      setNotification({ message: '❌ Please log in to redeem perks.', type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    if (tokenBalance < price) {
      console.log('Insufficient tokens:', { need: price, have: tokenBalance });
      setNotification({ message: `❌ Not enough tokens. You need ${price} but have ${tokenBalance}.`, type: 'error' });
      setTimeout(() => setNotification(null), 3000);
      return;
    }

    try {
      setRedeeming(id);
      console.log('Calling redeemPerk function...');
      
      const success = await redeemPerk(id, price);
      console.log('redeemPerk result:', success);
      
      if (success) {
        const redeemedPerk = ALL_PERKS.find((p) => p.id === id);
        setNotification({ 
          message: `🎉 Redeemed "${redeemedPerk?.name}"! ${price} tokens deducted.`, 
          type: 'success' 
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
        console.log('Redemption successful!');
      } else {
        setNotification({ message: `❌ Redemption failed. Please try again.`, type: 'error' });
        console.log('Redemption failed - redeemPerk returned false');
      }
    } catch (error) {
      console.error('Redemption error:', error);
      setNotification({ message: `❌ An error occurred: ${error}`, type: 'error' });
    } finally {
      setRedeeming(null);
      setTimeout(() => setNotification(null), 4000);
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen px-6 py-12 flex items-center justify-center" style={{ backgroundColor: '#fff6f7' }}>
        <div className="text-center max-w-md">
          <h1 className="text-3xl font-bold text-red-700 mb-4">Login Required</h1>
          <p className="text-gray-700 mb-6">
            Please log in to view your token balance and redeem perks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-6 py-12" style={{ backgroundColor: '#fff6f7' }}>
      {showConfetti && <Confetti />}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-red-700">Redeem Your Tokens</h1>
        <p className="text-gray-700 mt-2">
          Balance: <strong>{tokenBalance}</strong> tokens
        </p>
        {userData && (
          <p className="text-sm text-gray-500">
            Welcome, {userData.username || userData.email}
          </p>
        )}
      </div>

      {notification && (
        <div className={`max-w-lg mx-auto mb-6 p-4 rounded shadow-md flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircleIcon className="w-6 text-green-500" />
            : <XCircleIcon className="w-6 text-red-500" />
          }
          <span>{notification.message}</span>
        </div>
      )}

      <div className="flex flex-wrap justify-center gap-4 mb-8">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full border font-semibold transition ${
              selectedCategory === cat
                ? 'bg-red-600 text-white'
                : 'bg-white text-red-600 hover:bg-red-50'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500">No perks in this category.</p>
        ) : (
          filtered.map((perk) => (
            <PerkCard
              key={perk.id}
              perk={perk}
              userTokens={tokenBalance}
              onRedeem={handleRedeem}
              isRedeeming={redeeming === perk.id}
            />
          ))
        )}
      </div>
    </div>
  );
};

export default RedeemPage;
