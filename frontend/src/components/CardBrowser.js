import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decksAPI } from '../api';
import CreateCardModal from './CreateCardModal';

const CardBrowser = () => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedChapter, setSelectedChapter] = useState('Tất cả');
  const [chapters, setChapters] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [sortBy, setSortBy] = useState('chapter');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        setLoading(true);
        
        // Fetch deck info
        const deckResponse = await decksAPI.getDeck(deckId);
        setDeck(deckResponse.data);
        
        // Fetch cards with sorting
        const chapterFilter = selectedChapter === 'Tất cả' ? null : selectedChapter;
        const cardsResponse = await decksAPI.getDeckCards(deckId, sortBy, chapterFilter);
        const allCards = cardsResponse.data;
        setCards(allCards);
        
        // Extract unique chapters from all cards
        const uniqueChapters = ['Tất cả', ...new Set(
          allCards
            .map(card => card.chapter || 'General')
            .filter(ch => ch)
        )];
        setChapters(uniqueChapters);
        
        setError(null);
      } catch (err) {
        console.error('Failed to fetch deck:', err);
        setError('Không thể tải deck. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeckAndCards();
  }, [deckId, sortBy, selectedChapter]);

  const filteredCards = selectedChapter === 'Tất cả' 
    ? cards 
    : cards.filter(card => (card.chapter || 'General') === selectedChapter);

  const toggleFlip = (cardId) => {
    setFlippedCards(prev => ({
      ...prev,
      [cardId]: !prev[cardId]
    }));
  };

  const handleCardCreated = (newCard) => {
    // Add new card to list and update chapters
    setCards(prev => [...prev, newCard]);
    
    // Update chapters if new chapter added
    if (newCard.chapter && !chapters.includes(newCard.chapter)) {
      setChapters(prev => [...prev, newCard.chapter]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-4xl mb-4">📚</div>
          <p className="text-gray-600 text-lg">Đang tải cards...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800 text-lg mb-4">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (!deck) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 text-lg mb-4">Không thể tải deck</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            ← Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={() => navigate('/')}
              className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition"
            >
              ← Quay lại
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition"
            >
              + Thêm Card
            </button>
          </div>

          {/* Title Section */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-xl mb-4">
              <span className="text-2xl">ℹ️</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Tổng Ôn <span className="text-blue-600">{deck.title.split(' ').slice(2).join(' ')}</span>
            </h1>
            <p className="text-gray-600 text-base max-w-2xl mx-auto">
              {deck.description}
            </p>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center mb-6">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="chapter">📚 Sắp xếp theo Chương</option>
              <option value="title">📝 Sắp xếp theo Tiêu đề</option>
              <option value="created">🕐 Mới nhất trước</option>
            </select>

            {/* Card Count */}
            <div className="text-sm text-gray-600 font-medium">
              Hiển thị {filteredCards.length} / {cards.length} cards
            </div>
          </div>

          {/* Chapter Filter Tabs */}
          {chapters.length > 1 && (
            <div className="flex flex-wrap justify-center gap-2">
              {chapters.map(chapter => (
                <button
                  key={chapter}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`px-4 py-2 rounded-full font-medium transition ${
                    selectedChapter === chapter
                      ? 'bg-gray-800 text-white shadow-md'
                      : 'bg-white text-gray-600 border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {chapter}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Grid */}
      {filteredCards.length === 0 ? (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800 text-lg mb-4">Không có cards trong chương này</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              + Thêm card mới
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredCards.map((card) => {
              const isFlipped = flippedCards[card.id];
              
              return (
                <div
                  key={card.id}
                  onClick={() => toggleFlip(card.id)}
                  className="h-72 cursor-pointer perspective"
                >
                  <div
                    className={`relative w-full h-full transition-transform duration-500 transform-gpu ${
                      isFlipped ? 'scale-x-[-1]' : ''
                    }`}
                    style={{
                      transformStyle: 'preserve-3d',
                      transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                    }}
                  >
                    {/* Front Side - Question */}
                    <div
                      className="absolute w-full h-full bg-white rounded-xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:shadow-xl transition-shadow"
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Chapter Badge */}
                      {card.chapter && (
                        <div className="absolute top-3 left-3 px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded">
                          {card.chapter}
                        </div>
                      )}

                      <div className="text-xs text-gray-500 font-semibold mb-3">❓ CÂU HỎI</div>
                      
                      {/* Card Title */}
                      {card.title && (
                        <p className="text-sm text-gray-600 font-semibold mb-2 max-h-12 overflow-hidden">
                          {card.title}
                        </p>
                      )}
                      
                      <p className="text-lg font-bold text-gray-900 leading-relaxed flex-1 flex items-center">
                        {card.front}
                      </p>
                      <div className="text-xs text-gray-400 mt-4">Nhấn để lật xem chi tiết</div>
                    </div>

                    {/* Back Side - Answer */}
                    <div
                      className="absolute w-full h-full bg-blue-600 rounded-xl shadow-lg p-6 flex flex-col text-white overflow-hidden"
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="text-xs text-blue-200 font-semibold mb-3">💡 ĐÁP ÁN</div>
                      <div className="flex-1 overflow-y-auto text-sm leading-relaxed custom-scrollbar">
                        {typeof card.back === 'string' && card.back.includes('\n') ? (
                          <ul className="space-y-2">
                            {card.back.split('\n').map((line, idx) => (
                              <li key={idx} className="text-blue-50">
                                {line.startsWith('-') ? (
                                  <span className="ml-2">• {line.substring(1).trim()}</span>
                                ) : (
                                  <strong className="block text-white">{line}</strong>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-blue-50">{card.back}</p>
                        )}
                      </div>
                      <div className="text-xs text-blue-200 mt-3">Nhấn để xem câu hỏi</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-blue-900 mb-2">💡 Mẹo học tập</h3>
            <ul className="text-blue-800 text-sm space-y-1">
              <li>✓ Cố gắng trả lời trong đầu trước khi lật thẻ</li>
              <li>✓ Đọc kỹ mỗi nội dung trên mặt sau</li>
              <li>✓ Filter theo chương để tập trung một chủ đề</li>
              <li>✓ Được hiển thị {filteredCards.length} thẻ</li>
            </ul>
          </div>
        </div>
      )}

      {/* Create Card Modal */}
      <CreateCardModal
        deckId={deckId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardCreated={handleCardCreated}
        chapters={chapters.filter(ch => ch !== 'Tất cả')}
      />
    </div>
  );
};

export default CardBrowser;
