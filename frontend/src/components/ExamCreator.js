import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { decksAPI, examsAPI } from '../api';

const TIME_OPTIONS = [
  { value: '1h', label: '1 giờ' },
  { value: '2h', label: '2 giờ' },
  { value: '3h', label: '3 giờ' },
  { value: '1w', label: '1 tuần' },
  { value: '1m', label: '1 tháng' },
  { value: 'unlimited', label: 'Không giới hạn' },
];

const ExamCreator = () => {
  const [decks, setDecks] = useState([]);
  const [search, setSearch] = useState('');
  const [selectedDecks, setSelectedDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [totalQuestions, setTotalQuestions] = useState(30);
  const [randomScope, setRandomScope] = useState('deck');
  const [timeLimit, setTimeLimit] = useState('1h');
  const [title, setTitle] = useState('Đề tổng hợp');
  const [description, setDescription] = useState('Đề trộn tự động từ nhiều deck');
  const navigate = useNavigate();

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        const res = await decksAPI.listDecks(0, 200, null);
        setDecks(res.data);
      } catch (err) {
        setError(err.response?.data?.detail || 'Không tải được danh sách deck');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const availableDecks = useMemo(() => {
    const selectedIds = selectedDecks.map((d) => d.id);
    return decks
      .filter((d) => !selectedIds.includes(d.id))
      .filter((d) => d.title.toLowerCase().includes(search.toLowerCase()));
  }, [decks, search, selectedDecks]);

  const percentSum = selectedDecks.reduce((sum, d) => sum + Number(d.percentage || 0), 0);

  const handleAddDeck = (deck) => {
    setSelectedDecks((prev) => [...prev, { id: deck.id, title: deck.title, percentage: 0 }]);
  };

  const handleRemoveDeck = (id) => {
    setSelectedDecks((prev) => prev.filter((d) => d.id !== id));
  };

  const handlePercentageChange = (id, value) => {
    const sanitized = Math.max(0, Math.min(100, Number(value) || 0));
    setSelectedDecks((prev) => prev.map((d) => (d.id === id ? { ...d, percentage: sanitized } : d)));
  };

  const handleSubmit = async () => {
    setError('');

    if (!selectedDecks.length) {
      setError('Hãy chọn ít nhất 1 deck.');
      return;
    }

    if (!totalQuestions || Number(totalQuestions) <= 0) {
      setError('Số câu hỏi phải lớn hơn 0.');
      return;
    }

    if (percentSum > 100) {
      setError('Tổng % không được vượt quá 100%.');
      return;
    }

    if (percentSum < 100) {
      const confirmed = window.confirm('Tổng % < 100%. Tiếp tục và random phần còn lại?');
      if (!confirmed) return;
    }

    const payload = {
      title: title?.trim() || `Đề ngẫu nhiên ${new Date().toLocaleString('vi-VN')}`,
      description: description?.trim() || undefined,
      selections: selectedDecks.map((d) => ({ deck_id: d.id, percentage: Number(d.percentage || 0) })),
      total_questions: Number(totalQuestions),
      random_scope: randomScope,
      time_limit: timeLimit,
    };

    try {
      setSubmitting(true);
      const res = await examsAPI.createExam(payload);
      navigate(`/deck/${res.data.exam_deck_id}/cards`, { state: { message: 'Đã tạo đề thi' } });
    } catch (err) {
      setError(err.response?.data?.detail || err.message || 'Không tạo được đề');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="text-center py-10">Đang tải deck...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📝 Tạo đề thi</h1>
        <p className="text-gray-600">Chọn deck, đặt % và tạo đề một lần.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold text-gray-900">Chọn deck</h3>
            <span className="text-sm text-gray-500">{decks.length} deck</span>
          </div>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm deck..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <div className="max-h-80 overflow-y-auto divide-y">
            {availableDecks.length === 0 && (
              <div className="text-sm text-gray-500 py-4 text-center">Không có deck phù hợp</div>
            )}
            {availableDecks.map((deck) => (
              <div key={deck.id} className="flex items-center justify-between py-3">
                <div>
                  <div className="font-semibold text-gray-900">{deck.title}</div>
                  <div className="text-xs text-gray-500">{deck.cards?.length || 0} thẻ</div>
                </div>
                <button
                  onClick={() => handleAddDeck(deck)}
                  className="px-3 py-1.5 rounded-lg text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700"
                >
                  Thêm
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Deck đã chọn</h3>
            <div className={`text-sm font-semibold ${percentSum === 100 ? 'text-green-600' : 'text-orange-600'}`}>
              Tổng: {percentSum}%
            </div>
          </div>

          {selectedDecks.length === 0 ? (
            <div className="text-sm text-gray-500">Chưa chọn deck nào.</div>
          ) : (
            <div className="space-y-3">
              {selectedDecks.map((deck) => (
                <div key={deck.id} className="p-4 border border-gray-200 rounded-lg flex items-center gap-3">
                  <div className="flex-1">
                    <div className="font-semibold text-gray-900">{deck.title}</div>
                    <div className="text-xs text-gray-500">ID: {deck.id}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={deck.percentage}
                      onChange={(e) => handlePercentageChange(deck.id, e.target.value)}
                      className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-600">%</span>
                  </div>
                  <button
                    onClick={() => handleRemoveDeck(deck.id)}
                    className="text-red-600 hover:text-red-700 font-semibold"
                  >
                    Xóa
                  </button>
                </div>
              ))}
            </div>
          )}

          {percentSum < 100 && selectedDecks.length > 0 && (
            <div className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
              Tổng % chưa đủ 100%. Bạn có thể tiếp tục, phần còn lại sẽ được random.
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-xl shadow p-5 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Cấu hình đề</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tên đề</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="VD: Đề mô phỏng"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Mô tả</label>
            <input
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Ghi chú về đề"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Tổng số câu hỏi</label>
            <input
              type="number"
              min={1}
              value={totalQuestions}
              onChange={(e) => setTotalQuestions(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700">Thời gian tồn tại</label>
            <select
              value={timeLimit}
              onChange={(e) => setTimeLimit(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {TIME_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-semibold text-gray-700">Nguồn random</label>
          <div className="flex gap-4 flex-wrap">
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="random-scope"
                value="deck"
                checked={randomScope === 'deck'}
                onChange={(e) => setRandomScope(e.target.value)}
              />
              Ngẫu nhiên toàn bộ deck
            </label>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input
                type="radio"
                name="random-scope"
                value="chapter"
                checked={randomScope === 'chapter'}
                onChange={(e) => setRandomScope(e.target.value)}
              />
              Cân bằng theo chương
            </label>
          </div>
        </div>

        <div className="pt-2">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full md:w-auto px-5 py-3 rounded-lg text-white font-semibold shadow ${
              submitting ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'
            }`}
          >
            {submitting ? 'Đang tạo đề...' : 'Tạo đề và random câu hỏi'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExamCreator;
