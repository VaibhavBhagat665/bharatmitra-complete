import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp, collection, query, orderBy, limit, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, SchemeHistoryEntry } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface LeaderboardUser {
  uid: string;
  username: string;
  email: string;
  occupation?: string;
  bharat_tokens: number;
  badge?: string;
  avatar?: string;
  weeklyTokens?: number;
}

interface UserContextType {
  user: User | null;
  userData: UserProfile | null;
  loading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
  addTokens: (amount: number) => Promise<void>;
  rewardTokens: (amount: number, reason: string) => Promise<void>;
  redeemPerk: (perkId: string, price: number) => Promise<boolean>;
  addSchemeToHistory: (schemeId: string, schemeName: string) => Promise<void>;
  updateUserProfile: (data: { username: string; birthday: string; occupation: string }) => Promise<void>;
  refreshUserData: () => Promise<void>;
  language: 'en' | 'hi';
  setLanguage: React.Dispatch<React.SetStateAction<'en' | 'hi'>>;
  ttsIsPlaying: boolean;
  ttsActiveMessageId: string | null;
  togglePlayPause: (text: string, messageId: string, lang: 'en' | 'hi') => void;
  cancelTts: () => void;
  // For compatibility with RedeemPage
  tokenBalance: number;
  deductTokens: (amount: number) => boolean;
  // Leaderboard data
  leaderboardData: LeaderboardUser[];
  userRank: number | null;
  userBadge: string;
  getUserProgress: () => { level: number; tokensToNextLevel: number };
  refreshLeaderboard: () => Promise<void>;
}

export const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  authError: null,
  logout: async () => {},
  addTokens: async () => {},
  rewardTokens: async () => {},
  redeemPerk: async () => false,
  addSchemeToHistory: async () => {},
  updateUserProfile: async () => {},
  refreshUserData: async () => {},
  language: 'en',
  setLanguage: () => {},
  ttsIsPlaying: false,
  ttsActiveMessageId: null,
  togglePlayPause: () => {},
  cancelTts: () => {},
  tokenBalance: 0,
  deductTokens: () => false,
  leaderboardData: [],
  userRank: null,
  userBadge: 'Explorer',
  getUserProgress: () => ({ level: 1, tokensToNextLevel: 100 }),
  refreshLeaderboard: async () => {},
});

interface UserProviderProps {
  children: ReactNode;
}

