import React, { useState } from 'react';
import { decksAPI } from '../api';

const CreateCardModal = ({ deckId, isOpen, onClose, onCardCreated, chapters = [], adminOverride = false }) => {
  const [formData, setFormData] = useState({
    title: '',
    chapter: '',
    front: '',
    back: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Create the card
      const response = await decksAPI.createCard(deckId, {
        title: formData.title,
        chapter: formData.chapter,
        front: formData.front,
        back: formData.back
      }, adminOverride);

      // Reset form
      setFormData({
        title: '',
        chapter: '',
        front: '',
        back: ''
      });

      // Notify parent component
      onCardCreated(response.data);
      onClose();
    } catch (err) {
      console.error('Failed to create card:', err);
      setError(err.response?.data?.detail || 'Không thể tạo card. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b">
          <h3 className="text-lg sm:text-xl font-bold text-gray-900">Thêm Flashcard Mới</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            <span>&times;</span>
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 max-h-96 overflow-y-auto">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-3 sm:px-4 py-2 sm:py-3 rounded text-sm sm:text-base">
              {error}
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Tiêu Đề Câu Hỏi *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              placeholder="Nhập tiêu đề câu hỏi"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            />
          </div>

          {/* Chapter */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Chương *
            </label>
            <select
              name="chapter"
              value={formData.chapter}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              required
            >
              <option value="">-- Chọn chương --</option>
              {chapters.map(ch => (
                <option key={ch} value={ch}>
                  {ch}
                </option>
              ))}
              <option value="">-- Thêm chương mới --</option>
            </select>
            {formData.chapter === '' && chapters.length === 0 && (
              <input
                type="text"
                name="chapter"
                placeholder="Nhập tên chương mới"
                value={formData.chapter}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                required
              />
            )}
          </div>

          {/* Front (Question) */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Câu Hỏi (Mặt Trước) *
            </label>
            <textarea
              name="front"
              value={formData.front}
              onChange={handleChange}
              placeholder="Nhập câu hỏi"
              rows="3"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm custom-scrollbar"
              required
            />
          </div>

          {/* Back (Answer) */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
              Câu Trả Lời (Mặt Sau) *
            </label>
            <textarea
              name="back"
              value={formData.back}
              onChange={handleChange}
              placeholder="Nhập câu trả lời"
              rows="4"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm custom-scrollbar"
              required
            />
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 sm:gap-3 p-4 sm:p-6 border-t bg-gray-50 flex-col-reverse sm:flex-row">
          <button
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 transition text-sm"
          >
            Hủy
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:bg-gray-400 text-sm font-medium"
          >
            {loading ? 'Đang tạo...' : 'Tạo Card'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateCardModal;
