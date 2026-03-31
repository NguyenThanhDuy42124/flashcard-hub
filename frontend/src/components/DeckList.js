import React, { useState, useEffect } from 'react';
import { decksAPI } from '../api';

const DeckList = () => {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const isAdmin = localStorage.getItem('flashcardAdmin') === 'true';

  useEffect(() => {
    fetchDecks();
  }, [selectedTag]);

  const fetchDecks = async () => {
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
  };

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
        <div className="flex gap-4 mb-4">
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
                  {deck.tag && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                      {deck.tag}
                    </span>
                  )}
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
    </div>
  );
};

export default DeckList;
