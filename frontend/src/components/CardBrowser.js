import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decksAPI, cardsAPI } from '../api';
import CreateCardModal from './CreateCardModal';

// Mảng màu sắc Gradient cho mặt sau của thẻ
const gradients = [
  'from-slate-700 to-slate-900',
  'from-blue-700 to-indigo-900',
  'from-teal-700 to-cyan-900',
  'from-emerald-700 to-green-900',
  'from-violet-700 to-purple-900',
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
        const deckResponse = await decksAPI.getDeck(deckId);
        setDeck(deckResponse.data);
        setNewTag(deckResponse.data.tag || '');

        const cardsResponse = await decksAPI.getDeckCards(deckId, sortBy, null);
        const allCards = cardsResponse.data;
        setCards(allCards);

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
      [cardId]: !prev[cardId],
    }));
  };

  const handleCardCreated = (newCard) => {
    setCards(prev => [...prev, newCard]);
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
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white text-sm"
              >
                <option value="chapter">📚 Sắp xếp theo Chương</option>
                <option value="title">📝 Sắp xếp theo Tiêu đề</option>
                <option value="created">🕐 Mới nhất trước</option>
              </select>

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

            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-right order-1 sm:order-2 shrink-0">
              Hiển thị {filteredCards.length} / {cards.length} cards
            </div>
          </div>

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

      {/* Main Content - Quiz layout vs Flashcard layout */}
      {deck.tag === 'Quiz' ? (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4 sm:p-6 mb-6 sticky top-4 z-10">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Chương:</span>
                <div className="flex flex-wrap gap-2">
                  {chapters.map(chapter => (
                    <button
                      key={chapter}
                      onClick={() => setSelectedChapter(chapter)}
                      className={`px-3 py-1.5 rounded-full text-sm font-semibold transition-colors shadow-sm ${
                        selectedChapter === chapter
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                      }`}
                    >
                      {chapter}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
                <input
                  type="text"
                  placeholder="Tìm kiếm tựa đề/câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm w-full sm:w-72"
                />
                <div className="flex items-center gap-4 bg-slate-50 px-3 py-2 rounded-xl border border-slate-200">
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase">Hoàn thành</div>
                    <div className="text-lg font-extrabold text-blue-600">{Object.keys(quizAnswers).length} / {filteredCards.length}</div>
                  </div>
                  <div className="w-px h-8 bg-slate-200"></div>
                  <div className="text-center">
                    <div className="text-xs font-bold text-slate-500 uppercase">Đúng</div>
                    <div className="text-lg font-extrabold text-emerald-600">{Object.entries(quizAnswers).reduce((acc, [id, ans]) => {
                      const meta = parseQuizMeta(cards.find(c => c.id === Number(id)) || {});
                      if (meta && ans === meta.correct) return acc + 1;
                      return acc;
                    }, 0)}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {filteredCards.length === 0 ? (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <p className="text-yellow-800 text-base sm:text-lg">Không có câu hỏi cho bộ lọc này.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              {filteredCards.map((card, idx) => {
                const quizMeta = parseQuizMeta(card);
                const userAnswer = quizAnswers[card.id];
                const isAnswered = !!userAnswer;
                const isCorrect = quizMeta && isAnswered && userAnswer === quizMeta.correct;

                const optionClass = (key) => {
                  const base = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-start gap-3 font-semibold shadow-sm';
                  if (!quizMeta || !isAnswered) return `${base} border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 text-slate-800`;
                  if (key === quizMeta.correct) return `${base} border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_12px_28px_-18px_rgba(16,185,129,0.7)] cursor-default`;
                  if (key === userAnswer) return `${base} border-rose-400 bg-rose-50 text-rose-800 shadow-[0_12px_28px_-18px_rgba(244,63,94,0.65)] cursor-default`;
                  return `${base} border-slate-100 bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed`;
                };

                const optionIcon = (key) => {
                  if (!quizMeta || !isAnswered) return (
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg text-sm font-bold">
                      {key}
                    </span>
                  );
                  if (key === quizMeta.correct) return (
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-emerald-500 text-white rounded-lg text-sm font-bold animate-bounce">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                    </span>
                  );
                  if (key === userAnswer) return (
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-rose-500 text-white rounded-lg text-sm font-bold">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </span>
                  );
                  return (
                    <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-200 text-slate-400 rounded-lg text-sm font-bold">{key}</span>
                  );
                };

                if (!quizMeta) {
                  // Fallback: render as flashcard if quiz metadata missing
                  const isFlipped = flippedCards[card.id];
                  const bgGradient = gradients[card.id % gradients.length];
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
                        <div
                          className="absolute w-full h-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:shadow-xl transition-shadow hover:border-blue-300"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          {card.chapter && (
                            <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              {card.chapter}
                            </div>
                          )}
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
                          <span className="absolute top-4 right-4 text-gray-300 font-mono">#{card.id}</span>
                          <h2 className="text-sm font-semibold text-gray-500 mb-2 mt-4 max-h-10 overflow-hidden line-clamp-2">
                            {card.title || 'Câu hỏi'}
                          </h2>
                          <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug flex-1 flex items-center">{card.front}</h3>
                          <div className="absolute bottom-5 flex items-center text-blue-500 text-sm font-medium animate-pulse">
                            <span>Nhấn để lật xem chi tiết</span>
                          </div>
                        </div>

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
                                {card.back.split('\n').map((line, lineIdx) => (
                                  <li key={lineIdx} className="flex items-start text-[15px] leading-relaxed">
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
                }

                return (
                  <div key={card.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold uppercase tracking-wide">
                          Chương {card.chapter || '1'}
                        </span>
                        <span className="text-slate-400 font-semibold">Câu hỏi #{idx + 1}</span>
                      </div>

                      <h3 className="text-[18px] md:text-xl font-bold text-slate-900 leading-relaxed">
                        {card.front}
                      </h3>

                      <div className="space-y-3">
                        {Object.entries(quizMeta.options || {}).map(([key, text]) => (
                          <button
                            key={key}
                            onClick={() => handleQuizSelect(card.id, key)}
                            className={optionClass(key)}
                            disabled={isAnswered}
                          >
                            {optionIcon(key)}
                            <span className="mt-0.5 text-left">{text}</span>
                          </button>
                        ))}
                      </div>

                      {isAnswered && (
                        <div className={`mt-2 p-4 sm:p-5 border rounded-xl animate-slide-down shadow-[0_12px_30px_-18px_rgba(0,0,0,0.25)] ${isCorrect ? 'bg-emerald-50 border-emerald-200' : 'bg-amber-50 border-amber-200'}`}>
                          <div className="flex items-start gap-3">
                            <div className={`mt-1 flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>
                            </div>
                            <div className="space-y-1">
                              <div className={`text-sm font-extrabold uppercase tracking-wide ${isCorrect ? 'text-emerald-700' : 'text-amber-700'}`}>
                                {isCorrect ? 'Tuyệt vời! Giải thích chi tiết:' : 'Rất tiếc! Cùng xem giải thích nhé:'}
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[15px]">{quizMeta.explanation || 'Không có giải thích.'}</p>
                              {!isCorrect && quizMeta.correct && (
                                <p className="text-slate-600 text-sm mt-1">Đáp án đúng: {quizMeta.correct}</p>
                              )}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        filteredCards.length === 0 ? (
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
                      <div
                        className="absolute w-full h-full bg-white rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center border border-gray-200 hover:shadow-xl transition-shadow hover:border-blue-300"
                        style={{
                          backfaceVisibility: 'hidden',
                        }}
                      >
                        {card.chapter && (
                          <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                            {card.chapter}
                          </div>
                        )}

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

                        <h2 className="text-sm font-semibold text-gray-500 mb-2 mt-4 max-h-10 overflow-hidden line-clamp-2">
                          {card.title || 'Câu hỏi'}
                        </h2>

                        <h3 className="text-xl md:text-2xl font-bold text-gray-800 leading-snug flex-1 flex items-center">
                          {card.front}
                        </h3>

                        <div className="absolute bottom-5 flex items-center text-blue-500 text-sm font-medium animate-pulse">
                          <span>Nhấn để lật xem chi tiết</span>
                        </div>
                      </div>

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
        )
      )}

      <CreateCardModal
        deckId={deckId}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCardCreated={handleCardCreated}
        chapters={chapters.filter(ch => ch !== 'Tất cả')}
      />

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
