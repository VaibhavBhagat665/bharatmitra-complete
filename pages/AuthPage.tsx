import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { useUser } from '../contexts/UserContext';
import { UserProfile } from '../types';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [showResetPassword, setShowResetPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [occupation, setOccupation] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  
  const { user } = useUser();
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
    setSuccess('');
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
        console.error('Google sign-in error:', err);
        setError(err.message || 'Failed to sign in with Google');
    } finally {
        setLoading(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    if (!resetEmail) {
      setError('Please enter your email address');
      setLoading(false);
      return;
    }

    try {
      await sendPasswordResetEmail(auth, resetEmail);
      setSuccess('Password reset email sent! Check your inbox and follow the instructions.');
      setResetEmail('');
      setTimeout(() => {
        setShowResetPassword(false);
        setSuccess('');
      }, 3000);
    } catch (err: any) {
      console.error('Password reset error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else if (err.code === 'auth/invalid-email') {
        setError('Please enter a valid email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Basic validation
    if (!email || !password) {
      setError('Email and password are required');
      setLoading(false);
      return;
    }

    if (!isLogin && (!fullName || !birthday || !occupation)) {
      setError('All fields are required for registration');
      setLoading(false);
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    if (isLogin) {
        // Sign In
        try {
            await signInWithEmailAndPassword(auth, email, password);
            navigate(from, { replace: true });
        } catch (err: any) {
            console.error('Sign-in error:', err);
            if (err.code === 'auth/user-not-found') {
              setError('No account found with this email address.');
            } else if (err.code === 'auth/wrong-password') {
              setError('Incorrect password. Please try again.');
            } else if (err.code === 'auth/invalid-email') {
              setError('Please enter a valid email address.');
            } else if (err.code === 'auth/too-many-requests') {
              setError('Too many failed attempts. Please try again later.');
            } else {
              setError('Failed to sign in. Please check your credentials.');
            }
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
            setSuccess('Account created successfully! Welcome to Bharat Mitra!');
            setTimeout(() => {
              navigate(from, { replace: true });
            }, 1500);
        } catch (err: any) {
            console.error('Sign-up error:', err);
            if (err.code === 'auth/email-already-in-use') {
              setError('This email is already registered. Please sign in instead.');
            } else if (err.code === 'auth/weak-password') {
              setError('Password is too weak. Please choose a stronger password.');
            } else if (err.code === 'auth/invalid-email') {
              setError('Please enter a valid email address.');
            } else {
              setError('Failed to create an account. Please try again.');
            }
        }
    }
    setLoading(false);
  };

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const switchMode = () => {
    setIsLogin(!isLogin);
    setShowResetPassword(false);
    clearMessages();
    // Clear form fields when switching
    setEmail('');
    setPassword('');
    setFullName('');
    setBirthday('');
    setOccupation('');
  };

  // Don't render the form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-orange-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bharat-blue-600 mx-auto mb-4"></div>
          <p className="text-bharat-blue-700 font-semibold">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-orange-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 px-8 py-6 text-center">
            <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3">
              <span className="text-2xl font-bold text-bharat-blue-700">BM</span>
            </div>
            <h2 className="text-2xl font-bold text-white mb-1">
              {showResetPassword ? 'Reset Password' : (isLogin ? 'Welcome Back!' : 'Join Bharat Mitra')}
            </h2>
            <p className="text-blue-100 text-sm">
              {showResetPassword 
                ? 'Enter your email to receive reset instructions' 
                : (isLogin ? 'Sign in to continue your journey' : 'Create your account to get started')
              }
            </p>
          </div>

          <div className="px-8 py-6">
            {/* Password Reset Form */}
            {showResetPassword ? (
              <form onSubmit={handlePasswordReset} className="space-y-4">
                <div className="relative">
                  <input 
                    type="email" 
                    placeholder="Enter your email address" 
                    value={resetEmail} 
                    onChange={(e) => setResetEmail(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                  />
                </div>

                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm">
                    {success}
                  </div>
                )}

                <button 
                  type="submit" 
                  disabled={loading} 
                  className="w-full bg-bharat-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-bharat-blue-700 disabled:bg-gray-400 transition-colors flex items-center justify-center"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  ) : (
                    'Send Reset Email'
                  )}
                </button>

                <button 
                  type="button" 
                  onClick={() => {
                    setShowResetPassword(false);
                    clearMessages();
                    setResetEmail('');
                  }}
                  className="w-full text-bharat-blue-600 hover:text-bharat-blue-700 font-medium py-2 transition-colors"
                >
                  ← Back to Sign In
                </button>
              </form>
            ) : (
              /* Main Auth Form */
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Full Name" 
                          value={fullName} 
                          onChange={(e) => setFullName(e.target.value)} 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="date" 
                          value={birthday} 
                          onChange={(e) => setBirthday(e.target.value)} 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>
                      <div className="relative">
                        <input 
                          type="text" 
                          placeholder="Occupation (e.g., Student, Farmer)" 
                          value={occupation} 
                          onChange={(e) => setOccupation(e.target.value)} 
                          required 
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                        />
                      </div>
                    </>
                  )}
                  
                  <div className="relative">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      required 
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                    />
                  </div>
                  
                  <div className="relative">
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      required 
                      minLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all" 
                    />
                  </div>

                  {isLogin && (
                    <div className="text-right">
                      <button 
                        type="button"
                        onClick={() => {
                          setShowResetPassword(true);
                          clearMessages();
                        }}
                        className="text-sm text-bharat-blue-600 hover:text-bharat-blue-700 hover:underline transition-colors"
                      >
                        Forgot Password?
                      </button>
                    </div>
                  )}

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm flex items-center">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"/>
                      </svg>
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg text-sm flex items-center">
                      <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                      </svg>
                      {success}
                    </div>
                  )}

                  <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 text-white font-semibold py-3 px-4 rounded-lg hover:from-bharat-blue-700 hover:to-bharat-blue-800 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-200 flex items-center justify-center shadow-lg"
                  >
                    {loading ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    ) : (
                      <>
                        {isLogin ? 'Sign In' : 'Create Account'}
                        <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </>
                    )}
                  </button>
                </form>
                
                <div className="my-6 flex items-center">
                  <div className="flex-grow border-t border-gray-300"></div>
                  <span className="flex-shrink mx-4 text-gray-400 text-sm">OR</span>
                  <div className="flex-grow border-t border-gray-300"></div>
                </div>

                <button 
                  onClick={handleGoogleSignIn} 
                  disabled={loading} 
                  className="w-full flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-300 disabled:bg-gray-200 transition-all duration-200 shadow-sm"
                >
                  <img 
                    src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                    alt="Google logo" 
                    className="w-5 h-5 mr-3" 
                  />
                  Continue with Google
                </button>
                
                <div className="text-center mt-6 pt-4 border-t border-gray-100">
                  <p className="text-gray-600 text-sm">
                    {isLogin ? "Don't have an account?" : "Already have an account?"}
                  </p>
                  <button 
                    onClick={switchMode}
                    className="font-semibold text-bharat-blue-600 hover:text-bharat-blue-700 mt-1 transition-colors"
                  >
                    {isLogin ? 'Create Account' : 'Sign In Instead'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
        
        {/* Footer */}
        <div className="text-center mt-6 text-gray-500 text-xs">
          <p>By continuing, you agree to our Terms of Service and Privacy Policy</p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
