import React, { useContext, useState, useRef, useEffect } from 'react';
import { NavLink, Link, useNavigate } from 'react-router-dom';
import { AshokaChakraIcon } from './icons/AshokaChakraIcon';
import { TokenIcon } from './icons/TokenIcon';
import { UserContext } from '../contexts/UserContext';
import { UserIcon } from './icons/UserIcon';

const Header: React.FC = () => {
  const { user, userData, loading, logout } = useContext(UserContext);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const linkStyle = "text-gray-600 hover:text-bharat-blue-700 transition-colors duration-200 px-3 py-2 rounded-md font-medium text-sm";
  const activeLinkStyle = "text-bharat-blue-700 bg-bharat-blue-100";
  
  const handleLogout = async () => {
    setIsMenuOpen(false);
    await logout();
    navigate('/');
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuRef]);

  return (
    <header className="bg-white/80 backdrop-blur-sm shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <Link to="/" className="flex items-center space-x-4">
            <AshokaChakraIcon className="h-10 w-10 text-bharat-blue-800" />
            <h1 className="text-xl md:text-2xl font-bold text-bharat-blue-900">Bharat Mitra</h1>
          </Link>
          <nav className="hidden md:flex items-center space-x-1">
            <NavLink to="/" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Home</NavLink>
            <NavLink to="/chat" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Chat</NavLink>
            <NavLink to="/voice-chat" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Voice Chat</NavLink>
            <NavLink to="/benefits" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Benefits</NavLink>
            <NavLink to="/scholarships" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Scholarships</NavLink>
            <NavLink to="/leaderboard" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Leaderboard</NavLink>
            <NavLink to="/redeem" className={({ isActive }) => `${linkStyle} ${isActive ? activeLinkStyle : ''}`}>Redeem</NavLink>
          </nav>
          <div className="flex items-center space-x-4">
            {loading ? (
              <div className="h-10 w-24 bg-gray-200 rounded-full animate-pulse"></div>
            ) : user && userData ? (
              <>
                <div className="flex items-center space-x-3 bg-bharat-green-100 border border-bharat-green-200 px-4 py-2 rounded-full shadow-sm">
                  <TokenIcon className="h-6 w-6 text-bharat-green-600" />
                  <span className="font-bold text-lg text-gray-900">{userData.bharat_tokens}</span>
                </div>
                <div className="relative" ref={menuRef}>
                  <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex items-center space-x-2 p-2 rounded-full hover:bg-gray-100">
                    <UserIcon className="h-6 w-6 text-gray-700"/>
                    <span className="font-medium text-sm text-gray-800 hidden sm:inline">{userData.username.split(' ')[0]}</span>
                  </button>
                  {isMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border">
                      <Link to="/account" onClick={() => setIsMenuOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">My Account</Link>
                      <button onClick={handleLogout} className="w-full text-left block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Logout</button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <Link to="/login" className="bg-bharat-blue-700 text-white font-bold py-2 px-6 rounded-full text-sm hover:bg-bharat-blue-800 transition-transform transform hover:scale-105 shadow-lg">
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
