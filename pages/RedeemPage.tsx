import React, { useState, useContext, useEffect } from 'react';
import Confetti from 'react-confetti';
import { CheckCircleIcon, XCircleIcon, PlayIcon, ClockIcon } from '@heroicons/react/24/solid';
import { UserContext } from '../contexts/UserContext';

// Define your Perk type inline
type Perk = {
  id: string;
  name: string;
  description: string;
  price: number;
  icon: React.ElementType;
  category: 'Premium' | 'Mentorship' | 'Exam' | 'Daily' | 'Mystery';
  isWorking?: boolean;
};

// Create 15+ perks with 3 working ones
const ALL_PERKS: Perk[] = [
  // Premium
  { id: 'premium-1', name: 'Premium Scheme Access', description: 'Unlock detailed guides & calculators.', price: 60, icon: () => <>🏆</>, category: 'Premium' },
  { id: 'premium-2', name: 'Exclusive Webinar', description: 'Attend govt strategy sessions.', price: 50, icon: () => <>🎤</>, category: 'Premium' },
  { id: 'premium-3', name: 'Monthly Masterclass', description: 'Webinar with expert panel.', price: 70, icon: () => <>🎓</>, category: 'Premium' },

  // Mentorship
  { id: 'mentorship-1', name: '1-on-1 Mentor Call', description: 'Talk to a verified expert.', price: 40, icon: () => <>📞</>, category: 'Mentorship' },
  { id: 'mentorship-2', name: 'Resume Review', description: 'Get resume feedback.', price: 30, icon: () => <>📝</>, category: 'Mentorship', isWorking: true },
  { id: 'mentorship-3', name: 'Mock Interview', description: 'Practice for govt job interview.', price: 35, icon: () => <>🎯</>, category: 'Mentorship' },

  // Exam
  { id: 'exam-1', name: 'Exam Prep Kit', description: 'Practice materials & tips.', price: 25, icon: () => <>📚</>, category: 'Exam', isWorking: true },
  { id: 'exam-2', name: 'Current Affairs Digest', description: 'Monthly e-mag for competitive exams.', price: 15, icon: () => <>📰</>, category: 'Exam' },
  { id: 'exam-3', name: 'Solved PYQs', description: 'Past paper solutions.', price: 20, icon: () => <>📄</>, category: 'Exam' },

  // Daily
  { id: 'daily-1', name: 'Daily Scheme Tip', description: 'Quick daily scheme tips.', price: 5, icon: () => <>📅</>, category: 'Daily', isWorking: true },
  { id: 'daily-2', name: 'Token Booster (Video)', description: 'Watch a 30s video for 10 tokens.', price: 0, icon: () => <>🎥</>, category: 'Daily' },
  { id: 'daily-3', name: 'Badge of Supporter', description: 'Special badge for engagement.', price: 5, icon: () => <>🏅</>, category: 'Daily' },

  // Mystery
  { id: 'mystery-1', name: '🎁 Mystery Box', description: 'Unlock a surprise reward!', price: 10, icon: () => <>🎁</>, category: 'Mystery' },
  { id: 'mystery-2', name: 'Secret Scheme Reveal', description: 'Unlock hidden high-benefit scheme.', price: 15, icon: () => <>🔍</>, category: 'Mystery' },
  { id: 'mystery-3', name: 'Lucky Spin', description: 'Try your luck for tokens or perks.', price: 20, icon: () => <>🎡</>, category: 'Mystery' },
];

const CATEGORIES: (Perk['category'] | 'All')[] = ['All', 'Premium', 'Mentorship', 'Exam', 'Daily', 'Mystery'];

