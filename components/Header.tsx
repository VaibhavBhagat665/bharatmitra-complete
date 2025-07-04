import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { AshokaChakraIcon } from './icons/AshokaChakraIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UserContext } from '../contexts/UserContext';

const UserIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
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
  const [isTokenMenuOpen, setIsTokenMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const tokenMenuRef = useRef<HTMLDivElement>(null);

  // Enhanced scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside handlers
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
      if (tokenMenuRef.current && !tokenMenuRef.current.contains(event.target as Node)) {
        setIsTokenMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
    'text-gray-600 hover:text-bharat-blue-700 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 hover:bg-bharat-blue-50 hover:shadow-sm relative overflow-hidden group';
  const activeLinkStyle =
    'text-bharat-blue-800 bg-gradient-to-r from-bharat-blue-100 to-bharat-blue-50 shadow-inner border border-bharat-blue-200';

  const mobileMenuItems = [
    ['/', t.home],
    ['/chat', t.chat],
    ['/voice-chat', t.voiceChat],
    ['/scholarships', t.scholarships],
    ['/benefits', t.benefits],
    ['/leaderboard', t.leaderboard],
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

  const toggleTokenMenu = () => {
    setIsTokenMenuOpen(!isTokenMenuOpen);
  };

  const closeTokenMenu = () => {
    setIsTokenMenuOpen(false);
  };

  return (
    <header className={`bg-white/95 backdrop-blur-lg shadow-lg sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white/98 shadow-xl' : ''}`}>
      <div className="container mx-auto px-4 lg:px-6">
        <div className="flex items-center justify-between h-20">
          {/* Logo + Title - Enhanced with gradient and glow effects */}
          <Link to="/" className="flex items-center space-x-2 sm:space-x-3 group">
            <div className="relative">
              <AshokaChakraIcon className="h-8 w-8 sm:h-10 sm:w-10 text-bharat-blue-800 transition-all duration-500 group-hover:scale-110 group-hover:rotate-180" />
              <div className="absolute inset-0 bg-bharat-blue-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-opacity duration-500"></div>
            </div>
            <div>
              <h1 className="text-lg sm:text-xl md:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-bharat-blue-900 via-bharat-blue-800 to-bharat-blue-700 tracking-tight group-hover:from-bharat-blue-700 group-hover:to-bharat-blue-900 transition-all duration-500">
                Bharat Mitra
              </h1>
              <div className="h-0.5 w-0 group-hover:w-full bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-800 transition-all duration-500 mt-0.5"></div>
            </div>
          </Link>

          {/* Desktop Navigation - Enhanced with hover effects */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {[
              ['/', t.home],
              ['/chat', t.chat],
              ['/voice-chat', t.voiceChat],
              ['/benefits', t.benefits],
              ['/scholarships', t.scholarships],
              ['/leaderboard', t.leaderboard],
            ].map(([to, label]) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `${linkStyle} ${isActive ? activeLinkStyle : ''}`
                }
              >
                <span className="relative z-10">{label}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-bharat-blue-400 to-bharat-blue-600 opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-xl"></div>
              </NavLink>
            ))}
          </nav>

          {/* Right Side - Enhanced with modern styling */}
          <div className="flex items-center gap-2 sm:gap-3 lg:gap-4">
            {/* Language Toggle - Glassmorphism style */}
            <div className="flex items-center bg-white/80 backdrop-blur-sm rounded-full px-1 py-1 transition-all duration-300 shadow-md border border-white/20 hover:shadow-lg">
              {['en', 'hi'].map((lang) => (
                <button
                  key={lang}
                  onClick={() => setLanguage(lang)}
                  className={`px-3 py-1.5 text-xs sm:text-sm font-bold rounded-full transition-all duration-300 ${
                    language === lang
                      ? 'bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 text-white shadow-lg transform scale-105'
                      : 'text-gray-600 hover:text-bharat-blue-700 hover:bg-white/60'
                  }`}
                >
                  {lang === 'en' ? 'EN' : 'हि'}
                </button>
              ))}
            </div>

            {/* Token Display and User Section */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              {loading ? (
                <div className="h-8 w-16 sm:h-10 sm:w-24 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse"></div>
              ) : user && userData ? (
                <>
                  {/* Token Display - Enhanced with gradient and glow */}
                  <div className="relative" ref={tokenMenuRef}>
                    <button 
                      onClick={toggleTokenMenu}
                      className="flex items-center space-x-1 sm:space-x-2 bg-gradient-to-r from-bharat-green-100 to-emerald-100 border border-bharat-green-200 px-3 sm:px-4 py-2 rounded-full shadow-md hover:shadow-lg hover:from-bharat-green-200 hover:to-emerald-200 transition-all duration-300 transform hover:scale-105 group"
                    >
                      <TokenIcon className="h-4 w-4 sm:h-5 sm:w-5 text-bharat-green-600 group-hover:text-bharat-green-700 transition-colors duration-300" />
                      <span className="font-black text-sm sm:text-base text-gray-900 group-hover:text-gray-800">
                        {userData.bharat_tokens || 0}
                      </span>
                      <ChevronDownIcon className={`h-3 w-3 sm:h-4 sm:w-4 text-gray-600 transition-all duration-300 ${isTokenMenuOpen ? 'rotate-180 text-bharat-green-600' : 'group-hover:text-bharat-green-600'}`} />
                    </button>
                    
                    {/* Token Dropdown - Enhanced with modern styling */}
                    {isTokenMenuOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in slide-in-from-top-2 duration-200">
                        <Link 
                          to="/buy-tokens" 
                          onClick={closeTokenMenu} 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-bharat-green-50 hover:to-emerald-50 transition-all duration-200 mx-2 rounded-xl"
                        >
                          <TokenIcon className="h-4 w-4 mr-3 text-bharat-green-600" />
                          {t.buyTokens}
                        </Link>
                        <Link 
                          to="/redeem" 
                          onClick={closeTokenMenu} 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-bharat-green-50 hover:to-emerald-50 transition-all duration-200 mx-2 rounded-xl"
                        >
                          <svg className="h-5 w-5 mr-3 text-bharat-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                          </svg>
                          {t.redeem}
                        </Link>
                      </div>
                    )}
                  </div>
                  
                  {/* Desktop Account Menu - Enhanced */}
                  <div className="relative hidden md:block" ref={menuRef}>
                    <button 
                      onClick={() => setIsMenuOpen(!isMenuOpen)} 
                      className="flex items-center space-x-2 p-2 rounded-full hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 transition-all duration-300 group"
                    >
                      <div className="p-1 rounded-full bg-gradient-to-r from-bharat-blue-500 to-bharat-blue-600 shadow-md">
                        <UserIcon className="h-5 w-5 text-white"/>
                      </div>
                      <span className="font-semibold text-sm text-gray-800 group-hover:text-bharat-blue-700">
                        {userData.username?.split(' ')[0] || t.user}
                      </span>
                      <ChevronDownIcon className={`h-4 w-4 text-gray-600 transition-all duration-300 ${isMenuOpen ? 'rotate-180 text-bharat-blue-600' : 'group-hover:text-bharat-blue-600'}`} />
                    </button>
                    {isMenuOpen && (
                      <div className="absolute right-0 mt-3 w-52 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl py-2 z-50 border border-white/20 animate-in slide-in-from-top-2 duration-200">
                        <Link 
                          to="/account" 
                          onClick={() => setIsMenuOpen(false)} 
                          className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-bharat-blue-50 hover:to-blue-50 transition-all duration-200 mx-2 rounded-xl"
                        >
                          <UserIcon className="h-4 w-4 mr-3 text-bharat-blue-600" />
                          {t.myAccount}
                        </Link>
                        <button 
                          onClick={handleLogout} 
                          className="w-full flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-200 mx-2 rounded-xl"
                        >
                          <svg className="h-4 w-4 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                          </svg>
                          {t.logout}
                        </button>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <Link 
                  to="/login" 
                  className="bg-gradient-to-r from-bharat-blue-600 to-bharat-blue-700 text-white font-bold py-2 px-4 sm:px-6 rounded-full text-xs sm:text-sm hover:from-bharat-blue-700 hover:to-bharat-blue-800 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  {t.signIn}
                </Link>
              )}
            </div>

            {/* Mobile Menu Button - Enhanced */}
            <button
              onClick={toggleMobileMenu}
              className="md:hidden p-2 rounded-xl hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 transition-all duration-300 group"
              aria-label="Toggle mobile menu"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 group-hover:bg-bharat-blue-600 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1.5' : 'mb-1'
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 group-hover:bg-bharat-blue-600 ${
                    isMobileMenuOpen ? 'opacity-0' : 'mb-1'
                  }`}
                />
                <div
                  className={`w-5 h-0.5 bg-gray-600 transition-all duration-300 group-hover:bg-bharat-blue-600 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1.5' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Menu - Enhanced with modern styling */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-200 shadow-2xl rounded-b-3xl mx-2 mb-2">
            <nav className="px-4 py-6 space-y-2">
              {mobileMenuItems.map(([to, label]) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={closeMobileMenu}
                  className={({ isActive }) =>
                    `block px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 ${
                      isActive
                        ? 'text-bharat-blue-800 bg-gradient-to-r from-bharat-blue-100 to-bharat-blue-50 shadow-inner border border-bharat-blue-200'
                        : 'text-gray-600 hover:text-bharat-blue-700 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100'
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
              
              {/* Mobile Token Menu */}
              {user && userData && (
                <div className="border-t border-gray-200 pt-4 mt-4">
                  <div className="px-4 py-2 text-sm font-bold text-gray-500 uppercase tracking-wide">
                    Token Options
                  </div>
                  <Link
                    to="/buy-tokens"
                    onClick={closeMobileMenu}
                    className="flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 text-gray-600 hover:text-bharat-green-700 hover:bg-gradient-to-r hover:from-bharat-green-50 hover:to-emerald-50"
                  >
                    <TokenIcon className="h-5 w-5 mr-3 text-bharat-green-600" />
                    {t.buyTokens}
                  </Link>
                  <Link
                    to="/redeem"
                    onClick={closeMobileMenu}
                    className="flex items-center px-4 py-3 rounded-xl font-semibold text-base transition-all duration-300 text-gray-600 hover:text-bharat-green-700 hover:bg-gradient-to-r hover:from-bharat-green-50 hover:to-emerald-50"
                  >
                    <svg className="h-5 w-5 mr-3 text-bharat-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    {t.redeem}
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