export const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardUser[]>([]);
  const [leaderboardLoading, setLeaderboardLoading] = useState(false);
  
  const { isPlaying, isPaused, activeMessageId, togglePlayPause, cancel } = useTextToSpeech();

  // Function to determine badge based on tokens
  const getBadgeForTokens = (tokens: number): string => {
    if (tokens >= 1000) return 'Champion';
    if (tokens >= 500) return 'Expert';
    if (tokens >= 250) return 'Scholar';
    if (tokens >= 100) return 'Learner';
    return 'Explorer';
  };

  // Function to get user progress
  const getUserProgress = () => {
    if (!userData) return { level: 1, tokensToNextLevel: 100 };
    
    const tokens = userData.bharat_tokens;
    const level = Math.floor(tokens / 100) + 1;
    const tokensToNextLevel = 100 - (tokens % 100);
    
    return { level, tokensToNextLevel };
  };

  // Function to fetch leaderboard data
  const fetchLeaderboardData = async (): Promise<LeaderboardUser[]> => {
    try {
      console.log('Fetching leaderboard data...');
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('bharat_tokens', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      
      const leaderboard: LeaderboardUser[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        // Only include users with valid data
        if (data.uid && data.username && data.bharat_tokens !== undefined) {
          leaderboard.push({
            uid: data.uid,
            username: data.username,
            email: data.email || '',
            occupation: data.occupation || '',
            bharat_tokens: data.bharat_tokens || 0,
            badge: getBadgeForTokens(data.bharat_tokens || 0),
            avatar: data.avatar,
            weeklyTokens: data.weeklyTokens || 0,
          });
        }
      });
      
      console.log(`Fetched ${leaderboard.length} users for leaderboard`);
      return leaderboard;
    } catch (error) {
      console.error('Error fetching leaderboard data:', error);
      return [];
    }
  };

  const refreshLeaderboard = async () => {
    if (leaderboardLoading) return; // Prevent multiple simultaneous requests
    
    setLeaderboardLoading(true);
    try {
      const data = await fetchLeaderboardData();
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error refreshing leaderboard:', error);
      throw error; // Re-throw to handle in components
    } finally {
      setLeaderboardLoading(false);
    }
  };

  // Calculate user rank
  const getUserRank = (): number | null => {
    if (!userData || leaderboardData.length === 0) return null;
    
    const userIndex = leaderboardData.findIndex(u => u.uid === userData.uid);
    return userIndex >= 0 ? userIndex + 1 : null;
  };

  const fetchUserData = async (uid: string): Promise<UserProfile | null> => {
    try {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        const data = userSnap.data();
        return {
          uid: data.uid,
          username: data.username,
          email: data.email,
          birthday: data.birthday,
          occupation: data.occupation,
          joined_at: data.joined_at,
          auth_provider: data.auth_provider,
          bharat_tokens: data.bharat_tokens || 0,
          scheme_history: data.scheme_history || [],
        };
      }
      return null;
    } catch (error) {
      console.error('Error fetching user data:', error);
      return null;
    }
  };

  const refreshUserData = async () => {
    if (!user) return;
    
    try {
      const profileData = await fetchUserData(user.uid);
      setUserData(profileData);
      console.log('User data refreshed. Token balance:', profileData?.bharat_tokens);
    } catch (error) {
      console.error('Error refreshing user data:', error);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      setAuthError(null);
      
      if (firebaseUser) {
        try {
          await firebaseUser.getIdToken(true); 
          
          setUser(firebaseUser);
          
          const profileData = await fetchUserData(firebaseUser.uid);
          setUserData(profileData);
          
          // Fetch leaderboard data after user authentication
          await refreshLeaderboard();
          
          console.log('User authenticated successfully:', firebaseUser.uid);
          console.log('Current token balance:', profileData?.bharat_tokens);
        } catch (error: any) {
          console.error('Authentication error:', error);
          setAuthError(error.message || 'Authentication failed');
          
          if (error.code === 'auth/invalid-user-token' || 
              error.code === 'auth/user-token-expired' ||
              error.code === 'auth/user-disabled') {
            try {
              await signOut(auth);
            } catch (signOutError) {
              console.error('Error signing out after auth error:', signOutError);
            }
          }
          
          setUser(null);
          setUserData(null);
        }
      } else {
        setUser(null);
        setUserData(null);
        setLeaderboardData([]);
        console.log('User signed out or not authenticated');
      }
      
      setLoading(false);
    }, (error) => {
      console.error('Auth state change error:', error);
      setAuthError(error.message || 'Authentication state error');
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) return;

    const refreshInterval = setInterval(async () => {
      try {
        if (user) {
          await user.getIdToken(true); 
          console.log('Token refreshed successfully');
        }
      } catch (error) {
        console.error('Token refresh failed:', error);
      }
    }, 30 * 60 * 1000); 

    return () => clearInterval(refreshInterval);
  }, [user]);

  useEffect(() => {
    const handleOnline = () => {
      console.log('Network back online');
      if (user) {
        refreshUserData();
        refreshLeaderboard();
      }
    };

    const handleOffline = () => {
      console.log('Network offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [user]);

  const logout = async () => {
    try {
      await signOut(auth);
      setUser(null);
      setUserData(null);
      setLeaderboardData([]);
      setAuthError(null);
      console.log('User logged out successfully');
    } catch (error: any) {
      console.error('Error signing out:', error);
      setAuthError(error.message || 'Logout failed');
      throw error;
    }
  };

  const updateUserProfile = async (data: { username: string; birthday: string; occupation: string }) => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        username: data.username,
        birthday: data.birthday,
        occupation: data.occupation,
      });

      setUserData(prev => prev ? { ...prev, ...data } : null);
      
      // Refresh leaderboard to reflect changes
      await refreshLeaderboard();
      
      console.log('User profile updated successfully');
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const addSchemeToHistory = async (schemeId: string, schemeName: string) => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const newSchemeEntry: SchemeHistoryEntry = {
        scheme_id: schemeId,
        scheme_name: schemeName,
        applied_on: new Date().toISOString(),
        status: 'applied',
        hash: generateSchemeHash(schemeId, schemeName, user.uid),
      };

      await updateDoc(userRef, {
        scheme_history: arrayUnion(newSchemeEntry),
      });

      setUserData(prev => prev ? {
        ...prev,
        scheme_history: [...prev.scheme_history, newSchemeEntry]
      } : null);
      
      console.log('Scheme added to history successfully');
    } catch (error) {
      console.error('Error adding scheme to history:', error);
      throw error;
    }
  };

  const addTokens = async (amount: number) => {
    await rewardTokens(amount, 'Voice chat interaction');
  };

  const rewardTokens = async (amount: number, reason: string) => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const newTokenAmount = userData.bharat_tokens + amount;
      
      await updateDoc(userRef, {
        bharat_tokens: newTokenAmount,
      });

      setUserData(prev => prev ? { ...prev, bharat_tokens: newTokenAmount } : null);
      
      // Refresh leaderboard after token change
      await refreshLeaderboard();
      
      console.log(`Rewarded ${amount} tokens for: ${reason}. New balance: ${newTokenAmount}`);
    } catch (error) {
      console.error('Error rewarding tokens:', error);
      throw error;
    }
  };

  const redeemPerk = async (perkId: string, price: number): Promise<boolean> => {
    if (!user || !userData) {
      console.error('User not authenticated');
      return false;
    }

    console.log(`Attempting to redeem perk ${perkId} for ${price} tokens`);
    console.log(`Current token balance: ${userData.bharat_tokens}`);

    if (userData.bharat_tokens < price) {
      console.warn('Insufficient tokens for perk redemption');
      return false;
    }

    try {
      const userRef = doc(db, 'users', user.uid);
      const newTokenAmount = userData.bharat_tokens - price;
      
      await updateDoc(userRef, {
        bharat_tokens: newTokenAmount,
      });

      setUserData(prev => prev ? { ...prev, bharat_tokens: newTokenAmount } : null);
      
      // Refresh leaderboard after token change
      await refreshLeaderboard();
      
      console.log(`Successfully redeemed perk ${perkId} for ${price} tokens. New balance: ${newTokenAmount}`);
      return true;
    } catch (error) {
      console.error('Error redeeming perk:', error);
      return false;
    }
  };

  const deductTokens = (amount: number): boolean => {
    if (!user || !userData) {
      console.error('User not authenticated for token deduction');
      return false;
    }

    console.log(`Checking if can deduct ${amount} tokens from balance ${userData.bharat_tokens}`);
    
    if (userData.bharat_tokens >= amount) {
      return true;
    } else {
      console.warn(`Insufficient tokens: need ${amount}, have ${userData.bharat_tokens}`);
      return false;
    }
  };

  const generateSchemeHash = (schemeId: string, schemeName: string, uid: string): string => {
    const data = `${schemeId}-${schemeName}-${uid}-${Date.now()}`;
    let hash = 0;
    for (let i = 0; i < data.length; i++) {
      const char = data.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; 
    }
    return Math.abs(hash).toString(16);
  };

  const value = {
    user,
    userData,
    loading,
    authError,
    logout,
    updateUserProfile,
    addSchemeToHistory,
    addTokens,
    rewardTokens,
    redeemPerk,
    refreshUserData,
    language,
    setLanguage,
    ttsIsPlaying: isPlaying && !isPaused,
    ttsActiveMessageId: activeMessageId,
    togglePlayPause,
    cancelTts: cancel,
    tokenBalance: userData?.bharat_tokens || 0,
    deductTokens,
    leaderboardData,
    userRank: getUserRank(),
    userBadge: userData ? getBadgeForTokens(userData.bharat_tokens) : 'Explorer',
    getUserProgress,
    refreshLeaderboard,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export const useUser = () => {
  const context = React.useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
