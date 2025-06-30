import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { UserContext } from '../contexts/UserContext';
import { UserProfile } from '../types';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [occupation, setOccupation] = useState('');
  
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  // Handle redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  const handleGoogleSignIn = async () => {
    setError('');
    setLoading(true);
    try {
        const result = await signInWithPopup(auth, googleProvider);
        const user = result.user;
        const additionalInfo = getAdditionalUserInfo(result);

        // Check if it's a new user
        if (additionalInfo?.isNewUser) {
            const userRef = doc(db, 'users', user.uid);
            const newUserProfile: UserProfile = {
                uid: user.uid,
                username: user.displayName || 'New User',
                email: user.email || '',
                birthday: '', // to be filled by user
                occupation: '', // to be filled by user
                joined_at: serverTimestamp(),
                auth_provider: 'google',
                bharat_tokens: 50, // Welcome bonus
                scheme_history: [],
            };
            await setDoc(userRef, newUserProfile);
             // Redirect to account page to complete profile
            navigate('/account');
        } else {
            navigate(from, { replace: true });
        }
    } catch (err: any) {
        setError(err.message);
    } finally {
        setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (isLogin) {
        // Sign In
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError('Failed to sign in. Please check your credentials.');
        }
    } else {
        // Sign Up
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const user = userCredential.user;
            
            const userRef = doc(db, 'users', user.uid);
            const newUserProfile: UserProfile = {
                uid: user.uid,
                username: fullName,
                email: email,
                birthday: birthday,
                occupation: occupation,
                joined_at: serverTimestamp(),
                auth_provider: 'email',
                bharat_tokens: 50, // Welcome bonus
                scheme_history: [],
            };
            await setDoc(userRef, newUserProfile);
            navigate(from, { replace: true });
        } catch (err: any) {
            setError('Failed to create an account. The email might already be in use.');
        }
    }
    setLoading(false);
  }

  // Don't render the form if user is already logged in
  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className="max-w-md mx-auto mt-10">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-8">
            <h2 className="text-3xl font-bold text-center text-bharat-blue-900 mb-2">
                {isLogin ? 'Welcome Back!' : 'Create Your Account'}
            </h2>
            <p className="text-center text-gray-500 mb-6">
                {isLogin ? 'Sign in to continue your journey.' : 'Join Bharat Mitra to get started.'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                     <>
                        <input type="text" placeholder="Full Name" value={fullName} onChange={e => setFullName(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
                        <input type="date" placeholder="Birthday" value={birthday} onChange={e => setBirthday(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
                        <input type="text" placeholder="Occupation (e.g., Student, Farmer)" value={occupation} onChange={e => setOccupation(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
                     </>
                )}
                <input type="email" placeholder="Email Address" value={email} onChange={e => setEmail(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />
                <input type="password" placeholder="Password" value={password} onChange={e => setPassword(e.target.value)} required className="w-full px-4 py-2 border rounded-md" />

                {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                <button type="submit" disabled={loading} className="w-full bg-bharat-blue-700 text-white font-bold py-3 px-4 rounded-md hover:bg-bharat-blue-800 disabled:bg-gray-400 transition-colors">
                    {loading ? 'Processing...' : (isLogin ? 'Sign In' : 'Create Account')}
                </button>
            </form>
            
            <div className="my-6 flex items-center">
                <div className="flex-grow border-t border-gray-300"></div>
                <span className="flex-shrink mx-4 text-gray-400">OR</span>
                <div className="flex-grow border-t border-gray-300"></div>
            </div>

            <button onClick={handleGoogleSignIn} disabled={loading} className="w-full flex items-center justify-center bg-white border border-gray-300 text-gray-700 font-bold py-3 px-4 rounded-md hover:bg-gray-50 disabled:bg-gray-200 transition-colors">
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google logo" className="w-5 h-5 mr-3" />
                Sign In with Google
            </button>
            
            <p className="text-center text-sm text-gray-600 mt-6">
                {isLogin ? "Don't have an account?" : "Already have an account?"}
                <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="font-semibold text-bharat-blue-700 hover:underline ml-1">
                    {isLogin ? 'Sign Up' : 'Sign In'}
                </button>
            </p>
        </div>
    </div>
  );
};

export default AuthPage;