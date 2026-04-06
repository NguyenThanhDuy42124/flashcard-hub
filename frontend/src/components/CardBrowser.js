import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decksAPI, cardsAPI } from '../api';
import CreateCardModal from './CreateCardModal';
import DeckQuizMode from './DeckQuizMode';
import DeckQuickReviewMode from './DeckQuickReviewMode';

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
  const [selectedChapters, setSelectedChapters] = useState(['Tất cả']);
  const [chapters, setChapters] = useState([]);
  const [flippedCards, setFlippedCards] = useState({});
  const [sortBy, setSortBy] = useState('chapter');
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCards, setSelectedCards] = useState(new Set());
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newTag, setNewTag] = useState('');
  const [isBulkAddOpen, setIsBulkAddOpen] = useState(false);
  const [bulkHtml, setBulkHtml] = useState('');
  const [bulkFileName, setBulkFileName] = useState('');
  const [isBulkChapterOpen, setIsBulkChapterOpen] = useState(false);
  const [bulkChapter, setBulkChapter] = useState('');
  const [bulkUpdating, setBulkUpdating] = useState(false);
  const [editFocus, setEditFocus] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editCard, setEditCard] = useState(null);
  const [editForm, setEditForm] = useState({ front: '', back: '', title: '', chapter: '' });
  const [editOptions, setEditOptions] = useState([]);
  const [editCorrect, setEditCorrect] = useState('');
  const [editExplanation, setEditExplanation] = useState('');
  const [editPosition, setEditPosition] = useState('');
  const [togglingAdd, setTogglingAdd] = useState(false);
  const [exportingFormat, setExportingFormat] = useState(null);
  const [isDeckQuizMode, setIsDeckQuizMode] = useState(false);
  const [isDeckQuickMode, setIsDeckQuickMode] = useState(false);

  // Giữ selection đồng bộ khi danh sách thẻ thay đổi
  useEffect(() => {
    setSelectedCards((prev) => {
      const cardIds = new Set(cards.map((c) => c.id));
      const next = new Set();
      prev.forEach((id) => {
        if (cardIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [cards]);
  const isAdmin = localStorage.getItem('flashcardAdmin') === 'true';
  const addingLocked = deck && deck.allow_card_additions === false && !isAdmin;

  const deriveChapters = (cardList) => [
    'Tất cả',
    ...new Set(
      cardList
        .map(card => card.chapter || 'General')
        .filter(ch => ch)
    )
  ];

  const reloadCards = useCallback(async () => {
    const cardsResponse = await decksAPI.getDeckCards(deckId, sortBy, null);
    const allCards = cardsResponse.data;
    setCards(allCards);
    setChapters(deriveChapters(allCards));
  }, [deckId, sortBy]);

  useEffect(() => {
    const fetchDeckAndCards = async () => {
      try {
        setLoading(true);
        const deckResponse = await decksAPI.getDeck(deckId);
        setDeck(deckResponse.data);
        setNewTag(deckResponse.data.tag || '');
        setNewDescription(deckResponse.data.description || '');

        await reloadCards();
        setError(null);
      } catch (err) {
        console.error('Failed to fetch deck:', err);
        setError(err.response?.data?.detail || 'Không thể tải deck. Vui lòng thử lại.');
      } finally {
        setLoading(false);
      }
    };

    fetchDeckAndCards();
  }, [deckId, sortBy, reloadCards]);

  const filteredCards = cards.filter(card => {
    const chapterMatch = selectedChapters.includes('Tất cả') || selectedChapters.includes(card.chapter || 'General');
    const searchMatch = !searchTerm ||
      (card.front && card.front.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (card.title && card.title.toLowerCase().includes(searchTerm.toLowerCase()));
    return chapterMatch && searchMatch;
  });

  const toggleChapterFilter = (chapter) => {
    setSelectedChapters((prev) => {
      if (chapter === 'Tất cả') {
        return ['Tất cả'];
      }

      const withoutAll = prev.filter((c) => c !== 'Tất cả');
      const exists = withoutAll.includes(chapter);

      if (exists) {
        const next = withoutAll.filter((c) => c !== chapter);
        return next.length ? next : ['Tất cả'];
      }

      return [...withoutAll, chapter];
    });
  };

  const filteredIds = filteredCards.map(c => c.id);
  const allFilteredSelected = filteredIds.length > 0 && filteredIds.every(id => selectedCards.has(id));

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
    setCards(prev => {
      const next = [...prev, newCard];
      setChapters(deriveChapters(next));
      return next;
    });
  };

  const handleDeleteCard = async (cardId, e) => {
    e.stopPropagation();
    if (!window.confirm('Bạn có chắc chắn muốn xóa thẻ này?')) return;
    try {
      await cardsAPI.deleteCard(cardId);
      setCards(prev => {
        const next = prev.filter(c => c.id !== cardId);
        setChapters(deriveChapters(next));
        return next;
      });
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
    if (!window.confirm(`Bạn có chắc chắn muốn xóa ${selectedCards.size} thẻ đã chọn (theo bộ lọc hiện tại)?`)) return;
    try {
      for (const cardId of selectedCards) {
        await cardsAPI.deleteCard(cardId);
      }
      setCards(prev => {
        const next = prev.filter(c => !selectedCards.has(c.id));
        setChapters(deriveChapters(next));
        return next;
      });
      setSelectedCards(new Set());
      alert('Đã xóa thành công');
    } catch (err) {
      alert('Lỗi khi xóa nhiều thẻ');
    }
  };

  const handleBulkChapterUpdate = async () => {
    if (selectedCards.size === 0) return;
    const newChapter = bulkChapter.trim();
    setBulkUpdating(true);
    try {
      for (const cardId of selectedCards) {
        const card = cards.find(c => c.id === cardId);
        if (!card) continue;
        await cardsAPI.updateCard(cardId, {
          front: card.front || '',
          back: card.back || '',
          title: card.title || '',
          chapter: newChapter || null,
          position: card.position || undefined,
        });
      }

      setCards(prev => {
        const updated = prev.map(c => selectedCards.has(c.id) ? { ...c, chapter: newChapter || null } : c);
        setChapters(deriveChapters(updated));
        return updated;
      });

      alert('Đã cập nhật chương cho thẻ đã chọn');
      setIsBulkChapterOpen(false);
      setBulkChapter('');
    } catch (err) {
      alert('Lỗi khi cập nhật chương hàng loạt');
    } finally {
      setBulkUpdating(false);
    }
  };

  const handleSelectFiltered = (mode) => {
    setSelectedCards(prev => {
      const next = new Set(prev);
      if (mode === 'clear') {
        filteredIds.forEach(id => next.delete(id));
        return next;
      }
      if (mode === 'toggle-all') {
        if (allFilteredSelected) {
          filteredIds.forEach(id => next.delete(id));
        } else {
          filteredIds.forEach(id => next.add(id));
        }
        return next;
      }
      return next;
    });
  };

  const handleUpdateTitle = async () => {
    try {
      await decksAPI.updateDeck(deckId, {
        ...deck,
        title: newTitle || deck.title,
        description: newDescription?.trim() || null,
        tag: newTag || null,
      });
      setDeck(prev => ({
        ...prev,
        title: newTitle || deck.title,
        description: newDescription?.trim() || null,
        tag: newTag || null,
      }));
      setIsEditingTitle(false);
    } catch (err) {
      alert('Lỗi khi cập nhật tên deck');
    }
  };

  const handleBulkAddHtml = async () => {
    if (!bulkHtml.trim()) return;
    try {
      setLoading(true);
      await decksAPI.appendCardsFromHtml(deckId, bulkHtml, isAdmin && deck?.allow_card_additions === false);
      await reloadCards();
      setIsBulkAddOpen(false);
      setBulkHtml('');
      setBulkFileName('');
      alert('Đã thêm thẻ hàng loạt thành công!');
    } catch (err) {
      alert('Lỗi: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleBulkFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setBulkHtml(reader.result || '');
      setBulkFileName(file.name);
    };
    reader.onerror = () => {
      alert('Không đọc được file HTML');
      setBulkFileName('');
    };
    reader.readAsText(file, 'utf-8');
  };

  const closeEditModal = () => {
    setIsEditOpen(false);
    setEditFocus(null);
  };

  const openEditModal = (card, focusField = null) => {
    const quizMeta = parseQuizMeta(card);
    setEditFocus(focusField);
    setEditCard(card);
    setEditPosition(card.position ? String(card.position) : '');
    if (quizMeta) {
      setEditForm({
        front: card.front || '',
        back: '',
        title: card.title || card.front || '',
        chapter: card.chapter || '',
      });
      const entries = Object.entries(quizMeta.options || {});
      setEditOptions(entries.map(([key, text]) => ({ key, text })));
      setEditCorrect(quizMeta.correct || '');
      setEditExplanation(quizMeta.explanation || '');
    } else {
      setEditForm({
        front: card.front || '',
        back: card.back || '',
        title: card.title || '',
        chapter: card.chapter || '',
      });
      setEditOptions([]);
      setEditCorrect('');
      setEditExplanation('');
    }
    setIsEditOpen(true);
  };

  const handleUpdateCard = async () => {
    if (!editCard) return;
    try {
      setLoading(true);
      const quizMeta = parseQuizMeta(editCard);
      let payload;
      const positionValue = editPosition ? parseInt(editPosition, 10) : null;

      if (quizMeta) {
        const optionsObject = {};
        editOptions.forEach((opt, idx) => {
          const key = (opt.key || String.fromCharCode(65 + idx)).trim() || String.fromCharCode(65 + idx);
          optionsObject[key] = opt.text || '';
        });
        const meta = {
          type: 'quiz',
          options: optionsObject,
          correct: editCorrect,
          explanation: editExplanation,
        };
        payload = {
          front: editForm.front.trim(),
          back: '__QUIZ__::' + JSON.stringify(meta),
          title: editForm.front.trim() || null,
          chapter: editForm.chapter || null,
          position: positionValue || undefined,
        };
      } else {
        payload = {
          front: editForm.front.trim(),
          back: editForm.back.trim(),
          title: editForm.title.trim() || null,
          chapter: editForm.chapter || null,
          position: positionValue || undefined,
        };
      }

      await cardsAPI.updateCard(editCard.id, payload);
      await reloadCards();
      closeEditModal();
      setEditCard(null);
    } catch (err) {
      alert('Lỗi khi cập nhật thẻ: ' + (err.response?.data?.detail || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleEditOptionChange = (index, field, value) => {
    setEditOptions(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const addEditOption = () => {
    setEditOptions(prev => [...prev, { key: String.fromCharCode(65 + prev.length), text: '' }]);
  };

  const removeEditOption = (index) => {
    setEditOptions(prev => prev.filter((_, i) => i !== index));
  };

  const handleReorder = async (card, direction, e) => {
    e?.stopPropagation();
    if (!isAdmin) return;
    if (sortBy !== 'position') {
      alert('Hãy sắp xếp theo thứ tự để thay đổi vị trí.');
      return;
    }

    const ordered = [...cards].sort((a, b) => (a.position || 0) - (b.position || 0));
    const idx = ordered.findIndex(c => c.id === card.id);
    if (idx === -1) return;
    let targetPos = ordered[idx].position || idx + 1;

    if (direction === 'up') targetPos = Math.max(1, targetPos - 1);
    if (direction === 'down') targetPos = Math.min(ordered.length, targetPos + 1);
    if (direction === 'top') targetPos = 1;
    if (direction === 'bottom') targetPos = ordered.length;

    try {
      await cardsAPI.reorderCard(card.id, targetPos);
      await reloadCards();
    } catch (err) {
      alert('Không thể đổi vị trí: ' + (err.response?.data?.detail || err.message));
    }
  };

  const handleToggleAdding = async () => {
    if (!deck) return;
    const nextValue = !(deck.allow_card_additions ?? true);
    try {
      setTogglingAdd(true);
      await decksAPI.updateDeck(deckId, { allow_card_additions: nextValue });
      setDeck(prev => prev ? { ...prev, allow_card_additions: nextValue } : prev);
    } catch (err) {
      alert('Không thể cập nhật quyền thêm thẻ: ' + (err.response?.data?.detail || err.message));
    } finally {
      setTogglingAdd(false);
    }
  };

  const handleExportDeck = async (format) => {
    try {
      setExportingFormat(format);
      const selectedChapterList = selectedChapters.filter(ch => ch !== 'Tất cả');
      const exportOptions = {
        sortBy,
        chapters: selectedChapterList.length ? selectedChapterList.join(',') : null,
      };
      const response = await decksAPI.exportDeck(deckId, format, exportOptions);
      const blobData = response.data instanceof Blob
        ? response.data
        : new Blob([response.data], { type: format === 'docx' ? 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' : 'text/html' });

      const url = window.URL.createObjectURL(blobData);
      const link = document.createElement('a');
      const safeTitle = (deck?.title || 'deck').replace(/[^a-z0-9-_]/gi, '_').toLowerCase();
      link.href = url;
      link.download = `${safeTitle}.${format === 'docx' ? 'docx' : 'html'}`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Không thể xuất deck: ' + (err.response?.data?.detail || err.message));
    } finally {
      setExportingFormat(null);
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
    <div className="min-h-screen deck-shell rounded-2xl overflow-hidden border border-black/5">
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
            <div className="flex flex-col items-end gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => { if (!addingLocked) setIsModalOpen(true); else alert('Deck đã khóa, không thể thêm thẻ.'); }}
                  disabled={addingLocked}
                  className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap ${addingLocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                >
                  + Thêm 1 Card
                </button>
                <button
                  onClick={() => { if (!addingLocked) setIsBulkAddOpen(true); else alert('Deck đã khóa, không thể thêm thẻ.'); }}
                  disabled={addingLocked}
                  className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap ${addingLocked ? 'bg-gray-400 text-white cursor-not-allowed' : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  + Thêm hàng loạt
                </button>
              </div>
              <div className="flex flex-wrap gap-2 justify-end w-full">
                <button
                  onClick={() => setIsDeckQuickMode(true)}
                  className="px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap border border-cyan-200 text-cyan-700 bg-cyan-50 hover:bg-cyan-100"
                >
                  ⚡ Xem nhanh
                </button>
                <button
                  onClick={() => setIsDeckQuizMode(true)}
                  className="px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap border border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                >
                  🧠 Làm Quiz
                </button>
                <button
                  onClick={() => handleExportDeck('html')}
                  disabled={!!exportingFormat}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 ${exportingFormat ? 'opacity-60 cursor-wait' : ''}`}
                >
                  ⬇️ Xuất HTML
                </button>
                <button
                  onClick={() => handleExportDeck('docx')}
                  disabled={!!exportingFormat}
                  className={`px-3 sm:px-4 py-2 rounded-lg font-medium text-sm whitespace-nowrap border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 ${exportingFormat ? 'opacity-60 cursor-wait' : ''}`}
                >
                  ⬇️ Xuất DOCX
                </button>
              </div>
              {isAdmin && (
                <button
                  onClick={handleToggleAdding}
                  disabled={togglingAdd}
                  className={`px-3 sm:px-6 py-2 rounded-lg font-medium transition text-sm whitespace-nowrap ${togglingAdd ? 'bg-gray-400 text-white cursor-wait' : (deck?.allow_card_additions === false ? 'bg-orange-600 text-white hover:bg-orange-700' : 'bg-amber-500 text-white hover:bg-amber-600')}`}
                >
                  {deck?.allow_card_additions === false ? 'Bật lại cho user được thêm thẻ' : 'Khóa thêm thẻ cho user'}
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
              <div className="flex flex-col items-center gap-3 mb-2 sm:mb-4 w-full max-w-2xl mx-auto">
                <input
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="text-2xl sm:text-3xl font-bold text-gray-900 border-b-2 border-blue-500 focus:outline-none text-center px-2 py-1 w-full"
                  autoFocus
                  placeholder="Tên deck"
                />
                <input
                  type="text"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="text-sm sm:text-base text-gray-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 text-center px-2 py-1 w-full"
                  placeholder="Mô tả ngắn dưới tên deck"
                />
                <div className="flex items-center gap-2">
                  <button onClick={handleUpdateTitle} className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600">✓</button>
                  <button onClick={() => setIsEditingTitle(false)} className="p-2 bg-gray-400 text-white rounded-full hover:bg-gray-500">✕</button>
                </div>
              </div>
            ) : (
              <div className="flex justify-center items-center gap-2">
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-2 sm:mb-4 line-clamp-2">
                  {deck.title}
                </h1>
                {isAdmin && (
                  <button onClick={() => { setNewTitle(deck.title); setNewDescription(deck.description || ''); setIsEditingTitle(true); }} className="text-gray-400 hover:text-blue-500 self-start mt-2">
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
                <option value="position">📌 Sắp xếp theo Thứ tự</option>
                <option value="chapter">📚 Sắp xếp theo Chương</option>
                <option value="title">📝 Sắp xếp theo Tiêu đề</option>
                <option value="created">🕐 Mới nhất trước</option>
              </select>

              <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-1">
                <input
                  type="text"
                  placeholder="🔍 Tìm kiếm tựa đề/câu hỏi..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="px-3 sm:px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-full text-sm"
                />

                {deck.tag === 'Quiz' && (
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
                )}
              </div>

              {isAdmin && selectedCards.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="px-3 sm:px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium transition text-sm whitespace-nowrap"
                >
                  🗑️ Xóa ({selectedCards.size})
                </button>
              )}
              {isAdmin && selectedCards.size > 0 && (
                <button
                  onClick={() => setIsBulkChapterOpen(true)}
                  className="px-3 sm:px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium transition text-sm whitespace-nowrap"
                >
                  ✏️ Sửa chương ({selectedCards.size})
                </button>
              )}
            </div>

            <div className="text-xs sm:text-sm text-gray-600 font-medium text-center sm:text-right order-1 sm:order-2 shrink-0">
              Hiển thị {filteredCards.length} / {cards.length} cards
            </div>
          </div>

          {isAdmin && (
            <div className="flex flex-wrap gap-2 mb-4 sm:mb-6 items-center bg-white border border-gray-200 rounded-lg px-3 py-2 shadow-sm">
              <span className="text-xs sm:text-sm text-gray-600 font-semibold">Chọn nhanh:</span>
              <button
                onClick={() => handleSelectFiltered('toggle-all')}
                className={`px-3 py-1 rounded-lg text-sm font-medium border ${allFilteredSelected ? 'bg-emerald-100 text-emerald-700 border-emerald-200' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'}`}
              >
                {allFilteredSelected ? 'Bỏ chọn tất cả (đang lọc)' : 'Chọn tất cả (đang lọc)'}
              </button>
              <button
                onClick={() => handleSelectFiltered('clear')}
                className="px-3 py-1 rounded-lg text-sm font-medium border bg-white text-gray-700 hover:bg-gray-100 border-gray-200"
              >
                Bỏ chọn trong bộ lọc
              </button>
              <span className="text-xs sm:text-sm text-gray-600">Đang chọn: {selectedCards.size}</span>
            </div>
          )}

          {chapters.length > 1 && (
            <div className="flex flex-wrap justify-center gap-1 sm:gap-2">
              {chapters.map(chapter => (
                <button
                  key={chapter}
                  onClick={() => toggleChapterFilter(chapter)}
                  className={`px-2 sm:px-4 py-1 sm:py-2 rounded-full font-medium transition text-xs sm:text-sm ${
                    selectedChapters.includes(chapter)
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
      {isDeckQuickMode ? (
        <DeckQuickReviewMode
          deckId={deckId}
          deckTitle={deck.title}
          chapters={chapters}
          onExit={() => setIsDeckQuickMode(false)}
        />
      ) : isDeckQuizMode ? (
        <DeckQuizMode
          deckId={deckId}
          deckTitle={deck.title}
          chapters={chapters}
          onExit={() => setIsDeckQuizMode(false)}
        />
      ) : deck.tag === 'Quiz' ? (
        <div className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
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

                const optionClass = (key) => {
                  const base = 'w-full text-left p-4 rounded-xl border-2 transition-all duration-150 flex items-start gap-3 font-semibold shadow-sm';
                  if (!quizMeta || !isAnswered) return `${base} border-slate-200 bg-white hover:-translate-y-0.5 hover:border-blue-400 hover:bg-blue-50 text-slate-800`;
                  if (key === quizMeta.correct) return `${base} border-emerald-400 bg-emerald-50 text-emerald-800 shadow-[0_12px_28px_-18px_rgba(16,185,129,0.7)] cursor-default`;
                  if (key === userAnswer) return `${base} border-rose-400 bg-rose-50 text-rose-800 shadow-[0_12px_28px_-18px_rgba(244,63,94,0.65)] cursor-default`;
                  return `${base} border-slate-100 bg-slate-50 text-slate-400 opacity-70 cursor-not-allowed`;
                };

                const optionIcon = (key) => {
                  if (!quizMeta || !isAnswered) return (
                    <span className="option-key-badge flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-100 text-slate-500 rounded-lg text-sm font-bold">
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
                    <span className="option-key-badge flex-shrink-0 w-7 h-7 flex items-center justify-center bg-slate-200 text-slate-400 rounded-lg text-sm font-bold">{key}</span>
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
                            <div className="chapter-badge absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1">
                              <span>{card.chapter}</span>
                              {isAdmin && (
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(card, 'chapter'); }}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Sửa chương"
                                >
                                  ✎
                                </button>
                              )}
                            </div>
                          )}
                          {isAdmin && (
                            <div className="absolute top-3 right-3 flex flex-col items-end gap-2 text-xs">
                              <div className="flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1 shadow-sm text-gray-700">
                                <span className="font-semibold">Vị trí</span>
                                <span className="text-blue-600 font-bold">{card.position ?? '—'}</span>
                              </div>
                              <div className="flex gap-1">
                                <button onClick={(e) => handleReorder(card, 'top', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏫</button>
                                <button onClick={(e) => handleReorder(card, 'up', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↑</button>
                                <button onClick={(e) => handleReorder(card, 'down', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↓</button>
                                <button onClick={(e) => handleReorder(card, 'bottom', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏬</button>
                              </div>
                              <div className="flex gap-2 items-center bg-white/90 px-2 py-1 rounded-lg shadow-sm">
                                <input
                                  type="checkbox"
                                  checked={selectedCards.has(card.id)}
                                  onChange={(e) => toggleSelectCard(card.id, e)}
                                  onClick={(e) => e.stopPropagation()}
                                  className="w-5 h-5 cursor-pointer accent-red-500"
                                />
                                <button
                                  onClick={(e) => { e.stopPropagation(); openEditModal(card); }}
                                  className="text-blue-500 hover:text-blue-700 bg-blue-50 rounded px-2 text-xs"
                                >
                                  Sửa
                                </button>
                                <button
                                  onClick={(e) => handleDeleteCard(card.id, e)}
                                  className="text-red-500 hover:text-red-700 bg-red-50 rounded px-2 text-xs"
                                >
                                  Xóa
                                </button>
                              </div>
                            </div>
                          )}
                          <span className="absolute top-4 right-4 text-gray-300 font-mono">#{card.id}</span>
                          <h2 className="text-base md:text-lg font-semibold text-blue-700 mb-2 mt-8 md:mt-9 max-h-14 overflow-hidden line-clamp-2 leading-snug">
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
                        <span className="chapter-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 font-bold uppercase tracking-wide">
                          Chương {card.chapter || '1'}
                          {isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(card, 'chapter'); }}
                              className="ml-1 text-blue-600 hover:text-blue-800"
                              title="Sửa chương"
                            >
                              ✎
                            </button>
                          )}
                        </span>
                        <div className="flex items-center gap-3 text-slate-400 font-semibold">
                          <span>Câu hỏi #{idx + 1}</span>
                          {isAdmin && (
                            <button
                              onClick={() => openEditModal(card)}
                              className="text-blue-500 hover:text-blue-700 text-xs font-bold"
                            >
                              ✎ Sửa
                            </button>
                          )}
                        </div>
                      </div>

                      <h3 className="text-[18px] md:text-xl font-bold text-slate-900 leading-relaxed">
                        {card.front}
                      </h3>

                      <div className="space-y-3">
                        {Object.entries(quizMeta.options || {}).map(([key, text]) => (
                          <button
                            key={key}
                            onClick={() => handleQuizSelect(card.id, key)}
                            className={`${optionClass(key)} option-card`}
                            disabled={isAnswered}
                          >
                            {optionIcon(key)}
                            <span className="mt-0.5 text-left">{text}</span>
                          </button>
                        ))}
                      </div>

                      {isAnswered && quizMeta?.explanation && (
                        <div className="mt-4 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
                          <div className="flex items-center gap-2 font-semibold text-sm uppercase tracking-wide text-amber-700">
                            <span role="img" aria-label="info">💡</span>
                            Giải thích
                          </div>
                          <p className="explanation-text mt-2 leading-relaxed text-sm sm:text-base">{quizMeta.explanation}</p>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="absolute top-3 right-3 flex flex-col items-end gap-2 text-xs">
                          <div className="flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1 shadow-sm text-gray-700">
                            <span className="font-semibold">Vị trí</span>
                            <span className="text-blue-600 font-bold">{card.position ?? '—'}</span>
                          </div>
                          <div className="flex gap-1">
                            <button onClick={(e) => handleReorder(card, 'top', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏫</button>
                            <button onClick={(e) => handleReorder(card, 'up', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↑</button>
                            <button onClick={(e) => handleReorder(card, 'down', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↓</button>
                            <button onClick={(e) => handleReorder(card, 'bottom', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏬</button>
                          </div>
                          <div className="flex gap-2 items-center bg-white/90 px-2 py-1 rounded-lg shadow-sm">
                            <input
                              type="checkbox"
                              checked={selectedCards.has(card.id)}
                              onChange={(e) => toggleSelectCard(card.id, e)}
                              onClick={(e) => e.stopPropagation()}
                              className="w-5 h-5 cursor-pointer accent-red-500"
                            />
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(card); }}
                              className="text-blue-500 hover:text-blue-700 bg-blue-50 rounded px-2 text-xs"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={(e) => handleDeleteCard(card.id, e)}
                              className="text-red-500 hover:text-red-700 bg-red-50 rounded px-2 text-xs"
                            >
                              Xóa
                            </button>
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
                          <div className="absolute top-3 right-3 flex flex-col items-end gap-2 text-xs">
                            <div className="flex items-center gap-2 bg-white/90 rounded-lg px-2 py-1 shadow-sm text-gray-700">
                              <span className="font-semibold">Vị trí</span>
                              <span className="text-blue-600 font-bold">{card.position ?? '—'}</span>
                            </div>
                            <div className="flex gap-1">
                              <button onClick={(e) => handleReorder(card, 'top', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏫</button>
                              <button onClick={(e) => handleReorder(card, 'up', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↑</button>
                              <button onClick={(e) => handleReorder(card, 'down', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">↓</button>
                              <button onClick={(e) => handleReorder(card, 'bottom', e)} className="px-2 py-1 rounded bg-gray-100 hover:bg-gray-200 text-gray-700">⏬</button>
                            </div>
                            <div className="flex gap-2 items-center bg-white/90 px-2 py-1 rounded-lg shadow-sm">
                              <input
                                type="checkbox"
                                checked={selectedCards.has(card.id)}
                                onChange={(e) => toggleSelectCard(card.id, e)}
                                onClick={(e) => e.stopPropagation()}
                                className="w-5 h-5 cursor-pointer accent-red-500"
                              />
                              <button
                                onClick={(e) => { e.stopPropagation(); openEditModal(card); }}
                                className="text-blue-500 hover:text-blue-700 bg-blue-50 rounded px-2 text-xs"
                              >
                                Sửa
                              </button>
                              <button
                                onClick={(e) => handleDeleteCard(card.id, e)}
                                className="text-red-500 hover:text-red-700 bg-red-50 rounded px-2 text-xs"
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        )}

                        <span className="absolute top-4 right-4 text-gray-300 font-mono">
                          #{card.id}
                        </span>

                        <div className="flex items-start gap-2 text-sm font-semibold text-gray-500 mb-2 mt-7 md:mt-8 max-h-10 overflow-hidden">
                          <span className="line-clamp-2">{card.title || 'Câu hỏi'}</span>
                          {isAdmin && (
                            <button
                              onClick={(e) => { e.stopPropagation(); openEditModal(card, 'title'); }}
                              className="text-blue-500 hover:text-blue-700"
                              title="Sửa tiêu đề"
                            >
                              ✎
                            </button>
                          )}
                        </div>

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
        adminOverride={isAdmin && deck?.allow_card_additions === false}
      />

      {/* Edit Card Modal */}
      {isEditOpen && editCard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">✎ Chỉnh sửa thẻ</h3>
              <button onClick={closeEditModal} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Tiêu đề (optional)</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="Nhập tiêu đề"
                    autoFocus={editFocus === 'title'}
                  />
                </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Chương</label>
                <input
                  type="text"
                  value={editForm.chapter}
                  onChange={(e) => setEditForm(prev => ({ ...prev, chapter: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    placeholder="VD: Chương 1"
                    autoFocus={editFocus === 'chapter'}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Vị trí (số thứ tự)</label>
                <input
                  type="number"
                  min="1"
                  value={editPosition}
                  onChange={(e) => setEditPosition(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Nhập số thứ tự mới"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Câu hỏi / Mặt trước</label>
              <textarea
                value={editForm.front}
                onChange={(e) => setEditForm(prev => ({ ...prev, front: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {!parseQuizMeta(editCard) && (
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mặt sau</label>
                <textarea
                  value={editForm.back}
                  onChange={(e) => setEditForm(prev => ({ ...prev, back: e.target.value }))}
                  rows={5}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            )}

            {parseQuizMeta(editCard) && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-gray-700">Phương án</label>
                  {editOptions.map((opt, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input
                        type="text"
                        value={opt.key}
                        onChange={(e) => handleEditOptionChange(idx, 'key', e.target.value)}
                        className="w-16 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder={String.fromCharCode(65 + idx)}
                      />
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) => handleEditOptionChange(idx, 'text', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                        placeholder="Nội dung đáp án"
                      />
                      <button
                        onClick={() => removeEditOption(idx)}
                        className="text-red-500 hover:text-red-700 text-sm"
                      >
                        Xóa
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={addEditOption}
                    className="px-3 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200 text-sm"
                  >
                    + Thêm phương án
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Đáp án đúng</label>
                    <input
                      type="text"
                      value={editCorrect}
                      onChange={(e) => setEditCorrect(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="A / B / 1 / 2 ..."
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">Giải thích</label>
                    <input
                      type="text"
                      value={editExplanation}
                      onChange={(e) => setEditExplanation(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      placeholder="Tùy chọn"
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-3">
              <button
                onClick={closeEditModal}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
              >
                Hủy
              </button>
              <button
                onClick={handleUpdateCard}
                className={`px-5 py-2 rounded-lg text-white font-semibold ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                disabled={loading}
              >
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}

      {isBulkAddOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 min-p-4">
          <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-3xl flex flex-col max-h-[90vh]">
            <h2 className="text-2xl font-bold mb-4 text-gray-800">Thêm thẻ hàng loạt (HTML)</h2>
            <p className="text-gray-600 text-sm mb-4">
              Tải file HTML có sẵn hoặc dán mã HTML chứa các thẻ. Hệ thống sẽ tự động đọc và thêm vào deck hiện tại.
            </p>

            <div className="flex flex-col gap-2 mb-4 p-4 border border-dashed border-gray-300 rounded-lg bg-gray-50">
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 bg-blue-600 text-white rounded-lg cursor-pointer hover:bg-blue-700">
                  Chọn file HTML
                  <input
                    type="file"
                    accept=".html,.htm,text/html"
                    className="hidden"
                    onChange={handleBulkFileSelect}
                  />
                </label>
                <div className="text-sm text-gray-700">
                  {bulkFileName ? `Đã chọn: ${bulkFileName}` : 'Chưa chọn file'}
                </div>
              </div>
              <span className="text-xs text-gray-500">Hoặc dán trực tiếp nội dung HTML vào ô bên dưới.</span>
            </div>

            <textarea
              value={bulkHtml}
              onChange={(e) => setBulkHtml(e.target.value)}
              placeholder="<div className='card-list'>...</div>"
              className="flex-1 w-full p-4 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-green-500 mb-6 resize-none"
            ></textarea>

            <div className="flex justify-end gap-3 mt-auto">
              <button
                onClick={() => { setIsBulkAddOpen(false); setBulkHtml(''); setBulkFileName(''); }}
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

      {isBulkChapterOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">✏️ Đổi chương hàng loạt</h3>
              <button
                onClick={() => { setIsBulkChapterOpen(false); setBulkChapter(''); }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                ×
              </button>
            </div>

            <p className="text-sm text-gray-600">
              Áp dụng cho {selectedCards.size} thẻ đã chọn. Để trống để xóa chương.
            </p>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Tên chương mới</label>
              <input
                type="text"
                value={bulkChapter}
                onChange={(e) => setBulkChapter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                placeholder="VD: Chương 2 - Mạng"
              />
              <div className="text-xs text-gray-500">Để trống nếu muốn xóa giá trị chương.</div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => { setIsBulkChapterOpen(false); setBulkChapter(''); }}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled={bulkUpdating}
              >
                Hủy
              </button>
              <button
                onClick={handleBulkChapterUpdate}
                className={`px-5 py-2 rounded-lg text-white font-semibold ${bulkUpdating ? 'bg-gray-400 cursor-wait' : 'bg-indigo-600 hover:bg-indigo-700'}`}
                disabled={bulkUpdating}
              >
                {bulkUpdating ? 'Đang cập nhật...' : 'Cập nhật chương'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CardBrowser;
