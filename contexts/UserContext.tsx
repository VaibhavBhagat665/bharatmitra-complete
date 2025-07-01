import React, { createContext, useState, ReactNode, useEffect, useRef } from 'react';
import { User, onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { UserProfile, SchemeHistoryEntry } from '../types';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

// The base URL for your backend server
const API_BASE_URL = 'https://bharat-mitra-backend.railway.com';

interface UserContextType {
  user: User | null;
  userData: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  rewardTokens: (amount: number, reason: string) => Promise<void>;
  redeemPerk: (perkId: string, price: number) => Promise<boolean>;
  addSchemeToHistory: (scholarshipId: string, scholarshipName: string) => Promise<void>;
  updateUserProfile: (data: { username: string; birthday: string; occupation: string }) => Promise<void>;
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
  logout: async () => {},
  rewardTokens: async () => {},
  redeemPerk: async () => false,
  addSchemeToHistory: async () => {},
  updateUserProfile: async () => {},
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
  const idTokenRef = useRef<string | null>(null);

  const [language, setLanguage] = useState<'en' | 'hi'>('en');
  const { isPlaying, isPaused, activeMessageId, togglePlayPause, cancel } = useTextToSpeech();

  const getAuthToken = async (): Promise<string | null> => {
    if (auth.currentUser) {
      const token = await auth.currentUser.getIdToken(true);
      idTokenRef.current = token;
      return token;
    }
    return null;
  };
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setLoading(true);
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const token = await firebaseUser.getIdToken();
          idTokenRef.current = token;

          const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
            headers: { Authorization: `Bearer ${token}` },
          });

          if (response.status === 404) {
             // User exists in Auth, but not in Firestore. Create profile.
             // This happens for new sign-ups.
             const isNewUser = firebaseUser.metadata.creationTime === firebaseUser.metadata.lastSignInTime;
             if (isNewUser) {
                console.log("New user detected, creating profile...");
                const userRef = doc(db, 'users', firebaseUser.uid);
                const newUserProfile: Omit<UserProfile, 'joined_at' | 'last_login' | 'scheme_history' | 'hash'> = {
                    uid: firebaseUser.uid,
                    username: firebaseUser.displayName || 'New User',
                    email: firebaseUser.email || '',
                    birthday: '',
                    occupation: '',
                    auth_provider: firebaseUser.providerData[0].providerId.includes('google') ? 'google' : 'email',
                    bharat_tokens: 50, // Welcome bonus
                };
                
                // We use the client SDK here just for the initial write.
                await setDoc(userRef, {
                    ...newUserProfile,
                    joined_at: serverTimestamp(),
                    last_login: serverTimestamp(),
                    scheme_history: [],
                });
                
                // Re-fetch the newly created profile from the backend
                const secondAttempt = await fetch(`${API_BASE_URL}/api/user-profile`, {
                  headers: { Authorization: `Bearer ${token}` },
                });
                if(!secondAttempt.ok) throw new Error('Failed to fetch newly created profile');
                const profileData = await secondAttempt.json();
                setUserData(profileData);

             }
          } else if (response.ok) {
            const profileData = await response.json();
            setUserData(profileData);
          } else {
            throw new Error(`Failed to fetch user profile: ${response.statusText}`);
          }
        } catch (error) {
          console.error("Error during user setup:", error);
          await logout();
        }
      } else {
        setUser(null);
        setUserData(null);
        idTokenRef.current = null;
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setUserData(null);
    idTokenRef.current = null;
  };

  const updateUserProfile = async (data: { username: string; birthday: string; occupation: string }) => {
    const token = await getAuthToken();
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/user-profile`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(data),
    });

    if (response.ok) {
        const updatedProfile = await response.json();
        setUserData(updatedProfile);
    } else {
        throw new Error('Failed to update profile');
    }
  };
  
  const addSchemeToHistory = async (scholarshipId: string, scholarshipName: string) => {
    const token = await getAuthToken();
    if (!token) return;

    const response = await fetch(`${API_BASE_URL}/api/apply-scheme`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ scholarshipId, scholarshipName }),
    });

    if (response.ok) {
        const updatedProfile = await response.json();
        setUserData(updatedProfile);
    } else {
        throw new Error('Failed to apply for scheme');
    }
  };

  const rewardTokens = async (amount: number, reason: string) => {
    const token = await getAuthToken();
    if (!token) return;
    
    const response = await fetch(`${API_BASE_URL}/api/reward-tokens`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ amount, reason }),
    });

    if(response.ok) {
        const { newTotal } = await response.json();
        setUserData(prev => prev ? { ...prev, bharat_tokens: newTotal } : null);
    }
  };

  const redeemPerk = async (perkId: string, price: number): Promise<boolean> => {
     const token = await getAuthToken();
     if (!token || !userData || userData.bharat_tokens < price) return false;

     const response = await fetch(`${API_BASE_URL}/api/redeem-perk`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ perkId, price }),
    });
    
    if (response.ok) {
        const { newTotal } = await response.json();
        setUserData(prev => prev ? { ...prev, bharat_tokens: newTotal } : null);
        return true;
    }
    return false;
  };

  const value = {
    user,
    userData,
    loading,
    logout,
    updateUserProfile,
    addSchemeToHistory,
    rewardTokens,
    redeemPerk,
    language,
    setLanguage,
    ttsIsPlaying: isPlaying && !isPaused,
    ttsActiveMessageId: activeMessageId,
    togglePlayPause,
    cancelTts: cancel,
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};
