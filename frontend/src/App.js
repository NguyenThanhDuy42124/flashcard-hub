import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import DeckList from './components/DeckList';
import Uploader from './components/Uploader';
import DeckBuilder from './components/DeckBuilder';
import CardBrowser from './components/CardBrowser';
import { studyAPI } from './api';

function App() {
  const [userProgress, setUserProgress] = useState(null);

  useEffect(() => {
    // Fetch user progress on app load
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const response = await studyAPI.getUserProgress();
      setUserProgress(response.data);
    } catch (error) {
      console.error('Error fetching progress:', error);
    }
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
        {/* Navigation Bar */}
        <nav className="bg-white shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                  🎓 Flashcard Hub
                </span>
              </div>
              <div className="flex gap-6 items-center">
                <Link to="/" className="text-gray-700 hover:text-blue-600 font-medium">
                  Bộ Deck
                </Link>
                <Link to="/create" className="text-gray-700 hover:text-blue-600 font-medium">
                  Tạo Deck
                </Link>
                <Link to="/upload" className="text-gray-700 hover:text-blue-600 font-medium">
                  Tải Lên
                </Link>
                {userProgress && (
                  <div className="text-sm text-gray-600 bg-blue-100 px-3 py-1 rounded">
                    Đã ôn: {userProgress.total_cards_reviewed}
                  </div>
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
          </Routes>
        </main>

        {/* Footer */}
        <footer className="bg-gray-800 text-white text-center py-4 mt-auto">
          <p>Flashcard Hub © 2026 - Nền tảng học tập tương tác với SRS</p>
        </footer>
      </div>
    </Router>
  );
}

export default App;
