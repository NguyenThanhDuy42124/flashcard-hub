import React, { useState } from 'react';
import { decksAPI } from '../api';
import { useNavigate } from 'react-router-dom';

const DeckBuilder = () => {
  const [deckTitle, setDeckTitle] = useState('');
  const [deckDescription, setDeckDescription] = useState('');
  const [deckTag, setDeckTag] = useState('');
  const [cards, setCards] = useState([{ front: '', back: '' }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const handleAddCard = () => {
    setCards([...cards, { front: '', back: '' }]);
  };

  const handleRemoveCard = (index) => {
    setCards(cards.filter((_, i) => i !== index));
  };

  const handleCardChange = (index, field, value) => {
    const newCards = [...cards];
    newCards[index][field] = value;
    setCards(newCards);
  };

  const handleCreateDeck = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate
      if (!deckTitle.trim()) {
        setError('Vui lòng nhập tiêu đề deck');
        setLoading(false);
        return;
      }

      if (cards.some(c => !c.front.trim() || !c.back.trim())) {
        setError('Tất cả thẻ phải có nội dung mặt trước và mặt sau');
        setLoading(false);
        return;
      }

      const deckData = {
        title: deckTitle,
        description: deckDescription,
        tag: deckTag,
        is_public: true,
        cards: cards
      };

      const response = await decksAPI.createDeck(deckData);
      navigate(`/deck/${response.data.id}/cards`);
    } catch (err) {
      setError(`Không thể tạo deck: ${err.response?.data?.detail || err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">✏️ Tạo Deck Mới</h2>
        <p className="text-gray-600 mb-8">Xây dựng bộ flashcard tùy chỉnh bằng cách thêm thẻ thủ công.</p>

        {/* Deck Details */}
        <div className="mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tên Deck</label>
            <input
              type="text"
              value={deckTitle}
              onChange={(e) => setDeckTitle(e.target.value)}
              placeholder="VD: Từ vựng tiếng Tây Ban Nha"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mô Tả</label>
            <textarea
              value={deckDescription}
              onChange={(e) => setDeckDescription(e.target.value)}
              placeholder="Mô tả tùy chọn cho deck của bạn"
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Thẻ</label>
            <input
              type="text"
              value={deckTag}
              onChange={(e) => setDeckTag(e.target.value)}
              placeholder="VD: Ngôn ngữ"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">❌ {error}</p>
          </div>
        )}

        {/* Cards List */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Thẻ ({cards.length})</h3>
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={index} className="border border-gray-300 rounded-lg p-4">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-medium text-gray-700">Thẻ {index + 1}</span>
                  {cards.length > 1 && (
                    <button
                      onClick={() => handleRemoveCard(index)}
                      className="text-red-600 hover:text-red-800 text-sm font-medium"
                    >
                      🗑️ Xóa
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mặt Trước</label>
                    <textarea
                      value={card.front}
                      onChange={(e) => handleCardChange(index, 'front', e.target.value)}
                      placeholder="Câu hỏi hoặc thuật ngữ"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-gray-600 mb-1">Mặt Sau</label>
                    <textarea
                      value={card.back}
                      onChange={(e) => handleCardChange(index, 'back', e.target.value)}
                      placeholder="Câu trả lời hoặc định nghĩa"
                      rows="3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <button
            onClick={handleAddCard}
            className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
          >
            ➕ Thêm Thẻ
          </button>
          <button
            onClick={handleCreateDeck}
            disabled={loading}
            className="flex-1 bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-400 transition"
          >
            {loading ? 'Đang tạo...' : '✨ Tạo Deck'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckBuilder;
