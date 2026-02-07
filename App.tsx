import React from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import Footer from './components/Footer';
import HomePage from './pages/HomePage';
import ChatPage from './pages/ChatPage';
import VoiceChatPage from './pages/VoiceChatPage';
import BenefitsPage from './pages/BenefitsPage';
import LeaderboardPage from './pages/LeaderboardPage';
import ScholarshipPage from './pages/ScholarshipPage';
import RedeemPage from './pages/RedeemPage';
import AccountPage from './pages/AccountPage';
import BuyTokens from './pages/BuyTokens';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="flex flex-col min-h-screen bg-bharat-blue-50 font-sans">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8">
          <Routes>
            {/* All Routes - Auth Removed */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<HomePage />} />
            <Route path="/home" element={<HomePage />} />
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/voice-chat" element={<VoiceChatPage />} />
            <Route path="/benefits" element={<BenefitsPage />} />
            <Route path="/scholarships" element={<ScholarshipPage />} />
            <Route path="/redeem" element={<RedeemPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/buy-tokens" element={<BuyTokens />} />
            <Route path="/account" element={<AccountPage />} />

          </Routes>
        </main>
        <Footer />
      </div>
    </HashRouter>
  );
};

export default App;
