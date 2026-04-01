import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { decksAPI } from '../api';

const DeckList = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [isQuickOpen, setIsQuickOpen] = useState(false);
  const [quickName, setQuickName] = useState('');
  const [quickDesc, setQuickDesc] = useState('');
  const [quickContent, setQuickContent] = useState('');
  const [quickLoading, setQuickLoading] = useState(false);
  const [quickError, setQuickError] = useState(null);
  const isAdmin = localStorage.getItem('flashcardAdmin') === 'true';
  const navigate = useNavigate();

  const fetchDecks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await decksAPI.listDecks(0, 50, selectedTag);
      setDecks(response.data);
      
      // Extract unique tags
      const uniqueTags = [...new Set(response.data.map(d => d.tag).filter(Boolean))];
      setTags(uniqueTags);
    } catch (err) {
      setError('Failed to load decks');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [selectedTag]);

  useEffect(() => {
    fetchDecks();
  }, [fetchDecks]);

  const handleDelete = async (deckId) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa deck này không?')) {
      try {
        await decksAPI.deleteDeck(deckId);
        setDecks(decks.filter(d => d.id !== deckId));
      } catch (err) {
        alert('Lỗi xóa deck');
      }
    }
  };

  const filteredDecks = decks.filter(deck =>
    deck.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleQuickPaste = async () => {
    if (!quickContent.trim()) {
      setQuickError('Vui lòng dán nội dung JSON/HTML');
      return;
    }
    try {
      setQuickLoading(true);
      setQuickError(null);
      const response = await decksAPI.pasteHtmlContent(quickContent, quickName, quickDesc);
      setIsQuickOpen(false);
      setQuickContent('');
      setQuickName('');
      setQuickDesc('');
      navigate(`/deck/${response.data.id}/cards`);
    } catch (err) {
      setQuickError(err.response?.data?.detail || err.message || 'Lỗi khi tạo deck');
    } finally {
      setQuickLoading(false);
    }
  };

  if (loading) return <div className="text-center py-8">Đang tải bộ deck...</div>;
  if (error) return <div className="text-red-600 text-center py-8">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-900 mb-2">📚 Bộ Flashcard</h1>
        <p className="text-gray-600">Duyệt và ôn tập các bộ flashcard tương tác</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:gap-4 mb-4">
          <input
            type="text"
            placeholder="Tìm kiếm bộ deck..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={() => setSelectedTag(null)}
            className={`px-4 py-2 rounded-lg font-medium ${
              !selectedTag ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
            }`}
          >
            Tất Cả
          </button>
          <button
            onClick={() => navigate('/exam/create')}
            className="px-4 py-2 rounded-lg font-medium bg-indigo-600 text-white hover:bg-indigo-700"
          >
            📝 Tạo đề
          </button>
          <button
            onClick={() => setIsQuickOpen(true)}
            className="px-4 py-2 rounded-lg font-medium bg-green-600 text-white hover:bg-green-700"
          >
            📥 Dán nhanh JSON/HTML
          </button>
        </div>
        
        {/* Tag Filter */}
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag}
              onClick={() => setSelectedTag(selectedTag === tag ? null : tag)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition ${
                selectedTag === tag
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Decks Grid */}
      {filteredDecks.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <p className="text-gray-600 text-lg">Không tìm thấy deck nào. Hãy tạo hoặc tải lên file HTML!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDecks.map((deck) => (
            <div
              key={deck.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition overflow-hidden"
            >
              <div className="bg-gradient-primary h-24 flex items-center justify-center text-white text-3xl">
                🎯
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{deck.title}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {deck.description || 'Không có mô tả'}
                </p>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-blue-600">
                    {deck.cards.length} thẻ
                  </span>
                  <span className={`text-xs px-2 py-1 rounded ${deck.tag === 'Quiz' ? 'bg-purple-100 text-purple-700' : deck.tag === 'Flashcard' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}`}>
                    {deck.tag || 'None'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/deck/${deck.id}/cards`}
                    className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-center font-medium hover:bg-blue-700 transition"
                  >
                    📖 Ôn Tập
                  </a>
                  {isAdmin && (
                  <button
                    onClick={() => handleDelete(deck.id)}
                    className="px-4 py-2 text-red-600 border border-red-600 rounded-lg hover:bg-red-50 transition"
                  >
                    🗑️ Xóa
                  </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quick Paste Modal */}
      {isQuickOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-3xl p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">📥 Dán nhanh JSON/HTML</h3>
              <button onClick={() => setIsQuickOpen(false)} className="text-gray-500 hover:text-gray-700 text-xl">×</button>
            </div>

            {quickError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {quickError}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Tên Deck (tùy chọn)</label>
                <input
                  type="text"
                  value={quickName}
                  onChange={(e) => setQuickName(e.target.value)}
                  placeholder="VD: Chương 1 - Quiz"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Mô tả (tùy chọn)</label>
                <input
                  type="text"
                  value={quickDesc}
                  onChange={(e) => setQuickDesc(e.target.value)}
                  placeholder="VD: Batch 1 - Giới thiệu & Lịch sử"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Nội dung JSON/HTML</label>
              <textarea
                value={quickContent}
                onChange={(e) => setQuickContent(e.target.value)}
                rows={14}
                placeholder="Dán JSON Quiz/Flashcard hoặc toàn bộ HTML có chứa dữ liệu"
                className="w-full px-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              />
              <div className="text-xs text-gray-500">Ký tự: {quickContent.length}</div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsQuickOpen(false)}
                className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 hover:bg-gray-300"
                disabled={quickLoading}
              >
                Hủy
              </button>
              <button
                onClick={handleQuickPaste}
                className={`px-5 py-2 rounded-lg text-white font-semibold ${quickLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700'}`}
                disabled={quickLoading}
              >
                {quickLoading ? 'Đang tạo...' : 'Tạo deck mới'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeckList;