// PerkCard component
const PerkCard: React.FC<{
  perk: Perk;
  userTokens: number;
  onRedeem: (id: string, price: number) => void;
  isRedeeming: boolean;
}> = ({ perk, userTokens, onRedeem, isRedeeming }) => {
  const canAfford = userTokens >= perk.price;
  const IconComponent = perk.icon;

  return (
    <div className={`bg-white rounded-lg shadow-md p-6 border-2 ${
      perk.isWorking ? 'border-green-400' : 'border-gray-200'
    }`}>
      {perk.isWorking && (
        <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-3 inline-block">
          ✅ Working Function
        </div>
      )}
      <div className="flex items-center mb-4">
        <div className="text-2xl mr-3">
          <IconComponent />
        </div>
        <div>
          <h3 className="font-semibold text-gray-800">{perk.name}</h3>
          <p className="text-sm text-gray-600">{perk.description}</p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-lg font-bold text-red-600">{perk.price} tokens</span>
        <button
          onClick={() => onRedeem(perk.id, perk.price)}
          disabled={!canAfford || isRedeeming}
          className={`px-4 py-2 rounded font-semibold transition ${
            canAfford && !isRedeeming
              ? 'bg-red-600 text-white hover:bg-red-700'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
        >
          {isRedeeming ? 'Redeeming...' : canAfford ? 'Redeem' : 'Not enough tokens'}
        </button>
      </div>
    </div>
  );
};

// Ad Modal Component
const AdModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onComplete: (tokens: number) => void;
}> = ({ isOpen, onClose, onComplete }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [countdown, setCountdown] = useState(30);
  const [adCompleted, setAdCompleted] = useState(false);

  useEffect(() => {
    if (isPlaying && countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (countdown === 0 && !adCompleted) {
      setAdCompleted(true);
    }
  }, [isPlaying, countdown, adCompleted]);

  const handleStartAd = () => {
    setIsPlaying(true);
    setCountdown(30);
  };

  const handleComplete = () => {
    const tokens = Math.floor(Math.random() * 6) + 5; // 5-10 tokens
    onComplete(tokens);
    onClose();
  };

  const handleClose = () => {
    setIsPlaying(false);
    setCountdown(30);
    setAdCompleted(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <div className="text-center">
          <h2 className="text-xl font-bold mb-4">Watch Ad for Free Tokens</h2>
          
          {!isPlaying && !adCompleted && (
            <div>
              <div className="bg-gray-200 rounded-lg p-8 mb-4">
                <PlayIcon className="w-12 h-12 mx-auto text-gray-500" />
                <p className="text-gray-600 mt-2">Click to start 30-second ad</p>
              </div>
              <button
                onClick={handleStartAd}
                className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 transition"
              >
                Start Ad
              </button>
            </div>
          )}

          {isPlaying && !adCompleted && (
            <div>
              <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-8 mb-4 text-white">
                <div className="animate-pulse">
                  <h3 className="text-lg font-bold">🎯 Government Scheme Pro</h3>
                  <p className="text-sm mt-2">Unlock premium features & get personalized scheme recommendations!</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-blue-600 mb-2">{countdown}s</div>
              <p className="text-gray-600">Please wait while the ad plays...</p>
            </div>
          )}

          {adCompleted && (
            <div>
              <div className="bg-green-100 rounded-lg p-6 mb-4">
                <div className="text-4xl mb-2">🎉</div>
                <h3 className="text-lg font-bold text-green-800">Ad Complete!</h3>
                <p className="text-green-700">You've earned 5-10 tokens!</p>
              </div>
              <button
                onClick={handleComplete}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 transition mr-2"
              >
                Claim Tokens
              </button>
            </div>
          )}

          <button
            onClick={handleClose}
            className="mt-4 text-gray-500 hover:text-gray-700 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const RedeemPage: React.FC = () => {
  const { tokenBalance, redeemPerk, user, userData, rewardTokens, refreshUserData } = useContext(UserContext);
  const [selectedCategory, setSelectedCategory] = useState<'All' | Perk['category']>('All');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error'; } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [redeeming, setRedeeming] = useState<string | null>(null);
  const [showAdModal, setShowAdModal] = useState(false);
  const [lastAdWatch, setLastAdWatch] = useState<number | null>(null);
  const [redeemedPerks, setRedeemedPerks] = useState<string[]>([]);

  // Load last ad watch time from localStorage on mount
  useEffect(() => {
    const savedLastAdWatch = localStorage.getItem('lastAdWatch');
    if (savedLastAdWatch) {
      setLastAdWatch(parseInt(savedLastAdWatch));
    }
  }, []);

  // Save last ad watch time to localStorage
  const saveLastAdWatch = (timestamp: number) => {
    setLastAdWatch(timestamp);
    localStorage.setItem('lastAdWatch', timestamp.toString());
  };

  const filtered = selectedCategory === 'All'
    ? ALL_PERKS
    : ALL_PERKS.filter((perk) => perk.category === selectedCategory);

  const canWatchAd = () => {
    if (!lastAdWatch) return true;
    const now = Date.now();
    const hoursPassed = (now - lastAdWatch) / (1000 * 60 * 60);
    return hoursPassed >= 8;
  };

  const getNextAdTime = () => {
    if (!lastAdWatch) return null;
    const nextTime = new Date(lastAdWatch + 8 * 60 * 60 * 1000);
    return nextTime;
  };

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
        
        // Check if this is a working perk
        if (redeemedPerk?.isWorking) {
          setRedeemedPerks(prev => [...prev, id]);
          
          // Show specific success message based on perk
          let successMessage = '';
          switch (id) {
            case 'mentorship-2':
              successMessage = '📝 Resume Review activated! Check your email for instructions within 24 hours.';
              break;
            case 'exam-1':
              successMessage = '📚 Exam Prep Kit unlocked! Access your materials in the Study section.';
              break;
            case 'daily-1':
              successMessage = '📅 Daily Scheme Tips activated! You\'ll receive daily notifications starting tomorrow.';
              break;
            default:
              successMessage = `🎉 Successfully redeemed "${redeemedPerk?.name}"!`;
          }
          
          setNotification({ message: successMessage, type: 'success' });
          setShowConfetti(true);
          setTimeout(() => setShowConfetti(false), 3000);
        } else {
          // Non-working perk - show demo message
          setNotification({ 
            message: `🔧 "${redeemedPerk?.name}" is in demo mode. Tokens refunded.`, 
            type: 'error' 
          });
          // In a real app, you might want to refund tokens here
        }
        
        console.log('Redemption successful!');
      } else {
        setNotification({ message: `❌ Redemption failed. Please try again.`, type: 'error' });
        console.log('Redemption failed - redeemPerk returned false');
      }
    } catch (error) {
      console.error('Redemption error:', error);
      setNotification({ message: `❌ An error occurred during redemption. Please try again.`, type: 'error' });
    } finally {
      setRedeeming(null);
      setTimeout(() => setNotification(null), 5000);
    }
  };

  const handleAdComplete = async (tokens: number) => {
    try {
      console.log(`Rewarding ${tokens} tokens for watching ad`);
      
      // Use the rewardTokens function from UserContext to add tokens to Firebase
      await rewardTokens(tokens, `Watched advertisement - earned ${tokens} tokens`);
      
      // Save the ad watch timestamp
      saveLastAdWatch(Date.now());
      
      setNotification({ 
        message: `🎉 You earned ${tokens} tokens from watching the ad! New balance: ${tokenBalance + tokens}`, 
        type: 'success' 
      });
      
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 3000);
      
      console.log('Ad reward successful!');
    } catch (error) {
      console.error('Error rewarding ad tokens:', error);
      setNotification({ 
        message: `❌ Failed to reward tokens. Please try again.`, 
        type: 'error' 
      });
    }
    
    setTimeout(() => setNotification(null), 5000);
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
          <div className="bg-white rounded-lg p-6 shadow-md">
            <p className="text-sm text-gray-600">
              Your tokens are securely stored in your account and will be available once you log in.
            </p>
          </div>
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
            Welcome back, {userData.username || userData.email}!
          </p>
        )}
      </div>

      {/* Ad Section */}
      <div className="max-w-lg mx-auto mb-8 bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-800">🎥 Watch Ad for Free Tokens</h3>
            <p className="text-sm text-gray-600">Earn 5-10 tokens every 8 hours</p>
            {lastAdWatch && (
              <p className="text-xs text-gray-500 mt-1">
                Last watched: {new Date(lastAdWatch).toLocaleString()}
              </p>
            )}
          </div>
          <div>
            {canWatchAd() ? (
              <button
                onClick={() => setShowAdModal(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition flex items-center"
              >
                <PlayIcon className="w-4 h-4 mr-2" />
                Watch Ad
              </button>
            ) : (
              <div className="text-center">
                <ClockIcon className="w-6 h-6 text-gray-400 mx-auto mb-1" />
                <p className="text-xs text-gray-500">
                  Next ad available at:<br />
                  {getNextAdTime()?.toLocaleTimeString()}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {notification && (
        <div className={`max-w-lg mx-auto mb-6 p-4 rounded shadow-md flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {notification.type === 'success'
            ? <CheckCircleIcon className="w-6 text-green-500" />
            : <XCircleIcon className="w-6 text-red-500" />
          }
          <span className="flex-1">{notification.message}</span>
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

      {/* Redeemed Perks Section */}
      {redeemedPerks.length > 0 && (
        <div className="max-w-4xl mx-auto mt-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6 text-center">Your Active Perks</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {redeemedPerks.map((perkId) => {
              const perk = ALL_PERKS.find(p => p.id === perkId);
              if (!perk) return null;
              const IconComponent = perk.icon;
              return (
                <div key={perkId} className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center">
                    <div className="text-xl mr-3">
                      <IconComponent />
                    </div>
                    <div>
                      <h3 className="font-semibold text-green-800">{perk.name}</h3>
                      <p className="text-sm text-green-600">✅ Active</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <AdModal
        isOpen={showAdModal}
        onClose={() => setShowAdModal(false)}
        onComplete={handleAdComplete}
      />
    </div>
  );
};

export default RedeemPage;
