import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { decksAPI } from '../api';

const Uploader = ({ onUploadSuccess }) => {
  const [activeTab, setActiveTab] = useState('file'); // 'file' or 'paste'
  const [showGuide, setShowGuide] = useState(false);
  
  // File upload state
  const [file, setFile] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);
  const [fileSuccess, setFileSuccess] = useState(false);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadDesc, setUploadDesc] = useState('');
  const fileInputRef = useRef(null);
  
  // HTML paste state
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [htmlContent, setHtmlContent] = useState('');
  const [pasteLoading, setPasteLoading] = useState(false);
  const [pasteError, setPasteError] = useState(null);
  const [pasteSuccess, setPasteSuccess] = useState(false);
  
  const navigate = useNavigate();

  // ===== FILE UPLOAD HANDLERS =====
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.name.endsWith('.html')) {
      setFile(selectedFile);
      setFileError(null);
    } else {
      setFileError('Vui lòng chọn file HTML hợp lệ');
      setFile(null);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.html')) {
      setFile(droppedFile);
      setFileError(null);
    } else {
      setFileError('Vui lòng thả file HTML hợp lệ');
    }
  };

  const handleFileUpload = async () => {
    if (!file) {
      setFileError('Vui lòng chọn file');
      return;
    }

    try {
      setFileLoading(true);
      setFileError(null);
      
      const response = await decksAPI.uploadHtmlDeck(file, uploadTitle, uploadDesc);

      setFileSuccess(true);
      setFile(null);
      setUploadTitle('');
      setUploadDesc('');
      onUploadSuccess();
      
      setTimeout(() => {
        navigate(`/deck/${response.data.id}/cards`);
      }, 1500);
    } catch (err) {
      setFileError(`Lỗi upload: ${err.response?.data?.detail || err.message}`);
    } finally {
      setFileLoading(false);
    }
  };

  // ===== HTML PASTE HANDLERS =====
  const handlePasteSubmit = async (e) => {
    e.preventDefault();

    if (!deckName.trim()) {
      setPasteError('Vui lòng nhập tên deck');
      return;
    }

    if (!htmlContent.trim()) {
      setPasteError('Vui lòng paste nội dung HTML');
      return;
    }

    try {
      setPasteLoading(true);
      setPasteError(null);

      const response = await decksAPI.pasteHtmlContent(htmlContent, deckName, description);

      setPasteSuccess(true);
      setDeckName('');
      setDescription('');
      setHtmlContent('');

      if (onUploadSuccess) {
        onUploadSuccess();
      }

      setTimeout(() => {
        navigate(`/deck/${response.data.id}/cards`);
      }, 1500);
    } catch (err) {
      setPasteError(`Lỗi: ${err.response?.data?.detail || err.message}`);
      console.error('Paste error:', err);
    } finally {
      setPasteLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="px-8 pt-8 pb-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">📥 Khu vực Tải Lên Deck</h2>
              <p className="text-gray-600">Bạn có thể upload file hoặc paste HTML để tạo deck mới.</p>
            </div>
            <button
              onClick={() => setShowGuide((prev) => !prev)}
              className="shrink-0 border border-blue-600 text-blue-600 px-4 py-2 rounded-lg font-semibold hover:bg-blue-50"
            >
              {showGuide ? 'Ẩn hướng dẫn' : '📘 Hướng dẫn tạo Deck mới'}
            </button>
          </div>

          {showGuide && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-2">
              <p className="font-semibold text-gray-900">Dùng Prompt Pro để tạo Deck nhanh:</p>
              <ul className="list-disc pl-5 text-sm text-gray-700 space-y-1">
                <li>Mở một trong hai prompt mẫu bên dưới.</li>
                <li>Điền chủ đề, cấp độ, số lượng thẻ rồi copy kết quả HTML/JSON phù hợp.</li>
                <li>Dán vào tab Paste HTML hoặc lưu thành file .html để upload.</li>
              </ul>
              <div className="flex flex-col gap-2 pt-1">
                <a
                  href="https://gemini.google.com/gem/1s8ov0f5bEAO3twc3-WPzig9HXQCEJS_U?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 underline break-all"
                >
                  Prompt mẫu 1
                </a>
                <a
                  href="https://gemini.google.com/gem/1SGEPM6ohDE1UNp8DL2Xb6KQf3L9OuUxm?usp=sharing"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-700 hover:text-blue-800 underline break-all"
                >
                  Prompt mẫu 2
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('file')}
            className={`flex-1 py-4 px-6 font-semibold text-center transition ${
              activeTab === 'file'
                ? 'bg-blue-600 text-white border-b-4 border-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📤 Upload File HTML
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`flex-1 py-4 px-6 font-semibold text-center transition ${
              activeTab === 'paste'
                ? 'bg-blue-600 text-white border-b-4 border-blue-700'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            📝 Paste HTML
          </button>
        </div>

        <div className="p-8">
          {/* FILE UPLOAD TAB */}
          {activeTab === 'file' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📤 Tải Lên File HTML</h2>
              <p className="text-gray-600 mb-8">
                Tải lên file HTML chứa bộ flashcard để tạo deck mới trong hệ thống.
              </p>

              {fileSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  ✅ File được tải lên thành công! Đang chuyển hướng...
                </div>
              )}

              {fileError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  ❌ {fileError}
                </div>
              )}

              {/* Tùy chỉnh tên deck */}
              <div className="mb-6 space-y-4">
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">Tên Deck (Tùy chọn - Mặc định lấy theo File HTML)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    placeholder="Nhập tên mới hoặc để trống"
                    value={uploadTitle}
                    onChange={(e) => setUploadTitle(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-gray-700 font-bold mb-2 text-sm">Mô tả (Tùy chọn)</label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition shadow-sm"
                    placeholder="Một vài dòng giới thiệu..."
                    value={uploadDesc}
                    onChange={(e) => setUploadDesc(e.target.value)}
                  />
                </div>
              </div>

              {/* Drag & Drop Area */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-blue-400 rounded-lg p-12 text-center cursor-pointer hover:bg-blue-50 transition mb-6"
              >
                <div className="text-5xl mb-4">📁</div>
                <p className="text-lg font-semibold text-gray-700 mb-2">
                  Kéo thả file HTML hoặc nhấp để chọn
                </p>
                <p className="text-gray-500">Hỗ trợ: .html</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept=".html"
                  className="hidden"
                />
              </div>

              {file && (
                <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <p className="text-blue-800 font-semibold">
                    ✓ Đã chọn: <span className="text-blue-600">{file.name}</span>
                  </p>
                </div>
              )}

              <button
                onClick={handleFileUpload}
                disabled={fileLoading || !file}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
              >
                {fileLoading ? (
                  <>
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                    Đang xử lý...
                  </>
                ) : (
                  <>🚀 Tải Lên</>
                )}
              </button>
            </div>
          )}

          {/* HTML PASTE TAB */}
          {activeTab === 'paste' && (
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">📝 Tạo Deck từ HTML</h2>
              <p className="text-gray-600 mb-8">
                Paste nội dung HTML của bộ flashcard và đặt tên cho deck mới của bạn
              </p>

              {pasteSuccess && (
                <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
                  ✅ Deck được tạo thành công! Đang chuyển hướng...
                </div>
              )}

              {pasteError && (
                <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
                  ❌ {pasteError}
                </div>
              )}

              <form onSubmit={handlePasteSubmit} className="space-y-6">
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
                    Nội Dung HTML <span className="text-red-500">*</span>
                  </label>
                  <div className="mb-3 bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-800">
                    💡 Mẹo: Copy toàn bộ nội dung file HTML (từ &lt;!DOCTYPE&gt; đến &lt;/html&gt;) rồi paste vào đây
                  </div>
                  <textarea
                    value={htmlContent}
                    onChange={(e) => setHtmlContent(e.target.value)}
                    placeholder="Paste nội dung HTML ở đây..."
                    rows={14}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    Kích thước: {htmlContent.length} ký tự
                  </p>
                </div>

                {/* Buttons */}
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={pasteLoading || !deckName.trim() || !htmlContent.trim()}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-bold py-3 px-6 rounded-lg transition duration-200 flex items-center justify-center gap-2"
                  >
                    {pasteLoading ? (
                      <>
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full"></div>
                        Đang xử lý...
                      </>
                    ) : (
                      <>🚀 Tạo Deck</>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setDeckName('');
                      setDescription('');
                      setHtmlContent('');
                      setPasteError(null);
                      setPasteSuccess(false);
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
                  <li>✅ HTML thường với cấu trúc div/span có dữ liệu</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Uploader;
