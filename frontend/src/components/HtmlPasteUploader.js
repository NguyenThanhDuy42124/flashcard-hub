import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decksAPI } from '../api';

const HtmlPasteUploader = ({ onUploadSuccess }) => {
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!deckName.trim()) {
      setError('Vui lòng nhập tên deck');
      return;
    }

    if (!htmlContent.trim()) {
      setError('Vui lòng paste HTML content');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await decksAPI.pasteHtmlContent(htmlContent, deckName, description);

      setSuccess(true);
      setDeckName('');
      setDescription('');
      setHtmlContent('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      // Redirect to deck detail after 2 seconds
      setTimeout(() => {
        navigate(`/deck/${response.data.id}/cards`);
      }, 2000);
    } catch (err) {
      setError(`Lỗi: ${err.response?.data?.detail || err.message}`);
      console.error('Upload error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          📝 Tạo Deck từ HTML
        </h2>
        <p className="text-gray-600 mb-8">
          Paste nội dung HTML của bộ flashcard và đặt tên cho deck mới của bạn
        </p>

        {success && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
            ✅ Deck được tạo thành công! Đang chuyển hướng...
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
            ❌ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên Deck */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tên Deck <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="VD: Tổng Ôn Mạng Máy Tính"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* Mô Tả */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Mô Tả (Tùy chọn)
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="VD: Bộ flashcard cập nhật đầy đủ cho bài thi"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition"
            />
          </div>

          {/* HTML Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              HTML Content <span className="text-red-500">*</span>
            </label>
            <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
              💡 Mẹo: Copy toàn bộ nội dung file HTML (từ &lt;!DOCTYPE&gt; đến &lt;/html&gt;) rồi paste vào đây
            </div>
            <textarea
              value={htmlContent}
              onChange={(e) => setHtmlContent(e.target.value)}
              placeholder="Paste HTML content here..."
              rows={16}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Kích thước: {htmlContent.length} ký tự
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex gap-4">
            <button
              type="submit"
              disabled={loading || !deckName.trim() || !htmlContent.trim()}
              className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                  Đang xử lý...
                </>
              ) : (
                <>
                  🚀 Tạo Deck
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setDeckName('');
                setDescription('');
                setHtmlContent('');
                setError(null);
                setSuccess(false);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              Xóa
            </button>
          </div>
        </form>

        {/* Info Box */}
        <div className="mt-10 bg-yellow-50 border border-yellow-200 rounded-lg p-6">
          <h3 className="font-bold text-yellow-900 mb-3">ℹ️ Hình thức HTML được hỗ trợ</h3>
          <ul className="text-sm text-yellow-900 space-y-2">
            <li>✅ File HTML hoàn chỉnh với React component chứa dữ liệu flashcard</li>
            <li>✅ HTML chứa data trong format JSON (trong script tag hoặc comment)</li>
            <li>✅ Bảng HTML với cột front/question và back/answer</li>
            <li>✅ HTML thường với cấu trúc div/span có data</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default HtmlPasteUploader;
