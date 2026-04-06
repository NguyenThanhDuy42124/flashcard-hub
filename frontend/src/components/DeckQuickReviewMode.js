import React, { useMemo, useState } from 'react';
import { decksAPI } from '../api';

const DEFAULT_LIMIT = 10;

const shuffleArray = (items) => {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};

const DeckQuickReviewMode = ({ deckId, deckTitle, chapters = [], onExit }) => {
  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
  const [useAllCards, setUseAllCards] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState(['Tất cả']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [reviewList, setReviewList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [reviewStarted, setReviewStarted] = useState(false);
  const [reviewCompleted, setReviewCompleted] = useState(false);

  const chapterOptions = useMemo(
    () => chapters.filter((chapter) => chapter && chapter !== 'Tất cả'),
    [chapters]
  );

  const toggleChapter = (chapter) => {
    setSelectedChapters((prev) => {
      if (chapter === 'Tất cả') return ['Tất cả'];
      const withoutAll = prev.filter((item) => item !== 'Tất cả');
      if (withoutAll.includes(chapter)) {
        const next = withoutAll.filter((item) => item !== chapter);
        return next.length > 0 ? next : ['Tất cả'];
      }
      return [...withoutAll, chapter];
    });
  };

  const resetState = () => {
    setReviewList([]);
    setCurrentIndex(0);
    setReviewStarted(false);
    setReviewCompleted(false);
    setError('');
  };

  const handleStart = async () => {
    const parsedLimit = Number.parseInt(limitInput, 10);
    if (!useAllCards && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
      setError('Số lượng thẻ phải là số nguyên lớn hơn 0.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await decksAPI.getDeckCards(Number(deckId), 'chapter', null);
      const allCards = response.data || [];

      const chapterFilters = selectedChapters.includes('Tất cả') ? [] : selectedChapters;
      const chapterFiltered = chapterFilters.length > 0
        ? allCards.filter((card) => chapterFilters.includes(card.chapter || 'General'))
        : allCards;

      if (chapterFiltered.length === 0) {
        setError('Không có thẻ phù hợp với bộ lọc hiện tại.');
        return;
      }

      const shuffled = shuffleArray(chapterFiltered);
      const finalList = useAllCards ? shuffled : shuffled.slice(0, parsedLimit);

      setReviewList(finalList);
      setCurrentIndex(0);
      setReviewCompleted(false);
      setReviewStarted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tải thẻ để xem nhanh.');
    } finally {
      setLoading(false);
    }
  };

  const handleNext = () => {
    if (currentIndex >= reviewList.length - 1) {
      setReviewCompleted(true);
      return;
    }
    setCurrentIndex((prev) => prev + 1);
  };

  const handleRetry = () => {
    setReviewList((prev) => shuffleArray(prev));
    setCurrentIndex(0);
    setReviewCompleted(false);
    setReviewStarted(true);
  };

  const currentCard = reviewList[currentIndex];

  if (!reviewStarted) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Xem nhanh: {deckTitle}</h2>
            <button
              onClick={() => {
                resetState();
                onExit();
              }}
              className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Quay lại cards
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bạn muốn xem bao nhiêu thẻ?</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="number"
                  min="1"
                  value={limitInput}
                  onChange={(event) => setLimitInput(event.target.value)}
                  disabled={useAllCards}
                  className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg"
                  placeholder="Ví dụ: 5, 10, 20"
                />
                <label className="inline-flex items-center gap-2 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={useAllCards}
                    onChange={(event) => setUseAllCards(event.target.checked)}
                  />
                  Xem tất cả thẻ
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Chọn chương</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleChapter('Tất cả')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                    selectedChapters.includes('Tất cả')
                      ? 'bg-gray-800 text-white border-gray-800'
                      : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  Tất cả
                </button>
                {chapterOptions.map((chapter) => (
                  <button
                    key={chapter}
                    type="button"
                    onClick={() => toggleChapter(chapter)}
                    className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                      selectedChapters.includes(chapter)
                        ? 'bg-teal-700 text-white border-teal-700'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {chapter}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {error}
              </div>
            )}

            <div className="pt-2">
              <button
                type="button"
                onClick={handleStart}
                disabled={loading}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  loading ? 'bg-gray-400 cursor-wait' : 'bg-slate-700 hover:bg-slate-800'
                }`}
              >
                {loading ? 'Đang chuẩn bị...' : 'Bắt đầu xem nhanh'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (reviewCompleted) {
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Đã xem xong</h2>
          <p className="text-gray-600 mb-6">Bạn đã duyệt hết {reviewList.length} thẻ trong phiên này.</p>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRetry}
              className="px-5 py-2.5 rounded-lg bg-slate-700 text-white font-semibold hover:bg-slate-800"
            >
              Xem lại ngẫu nhiên
            </button>
            <button
              onClick={resetState}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Cấu hình lại
            </button>
            <button
              onClick={() => {
                resetState();
                onExit();
              }}
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
            >
              Thoát xem nhanh
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Xem nhanh Flashcard</h2>
          <div className="text-sm font-semibold text-gray-600">
            Thẻ {currentIndex + 1}/{reviewList.length}
          </div>
        </div>

        <div className="mb-4 rounded-xl bg-slate-100 border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">Mặt trước</p>
          {currentCard.chapter && (
            <div className="mb-2 inline-flex px-2 py-1 rounded-full bg-white border border-slate-300 text-slate-700 text-xs font-semibold">
              {currentCard.chapter}
            </div>
          )}
          <p className="text-base sm:text-lg font-semibold text-slate-900 leading-relaxed">
            {currentCard.front}
          </p>
        </div>

        <div className="mb-6 rounded-xl bg-slate-50 border border-slate-200 p-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">Mặt sau</p>
          <p className="text-sm sm:text-base text-slate-800 leading-relaxed whitespace-pre-wrap">
            {currentCard.back}
          </p>
        </div>

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <button
            onClick={() => {
              resetState();
              onExit();
            }}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
          >
            Thoát
          </button>

          <button
            onClick={handleNext}
            className="px-5 py-2 rounded-lg font-semibold text-white bg-slate-700 hover:bg-slate-800"
          >
            {currentIndex === reviewList.length - 1 ? 'Hoàn thành' : 'Câu hỏi tiếp theo'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeckQuickReviewMode;
