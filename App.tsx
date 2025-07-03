import React, { useContext } from 'react';
import { HashRouter, Route, Routes, useSearchParams } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import VoiceChatPage from './pages/VoiceChatPage';
import BenefitsPage from './pages/BenefitsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ScholarshipPage from './pages/ScholarshipPage';
import RedeemPage from './pages/RedeemPage';
import AuthPage from './pages/AuthPage';
import AccountPage from './pages/AccountPage';
import AuthGuard from './components/AuthGuard';
import { UserContext } from './contexts/UserContext';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-bharat-blue-50 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<AuthPage />} />

            {/* Protected Routes */}
            <Route path="/home" element={<AuthGuard><HomePage /></AuthGuard>} />
            <Route path="/chat" element={<AuthGuard><ChatPage /></AuthGuard>} />
            <Route path="/voice-chat" element={<AuthGuard><VoiceChatPage /></AuthGuard>} />
            <Route path="/benefits" element={<AuthGuard><BenefitsPage /></AuthGuard>} />
            <Route path="/scholarships" element={<AuthGuard><ScholarshipPage /></AuthGuard>} />
            <Route path="/redeem" element={<AuthGuard><RedeemPage /></AuthGuard>} />
            <Route path="/leaderboard" element={<AuthGuard><LeaderboardPage /></AuthGuard>} />
            <Route path="/buy-tokens" element={<AuthGuard><BuyTokens /></AuthGuard>} />
            <Route path="/account" element={<AuthGuard><AccountPage /></AuthGuard>} />
            
          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
