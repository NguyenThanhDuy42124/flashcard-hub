import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DeckList from './components/DeckList';
import Uploader from './components/Uploader';
import DeckBuilder from './components/DeckBuilder';
import CardBrowser from './components/CardBrowser';
import Login from './components/Login';
import ExamCreator from './components/ExamCreator';
import { studyAPI } from './api';

function App() {
  const [userProgress, setUserProgress] = useState(null);
  const [isAdmin, setIsAdmin] = useState(
    typeof window !== 'undefined' && localStorage.getItem('flashcardAdmin') === 'true'
  );
  const [isDarkMode, setIsDarkMode] = useState(
    typeof window !== 'undefined' && localStorage.getItem('flashcardTheme') === 'dark'
  );
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    // Fetch user progress on app load
    fetchUserProgress();
    const handleStorage = () => {
      setIsAdmin(localStorage.getItem('flashcardAdmin') === 'true');
      setIsDarkMode(localStorage.getItem('flashcardTheme') === 'dark');
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
      localStorage.setItem('flashcardTheme', 'dark');
    } else {
      document.body.classList.remove('dark-mode');
      localStorage.setItem('flashcardTheme', 'light');
    }
  }, [isDarkMode]);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 260);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('flashcardAdmin');
    setIsAdmin(false);
  };

  const fetchUserProgress = async () => {
    try {
      const response = await studyAPI.getUserProgress();
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Router>
      <div className="app-shell flex min-h-screen flex-col">
        {/* Navigation Bar */}
        <nav className="app-nav">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-wrap justify-between items-center py-4 gap-4">
              <Link to="/" className="brand-wordmark hover:opacity-85 transition-opacity">
                <span className="text-xl sm:text-2xl">✦</span>
                <span className="title text-xl sm:text-2xl font-bold">Flashcard Hub</span>
                <span className="dot text-xl sm:text-2xl">.</span>
              </Link>
              <div className="flex flex-wrap gap-4 sm:gap-6 items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-semibold text-sm sm:text-base">
                  Bộ Deck
                </Link>
                <Link to="/create" className="text-gray-700 hover:text-blue-600 font-semibold text-sm sm:text-base">
                  Tạo Deck
                </Link>
                <Link to="/upload" className="text-gray-700 hover:text-blue-600 font-semibold text-sm sm:text-base">
                  Tải Lên
                </Link>
                <button
                  onClick={() => setIsDarkMode((prev) => !prev)}
                  className="theme-toggle-btn text-sm sm:text-base font-semibold px-3 py-1.5"
                  title="Bật/tắt Dark Mode"
                >
                  {isDarkMode ? '☀️ Light' : '🌙 Dark'}
                </button>
                {userProgress && (
                  <div className="text-xs sm:text-sm text-gray-700 bg-blue-100 px-2 sm:px-3 py-1.5 rounded-full whitespace-nowrap font-semibold">
                    Đã ôn: {userProgress.total_cards_reviewed}
                  </div>
                )}
                {isAdmin ? (
                  <div className="flex items-center gap-2 text-sm sm:text-base">
                    <span className="text-green-700 font-semibold">Hello, Admin</span>
                    <button
                      onClick={handleLogout}
                      className="text-red-600 hover:text-red-700 font-semibold border border-red-200 px-2.5 py-1 rounded-full"
                    >
                      Logout
                    </button>
                  </div>
                ) : (
                  <Link to="/login" className="text-gray-700 hover:text-blue-600 font-semibold text-sm sm:text-base">
                    Admin Login
                  </Link>
                )}
              </div>
            </div>
          </div>
        </nav>

        {/* Main Content */}
        <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Routes>
            <Route path="/" element={<DeckList />} />
            <Route path="/create" element={<DeckBuilder />} />
            <Route path="/upload" element={<Uploader onUploadSuccess={() => fetchUserProgress()} />} />
            <Route path="/deck/:deckId/cards" element={<CardBrowser />} />
            <Route path="/login" element={<Login />} />
            <Route path="/exam/create" element={<ExamCreator />} />
          </Routes>
        </main>

        {showScrollTop && (
          <button
            onClick={scrollToTop}
            className="scroll-top-btn z-50 w-12 h-12 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
            style={{ position: 'fixed', right: '24px', left: 'auto', bottom: '24px' }}
            title="Quay về đầu trang"
            aria-label="Quay về đầu trang"
          >
            ↑
          </button>
        )}
      </div>
    </Router>
  );
}

export default App;
