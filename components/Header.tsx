import React, { useContext, useState, useRef } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AshokaChakraIcon } from './icons/AshokaChakraIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UserContext } from '../contexts/UserContext';

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const Header: React.FC = () => {
  const { 
    tokenBalance, 
    language, 
    setLanguage, 
    user, 
    userData, 
    loading 
  } = useContext(UserContext);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const translations = {
    en: {
      home: 'Home',
      chat: 'Chat',
      voiceChat: 'Voice Chat',
      benefits: 'Benefits',
      scholarships: 'Scholarships',
      leaderboard: 'Leaderboard',
      redeem: 'Redeem',
      buyTokens: 'Buy Tokens',
      myAccount: 'My Account',
      logout: 'Logout',
      signIn: 'Sign In',
      english: 'English',
      hindi: 'हिंदी',
      user: 'User',
      processing: 'Processing...'
    },
    hi: {
      home: 'होम',
      chat: 'चैट',
      voiceChat: 'वॉयस चैट',
      benefits: 'लाभ',
      scholarships: 'छात्रवृत्ति',
      leaderboard: 'लीडरबोर्ड',
      redeem: 'रिडीम करें',
      buyTokens: 'टोकन खरीदें',
      myAccount: 'मेरा खाता',
      logout: 'लॉगआउट',
      signIn: 'साइन इन',
      english: 'English',
      hindi: 'हिंदी',
      user: 'उपयोगकर्ता',
      processing: 'प्रोसेसिंग...'
    }
  };

  const t = translations[language] || translations.en;

  const linkStyle =
    'text-gray-600 hover:text-bharat-blue-700 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200';
  const activeLinkStyle =
    'text-bharat-blue-800 bg-bharat-blue-100 shadow-inner';

  const mobileMenuItems = [
    ['/', t.home],
    ['/chat', t.chat],
    ['/voice-chat', t.voiceChat],
    ['/scholarships', t.scholarships],
    ['/benefits', t.benefits],
    ['/leaderboard', t.leaderboard],
    ['/buy-tokens',t.redeemPage],
    ['/account', t.myAccount],
  ];

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
    setIsMenuOpen(false);
  };

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Title */}
          <div className="flex items-center space-x-3">
            <AshokaChakraIcon className="h-10 w-10 text-bharat-blue-800 rotate-slow" />
            <h1 className="text-xl md:text-2xl font-extrabold text-bharat-blue-900 tracking-tight">
              Bharat Mitra
            </h1>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {[
              ['/', t.home],
              ['/chat', t.chat],
              ['/voice-chat', t.voiceChat],
              ['/benefits', t.benefits],
              ['/scholarships', t.scholarships],
              ['/leaderboard', t.leaderboard],
              ['/buy-tokens',t.buyTokens],
              ['/redeem', t.redeem],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : ''}`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Right Side: Language Toggle + Token Balance + Mobile Menu Button */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <div className="flex items-center bg-gray-200 rounded-full px-1 py-1 transition shadow-sm">
              {['en', 'hi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1 text-sm font-semibold rounded-full transition-all duration-150 ${
                    language === lang
                      ? 'bg-white text-bharat-blue-800 shadow-sm'
                      : 'text-gray-600'
                  }`}
                >
                  {lang === 'en' ? t.english : t.hindi}
                </button>
              ))}
            </div>

            {/* Token Display */}
            <div className="flex items-center space-x-4">
              {loading ? (
                <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
              ) : user && userData ? (
                <>
                  <div className="flex items-center space-x-3 bg-bharat-green-100 border border-bharat-green-200 px-4 py-2 rounded-full shadow-sm">
                    <TokenIcon className="h-6 w-6 text-bharat-green-600" />
                    <span className="font-bold text-lg text-gray-900">
                      {userData.bharat_tokens || 0}
                    </span>
                  </div>
                  {/* Desktop Account Menu - Hidden on mobile */}
                  <div className="relative hidden md:block" ref={menuRef}>
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)} 
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100"
                    >
                      <UserIcon className="h-6 w-6 text-gray-700"/>
                      <span className="font-medium text-sm text-gray-800">
                        {userData.username?.split(' ')[0] || t.user}
                      </span>
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                        <Link 
                          to="/account" 
                          onClick={() => setIsMenuOpen(false)} 
                          className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t.myAccount}
                        </Link>
                        <button 
                          onClick={handleLogout} 
                          className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        >
                          {t.logout}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-bharat-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-bharat-blue-800 transition-transform transform hover:scale-105 shadow-lg"
                >
                  {t.signIn}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors duration-200"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? 'opacity-0' : 'mb-1'
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-200 shadow-lg">
            <nav className="px-4 py-4 space-y-2">
              {mobileMenuItems.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-lg font-medium text-base transition-all duration-200 ${
                      isActive
                        ? 'text-bharat-blue-800 bg-bharat-blue-100 shadow-inner'
                        : 'text-gray-600 hover:text-bharat-blue-700 hover:bg-gray-50'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
