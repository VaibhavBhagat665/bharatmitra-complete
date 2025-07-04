import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  getAdditionalUserInfo,
  sendEmailVerification,
  sendPasswordResetEmail
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../firebase/config';
import { useUser } from '../contexts/UserContext';
import { UserProfile } from '../types';

const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [emailForReset, setEmailForReset] = useState('');
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [birthday, setBirthday] = useState('');
  const [occupation, setOccupation] = useState('');
  
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

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess('');
        setError('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  const sendLoginNotificationEmail = async (userEmail: string, userName: string) => {
    // Note: This would require a backend service or Firebase Functions
    // For demonstration, we'll just log it
    console.log(`Login notification email would be sent to: ${userEmail}`);
    
    // In a real implementation, you'd call a Firebase Function or backend API:
    // await functions().httpsCallable('sendLoginNotification')({
    //   email: userEmail,
    //   name: userName,
    //   loginTime: new Date().toISOString()
    // });
  };

  const handleGoogleSignIn = async () => {
    setError('');
    setSuccess('');
    setLoading(true);
    
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;
      
      // Check if user exists in database
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        // User exists, sign them in
        setSuccess('Successfully signed in with Google!');
        await sendLoginNotificationEmail(user.email!, user.displayName || 'User');
        navigate(from, { replace: true });
      } else {
        // User doesn't exist, sign them out and prompt to create account
        await auth.signOut();
        setError('Account not found. Please create an account first.');
        setIsLogin(false); // Switch to sign up mode
        setEmail(user.email || '');
        setFullName(user.displayName || '');
      }
    } catch (err: any) {
      console.error('Google sign-in error:', err);
      setError(err.message || 'Failed to sign in with Google');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!emailForReset) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, emailForReset);
      setSuccess('Password reset email sent! Check your inbox.');
      setShowForgotPassword(false);
      setEmailForReset('');
    } catch (err: any) {
      setError('Failed to send password reset email. Please check your email address.');
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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        if (!user.emailVerified) {
          setError('Please verify your email before signing in. Check your inbox for the verification link.');
          setLoading(false);
          return;
        }
        
        setSuccess('Successfully signed in!');
        await sendLoginNotificationEmail(user.email!, user.displayName || 'User');
        navigate(from, { replace: true });
      } catch (err: any) {
        console.error('Sign-in error:', err);
        if (err.code === 'auth/user-not-found') {
          setError('No account found with this email. Please create an account first.');
        } else if (err.code === 'auth/wrong-password') {
          setError('Incorrect password. Please try again.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address format.');
        } else {
          setError('Failed to sign in. Please check your credentials.');
        }
      }
    } else {
      // Sign Up
      try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;
        
        // Send email verification
        await sendEmailVerification(user);
        
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
        
        // Sign out the user until they verify their email
        await auth.signOut();
        
        setSuccess('Account created successfully! Please check your email and verify your account before signing in.');
        setIsLogin(true); // Switch to sign in mode
        
        // Clear form fields
        setEmail('');
        setPassword('');
        setFullName('');
        setBirthday('');
        setOccupation('');
        
      } catch (err: any) {
        console.error('Sign-up error:', err);
        if (err.code === 'auth/email-already-in-use') {
          setError('This email is already registered. Please sign in instead.');
        } else if (err.code === 'auth/weak-password') {
          setError('Password is too weak. Please choose a stronger password.');
        } else if (err.code === 'auth/invalid-email') {
          setError('Invalid email address format.');
        } else {
          setError('Failed to create an account. Please try again.');
        }
      }
    }
    setLoading(false);
  };

  // Don't render the form if user is already logged in
  if (user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-bharat-blue-50 to-bharat-orange-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-xl shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-bharat-blue-600 mx-auto mb-4"></div>
          <p className="text-bharat-blue-700 font-semibold">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-bharat-blue-50 to-bharat-orange-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-8 backdrop-blur-sm">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-bharat-blue-600 to-bharat-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-bharat-blue-900 mb-2">
              {isLogin ? 'Welcome Back!' : 'Join Bharat Mitra'}
            </h2>
            <p className="text-gray-600">
              {isLogin ? 'Sign in to continue your journey' : 'Create your account to get started'}
            </p>
          </div>

          {/* Success/Error Messages */}
          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 text-sm text-center font-medium">{success}</p>
            </div>
          )}
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-800 text-sm text-center font-medium">{error}</p>
            </div>
          )}

          {/* Forgot Password Modal */}
          {showForgotPassword && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-3">Reset Password</h3>
              <input
                type="email"
                placeholder="Enter your email address"
                value={emailForReset}
                onChange={(e) => setEmailForReset(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 mb-3"
              />
              <div className="flex space-x-2">
                <button
                  onClick={handleForgotPassword}
                  disabled={loading}
                  className="flex-1 bg-bharat-blue-600 text-white py-2 px-4 rounded-lg hover:bg-bharat-blue-700 disabled:bg-gray-400 transition-colors text-sm"
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
                <button
                  onClick={() => setShowForgotPassword(false)}
                  className="flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-400 transition-colors text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Google Sign In Button */}
          <button 
            onClick={handleGoogleSignIn} 
            disabled={loading} 
            className="w-full flex items-center justify-center bg-white border-2 border-gray-300 text-gray-700 font-semibold py-3 px-4 rounded-lg hover:bg-gray-50 hover:border-gray-400 disabled:bg-gray-200 transition-all duration-200 mb-6 shadow-sm"
          >
            <img 
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
              alt="Google logo" 
              className="w-5 h-5 mr-3" 
            />
            {loading ? 'Processing...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 text-sm">or</span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your full name" 
                    value={fullName} 
                    onChange={e => setFullName(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Birthday</label>
                  <input 
                    type="date" 
                    value={birthday} 
                    onChange={e => setBirthday(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Occupation</label>
                  <input 
                    type="text" 
                    placeholder="e.g., Student, Farmer, Engineer" 
                    value={occupation} 
                    onChange={e => setOccupation(e.target.value)} 
                    required 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all duration-200" 
                  />
                </div>
              </>
            )}
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
              <input 
                type="email" 
                placeholder="Enter your email address" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                required 
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input 
                type="password" 
                placeholder="Enter your password" 
                value={password} 
                onChange={e => setPassword(e.target.value)} 
                required 
                minLength={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-bharat-blue-500 focus:border-transparent transition-all duration-200" 
              />
            </div>

            {/* Forgot Password Link */}
            {isLogin && (
              <div className="text-right">
                <button 
                  type="button"
                  onClick={() => setShowForgotPassword(true)}
                  className="text-sm text-bharat-blue-600 hover:text-bharat-blue-800 hover:underline"
                >
                  Forgot your password?
                </button>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className="w-full bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 text-white font-bold py-3 px-4 rounded-lg hover:from-bharat-blue-700 hover:to-bharat-blue-800 disabled:from-gray-400 disabled:to-gray-500 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5"
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </form>
          
          {/* Switch between Login/Register */}
          <div className="text-center mt-6 pt-4 border-t border-gray-200">
            <p className="text-gray-600">
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </p>
            <button 
              onClick={() => { 
                setIsLogin(!isLogin); 
                setError('');
                setSuccess('');
                setShowForgotPassword(false);
                // Clear form fields when switching
                setEmail('');
                setPassword('');
                setFullName('');
                setBirthday('');
                setOccupation('');
              }} 
              className="font-semibold text-bharat-blue-600 hover:text-bharat-blue-800 hover:underline mt-2 inline-block"
            >
              {isLogin ? 'Create an account' : 'Sign in instead'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
