import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc, updateDoc, arrayUnion, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, SchemeHistoryEntry } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface UserContextType {
  user: User | null;
  userData: UserProfile | null;
  loading: boolean;
  authError: string | null;
  logout: () => Promise<void>;
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
}

export const UserContext = createContext<UserContextType>({
  user: null,
  userData: null,
  loading: true,
  authError: null,
  logout: async () => {},
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
  
  const { isPlaying, isPaused, activeMessageId, togglePlayPause, cancel } = useTextToSpeech();

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
          bharat_tokens: data.bharat_tokens,
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
          
          console.log('User authenticated successfully:', firebaseUser.uid);
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
      
      console.log(`Rewarded ${amount} tokens for: ${reason}`);
    } catch (error) {
      console.error('Error rewarding tokens:', error);
      throw error;
    }
  };

  const redeemPerk = async (perkId: string, price: number): Promise<boolean> => {
    if (!user || !userData) {
      throw new Error('User not authenticated');
    }

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
      
      console.log(`Redeemed perk ${perkId} for ${price} tokens`);
      return true;
    } catch (error) {
      console.error('Error redeeming perk:', error);
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
    rewardTokens,
    redeemPerk,
    refreshUserData,
    language,
    setLanguage,
    ttsIsPlaying: isPlaying && !isPaused,
    ttsActiveMessageId: activeMessageId,
    togglePlayPause,
    cancelTts: cancel,
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
