import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decksAPI, cardsAPI } from '../api';
import CreateCardModal from './CreateCardModal';

// Mảng màu sắc Gradient cho mặt sau của thẻ
const gradients = [
    "from-slate-700 to-slate-900",
    "from-blue-700 to-indigo-900",
    "from-teal-700 to-cyan-900",
    "from-emerald-700 to-green-900",
    "from-violet-700 to-purple-900"
];

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
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkHtml, setBulkHtml] = useState('');
  const [quizAnswers, setQuizAnswers] = useState({});
  const isAdmin = localStorage.getItem('flashcardAdmin') === 'true';

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        setLoading(true);
        
        // Fetch deck info
        const deckResponse = await decksAPI.getDeck(deckId);
        setDeck(deckResponse.data);
        setNewTag(deckResponse.data.tag || '');
        
        // Fetch cards with sorting
        const cardsResponse = await decksAPI.getDeckCards(deckId, sortBy, null);
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
  }, [deckId, sortBy]);

  const filteredCards = cards.filter(card => {
    const chapterMatch = selectedChapter === 'Tất cả' || (card.chapter || 'General') === selectedChapter;
    const searchMatch = !searchTerm || 
                        (card.front && card.front.toLowerCase().includes(searchTerm.toLowerCase())) ||
                        (card.title && card.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return chapterMatch && searchMatch;
  });

  const parseQuizMeta = (card) => {
    if (!card.back || typeof card.back !== 'string') return null;
    if (!card.back.startsWith('__QUIZ__::')) return null;
    try {
      const payload = card.back.replace('__QUIZ__::', '');
      const meta = JSON.parse(payload);
      if (meta.type !== 'quiz') return null;
      return meta;
    } catch (e) {
      return null;
    }
  };

  const handleQuizSelect = (cardId, optionKey) => {
    setQuizAnswers(prev => {
      if (prev[cardId]) return prev; // lock after first answer
      return { ...prev, [cardId]: optionKey };
    });
  };

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

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    
    try {
      await cardsAPI.deleteCard(cardId);
      setCards(prev => prev.filter(c => c.id !== cardId));
      setSelectedCards(prev => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    } catch (err) {
      alert('Lỗi khi xóa thẻ');
    }
  };

  const toggleSelectCard = (cardId, e) => {
    e.stopPropagation();
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (next.has(cardId)) {
        next.delete(cardId);
      } else {
        next.add(cardId);
      }
      return next;
    });
  };

  const handleBulkDelete = async () => {
    if (selectedCards.size === 0) return;
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCards.size} thẻ đã chọn?`)) return;
    
    try {
      // Create a copy of cards array, delete one by one
      for (const cardId of selectedCards) {
         await cardsAPI.deleteCard(cardId);
      }
      setCards(prev => prev.filter(c => !selectedCards.has(c.id)));
      setSelectedCards(new Set());
      alert('Đã xóa thành công');
    } catch (err) {
      alert('Lỗi khi xóa nhiều thẻ');
    }
  };

  const handleUpdateTitle = async () => {
    try {
      await decksAPI.updateDeck(deckId, { ...deck, title: newTitle || deck.title, tag: newTag || null });
      setDeck(prev => ({ ...prev, title: newTitle || deck.title, tag: newTag || null }));
      setIsEditingTitle(false);
    } catch (err) {
      alert('Lỗi khi cập nhật tên deck');
    }
  };

  const handleBulkAddHtml = async () => {
    if (!bulkHtml.trim()) return;
    try {
      setLoading(true);
      await decksAPI.appendCardsFromHtml(deckId, bulkHtml);
      // Refresh current page
      const cardsResponse = await decksAPI.getDeckCards(deckId, sortBy, null);
      const allCards = cardsResponse.data;
      setCards(allCards);
      
      const uniqueChapters = ['Tất cả', ...new Set(
        allCards
          .map(card => card.chapter || 'General')
          .filter(ch => ch)
      )];
      setChapters(uniqueChapters);
      
      setIsBulkAddOpen(false);
      setBulkHtml('');
      alert('Đã thêm thẻ hàng loạt thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-4 sm:py-8">
          <div className="flex items-center justify-between mb-4 sm:mb-6 gap-2">
            <button
              onClick={() => navigate('/')}
              className="px-3 sm:px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition text-sm"
            >
              ← Quay lại
            </button>
            <div className="flex gap-2">
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-3 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition text-sm whitespace-nowrap"
              >
                + Thêm 1 Card
              </button>
              {isAdmin && (
                <button
                  onClick={() => setIsBulkAddOpen(true)}
                  className="px-3 sm:px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition text-sm whitespace-nowrap"
                >
                  + Thêm hàng loạt
                </button>
              )}
            </div>
          </div>

          {/* Title Section */}
          <div className="text-center mb-6 sm:mb-8 relative group">
            <div className="inline-flex items-center justify-center p-2 sm:p-3 bg-blue-600 text-white rounded-xl mb-2 sm:mb-4">
              <span className="text-xl sm:text-2xl">ℹ️</span>
            </div>
            
            {isEditingTitle && isAdmin ? (
              <div className="flex justify-center items-center gap-2 mb-2 sm:mb-4">
                <input 
                  type="text" 
                  value={newTitle} 
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none text-center px-2 py-1 max-w-lg w-full"
                  autoFocus
                />
                <button onClick={handleUpdateTitle} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">✓</button>
                <button onClick={() => setIsEditingTitle(false)} className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">✕</button>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-2">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 line-clamp-2">
                  {deck.title}
                </h1>
                {isAdmin && (
                  <button onClick={() => { setNewTitle(deck.title); setIsEditingTitle(true); }} className="text-gray-400 hover:text-blue-500 self-start mt-2">
                    ✎
                  </button>
                )}
              </div>
            )}
            
            <p className="text-gray-600 text-xs sm:text-base max-w-2xl mx-auto px-2">
              {deck.description}
            </p>

            {/* Tag hiển thị & chỉnh sửa */}
            <div className="flex flex-col sm:flex-row justify-center items-center gap-3 mt-3">
              <span className={`px-3 py-1 rounded-full text-xs sm:text-sm font-semibold ${deck.tag === 'Quiz' ? 'bg-purple-100 text-purple-700' : deck.tag === 'Flashcard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                Tag: {deck.tag || 'None'}
              </span>
              {isAdmin && (
                <div className="flex items-center gap-2">
                  <select
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    className="px-3 py-1 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">None</option>
                    <option value="Flashcard">Flashcard</option>
                    <option value="Quiz">Quiz</option>
                  </select>
                  <button
                    onClick={handleUpdateTitle}
                    className="px-3 py-1 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                  >
                    Lưu tag
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Controls Row */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-between items-stretch sm:items-center mb-4 sm:mb-6">
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center order-2 sm:order-1 flex-1">
                {/* Sort Dropdown */}
                <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
                >
                <option value="chapter">📚 Sắp xếp theo Chương</option>
                <option value="title">📝 Sắp xếp theo Tiêu đề</option>
                <option value="created">🕐 Mới nhất trước</option>
                </select>

                {/* Search Bar */}
                <input
                type="text"
                placeholder="🔍 Tìm kiếm tựa đề/câu hỏi..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full sm:max-w-xs text-sm"
                />
                
                {isAdmin && selectedCards.size > 0 && (
                  <button 
                    onClick={handleBulkDelete}
                    className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm whitespace-nowrap"
                  >
                    🗑️ Xóa ({selectedCards.size})
                  </button>
                )}
            </div>

            {/* Card Count */}
            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-right order-1 sm:order-2 shrink-0">
              Hiển thị {filteredCards.length} / {cards.length} cards
            </div>
          </div>

          {/* Chapter Filter Tabs */}
          {chapters.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {chapters.map(chapter => (
                <button
                  key={chapter}
                  onClick={() => setSelectedChapter(chapter)}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-medium transition text-xs sm:text-sm ${
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
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-8 sm:py-12">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 text-center">
            <p className="text-yellow-800 text-base sm:text-lg mb-4">Không có cards trong chương này</p>
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 sm:px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              + Thêm card mới
            </button>
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto px-3 sm:px-4 py-6 sm:py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {filteredCards.map((card) => {
              const isFlipped = flippedCards[card.id];
              const bgGradient = gradients[card.id % gradients.length];
              const quizMeta = deck.tag === 'Quiz' ? parseQuizMeta(card) : null;

              if (deck.tag === 'Quiz' && quizMeta) {
                const selected = quizAnswers[card.id];
                const isCorrect = selected && selected === quizMeta.correct;
                return (
                  <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                    <div className="bg-slate-50 px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                      <span className="text-xs font-semibold text-blue-700 uppercase">{card.chapter || 'Chung'}</span>
                      <span className="text-xs text-slate-500">ID #{card.id}</span>
                    </div>
                    <div className="p-5 space-y-4">
                      <h3 className="text-lg font-bold text-slate-900 leading-relaxed">{card.front}</h3>
                      <div className="space-y-2">
                        {Object.entries(quizMeta.options || {}).map(([key, text]) => {
                          const picked = selected === key;
                          const correct = quizMeta.correct === key;
                          let styles = 'w-full text-left p-3 rounded-xl border-2 transition flex gap-3 items-center';
                          if (!selected) {
                            styles += ' border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50';
                          } else if (correct) {
                            styles += ' border-emerald-500 bg-emerald-50 text-emerald-800';
                          } else if (picked && !correct) {
                            styles += ' border-rose-500 bg-rose-50 text-rose-700';
                          } else {
                            styles += ' border-slate-100 bg-slate-50 text-slate-400';
                          }
                          return (
                            <button
                              key={key}
                              disabled={!!selected}
                              onClick={() => handleQuizSelect(card.id, key)}
                              className={styles}
                            >
                              <span className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 text-slate-600 font-bold">
                                {key}
                              </span>
                              <span className="text-sm md:text-base leading-relaxed">{text}</span>
                            </button>
                          );
                        })}
                      </div>
                      {selected && (
                        <div className={`mt-2 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-amber-50 border-amber-200 text-amber-700'} animate-slide-down`}>
                          <div className="text-sm font-semibold mb-1">{isCorrect ? 'Tuyệt vời! Đúng đáp án.' : 'Sai rồi, xem giải thích:'}</div>
                          <div className="text-sm leading-relaxed text-slate-700">{quizMeta.explanation || 'Không có giải thích.'}</div>
                          {quizMeta.correct && !isCorrect && (
                            <div className="text-sm mt-2 text-slate-600">Đáp án đúng: {quizMeta.correct}</div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={card.id}
                  onClick={() => toggleFlip(card.id)}
                  className="h-[450px] cursor-pointer perspective"
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
                      className="absolute w-full h-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:shadow-xl transition-shadow hover:border-blue-300"
                      style={{
                        backfaceVisibility: 'hidden',
                      }}
                    >
                      {/* Chapter Badge */}
                      {card.chapter && (
                        <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                          {card.chapter}
                        </div>
                      )}
                      
                      {/* Admin Controls */}
                      {isAdmin && (
                        <div className="absolute top-4 right-16 flex gap-2">
                           <input 
                              type="checkbox" 
                              checked={selectedCards.has(card.id)}
                              onChange={(e) => toggleSelectCard(card.id, e)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 cursor-pointer accent-red-500"
                           />
                           <button 
                              onClick={(e) => handleDeleteCard(card.id, e)}
                              className="text-red-500 hover:text-red-700 bg-red-50 rounded px-2 text-xs"
                           >
                              Xóa
                           </button>
                        </div>
                      )}

                      <span className="absolute top-4 right-4 text-gray-300 font-mono">
                          #{card.id}
                      </span>

                      {/* Card Title */}
                      <h2 className="text-sm font-semibold text-gray-500 mb-2 mt-4 max-h-10 overflow-hidden line-clamp-2">
                        {card.title || "Câu hỏi"}
                      </h2>
                      

                      <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug flex-1 flex items-center">
                        {card.front}
                      </h3>
                      
                      <div className="absolute bottom-5 flex items-center text-blue-500 text-sm font-medium animate-pulse">
                          <span>Nhấn để lật xem chi tiết</span>
                      </div>
                    </div>

                    {/* Back Side - Answer */}
                    <div
                      className={`absolute w-full h-full bg-gradient-to-br ${bgGradient} text-white rounded-2xl shadow-xl p-6 flex flex-col overflow-hidden`}     
                      style={{
                        backfaceVisibility: 'hidden',
                        transform: 'rotateY(180deg)',
                      }}
                    >
                      <div className="border-b border-white/20 pb-2 mb-3 flex justify-between items-center shrink-0">
                          <span className="text-sm font-bold text-white/80 uppercase tracking-widest">{card.chapter || 'Chương'}</span>
                          <span className="text-xs bg-white/20 px-2 py-1 rounded-md">Đáp án</span>
                      </div>

                      <div className="flex-1 overflow-y-auto text-[15px] leading-relaxed custom-scrollbar text-left pr-2">
                        {typeof card.back === 'string' && card.back.includes('\n') ? (
                          <ul className="space-y-3">
                            {card.back.split('\n').map((line, idx) => (
                              <li key={idx} className="flex items-start text-[15px] leading-relaxed">
                                {line.startsWith('-') ? (
                                  <>
                                    <span className="mr-2 mt-1.5 w-1.5 h-1.5 bg-white/70 rounded-full shrink-0"></span>
                                    <span className="text-white/95">{line.substring(1).trim()}</span>
                                  </>
                                ) : (
                                  <span className="font-semibold text-white">{line}</span>
                                )}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="text-white/95">{card.back}</p>
                        )}
                      </div>
                      <div className="text-xs text-center text-white/50 mt-3 pt-2 border-t border-white/10 shrink-0">Nhấn để xem câu hỏi</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Info Box */}
          <div className="mt-8 sm:mt-12 bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6 max-w-2xl mx-auto">
            <h3 className="font-bold text-blue-900 mb-2 text-sm sm:text-base">💡 Mẹo học tập</h3>
            <ul className="text-blue-800 text-xs sm:text-sm space-y-1">
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

      {/* Bulk Add HTML Modal */}
      {isBulkAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 min-p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
             <h2 className="text-2xl font-bold mb-4 text-gray-800">Thêm thẻ hàng loạt (Dán HTML)</h2>
             <p className="text-gray-600 text-sm mb-4">
                Dán mã HTML chứa các thẻ của bạn vào đây. Các thẻ sẽ được tự động phân loại và thêm vào deck hiện tại.
             </p>
             <textarea 
                value={bulkHtml}
                onChange={(e) => setBulkHtml(e.target.value)}
                placeholder="<div className='card-list'>...</div>"
                className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-6 resize-none"
             ></textarea>
             
             <div className="flex justify-end gap-3 mt-auto">
                <button 
                  onClick={() => setIsBulkAddOpen(false)}
                  className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                >
                  Hủy
                </button>
                <button 
                  onClick={handleBulkAddHtml}
                  disabled={loading || !bulkHtml.trim()}
                  className={`px-5 py-2 rounded-lg text-white font-medium ${loading || !bulkHtml.trim() ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                >
                  {loading ? 'Đang xử lý...' : 'Thêm hàng loạt'}
                </button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;
