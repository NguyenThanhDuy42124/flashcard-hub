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

const DeckQuizMode = ({ deckId, deckTitle, chapters = [], onExit }) => {
  const [limitInput, setLimitInput] = useState(String(DEFAULT_LIMIT));
  const [useAllQuestions, setUseAllQuestions] = useState(false);
  const [selectedChapters, setSelectedChapters] = useState(['Tất cả']);
  const [loadingQuiz, setLoadingQuiz] = useState(false);
  const [error, setError] = useState('');

  const [quizList, setQuizList] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);
  const [quizStarted, setQuizStarted] = useState(false);
  const [quizCompleted, setQuizCompleted] = useState(false);

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

  const resetQuizState = () => {
    setQuizList([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setQuizStarted(false);
    setQuizCompleted(false);
    setError('');
  };

  const handleStartQuiz = async () => {
    const parsedLimit = Number.parseInt(limitInput, 10);
    if (!useAllQuestions && (!Number.isInteger(parsedLimit) || parsedLimit <= 0)) {
      setError('Số lượng câu phải là số nguyên lớn hơn 0.');
      return;
    }

    setLoadingQuiz(true);
    setError('');

    try {
      const chapterFilters = selectedChapters.includes('Tất cả') ? [] : selectedChapters;
      const response = await decksAPI.getQuizQuestions(
        Number(deckId),
        useAllQuestions ? null : parsedLimit,
        chapterFilters
      );

      const questions = (response.data || []).map((item) => {
        const allAnswers = shuffleArray([item.correct_answer, ...(item.wrong_answers || [])]);
        return {
          ...item,
          answers: allAnswers,
        };
      });

      if (questions.length === 0) {
        setError('Không có câu hỏi phù hợp với bộ lọc hiện tại.');
        return;
      }

      setQuizList(questions);
      setCurrentQuestionIndex(0);
      setSelectedAnswer('');
      setShowResult(false);
      setScore(0);
      setQuizCompleted(false);
      setQuizStarted(true);
    } catch (err) {
      setError(err.response?.data?.detail || 'Không thể tải câu hỏi quiz.');
    } finally {
      setLoadingQuiz(false);
    }
  };

  const handleSelectAnswer = (answer) => {
    if (showResult || quizCompleted) return;
    const currentQuestion = quizList[currentQuestionIndex];
    setSelectedAnswer(answer);
    setShowResult(true);
    if (answer === currentQuestion.correct_answer) {
      setScore((prev) => prev + 1);
    }
  };

  const handleNextQuestion = () => {
    if (!showResult) return;
    if (currentQuestionIndex >= quizList.length - 1) {
      setQuizCompleted(true);
      return;
    }

    setCurrentQuestionIndex((prev) => prev + 1);
    setSelectedAnswer('');
    setShowResult(false);
  };

  const handleRetryQuiz = () => {
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setShowResult(false);
    setScore(0);
    setQuizCompleted(false);
    setQuizStarted(true);
    setQuizList((prev) => prev.map((question) => ({
      ...question,
      answers: shuffleArray([question.correct_answer, ...(question.wrong_answers || [])]),
    })));
  };

  const currentQuestion = quizList[currentQuestionIndex];
  const optionLabels = ['A', 'B', 'C', 'D'];

  if (!quizStarted) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
        <div className="bg-[#111312] rounded-2xl border border-[#2b3130] shadow-[0_26px_60px_-36px_rgba(0,0,0,0.85)] p-5 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-6">
            <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100">Làm Quiz: {deckTitle}</h2>
            <button
              onClick={() => {
                resetQuizState();
                onExit();
              }}
              className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-200 hover:bg-zinc-800"
            >
              Quay lại cards
            </button>
          </div>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Bạn muốn làm bao nhiêu câu?</label>
              <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                <input
                  type="number"
                  min="1"
                  value={limitInput}
                  onChange={(event) => setLimitInput(event.target.value)}
                  disabled={useAllQuestions}
                  className="w-full sm:w-48 px-4 py-2 border border-zinc-600 bg-zinc-900 text-zinc-100 rounded-lg"
                  placeholder="Ví dụ: 5, 10, 20"
                />
                <label className="inline-flex items-center gap-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={useAllQuestions}
                    onChange={(event) => setUseAllQuestions(event.target.checked)}
                  />
                  Làm tất cả câu
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-zinc-300 mb-2">Chọn chương</label>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => toggleChapter('Tất cả')}
                  className={`px-3 py-1.5 rounded-full text-sm font-semibold border ${
                    selectedChapters.includes('Tất cả')
                      ? 'bg-zinc-200 text-zinc-900 border-zinc-200'
                      : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                        ? 'bg-amber-700 text-amber-50 border-amber-700'
                        : 'bg-zinc-900 text-zinc-300 border-zinc-700 hover:bg-zinc-800'
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
                onClick={handleStartQuiz}
                disabled={loadingQuiz}
                className={`px-6 py-3 rounded-lg font-semibold text-white ${
                  loadingQuiz ? 'bg-zinc-600 cursor-wait' : 'bg-amber-700 hover:bg-amber-600'
                }`}
              >
                {loadingQuiz ? 'Đang chuẩn bị quiz...' : 'Bắt đầu Quiz'}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted) {
    const total = quizList.length;
    const accuracy = total > 0 ? Math.round((score / total) * 100) : 0;
    return (
      <div className="max-w-3xl mx-auto px-3 sm:px-4 py-10">
        <div className="bg-[#111312] rounded-2xl border border-[#2b3130] shadow-[0_26px_60px_-36px_rgba(0,0,0,0.85)] p-6 sm:p-8 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-zinc-100 mb-2">Hoàn thành Quiz</h2>
          <p className="text-zinc-400 mb-6">Bạn đã làm xong tất cả câu hỏi.</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-4">
              <div className="text-sm text-zinc-400 font-semibold">Điểm số</div>
              <div className="text-2xl font-extrabold text-zinc-100">{score}/{total}</div>
            </div>
            <div className="rounded-xl bg-emerald-950/35 border border-emerald-700/40 p-4">
              <div className="text-sm text-emerald-300 font-semibold">Tỷ lệ đúng</div>
              <div className="text-2xl font-extrabold text-emerald-200">{accuracy}%</div>
            </div>
            <div className="rounded-xl bg-zinc-900 border border-zinc-700 p-4">
              <div className="text-sm text-zinc-400 font-semibold">Tổng câu</div>
              <div className="text-2xl font-extrabold text-zinc-100">{total}</div>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleRetryQuiz}
              className="px-5 py-2.5 rounded-lg bg-amber-700 text-amber-50 font-semibold hover:bg-amber-600"
            >
              Làm lại quiz
            </button>
            <button
              onClick={resetQuizState}
              className="px-5 py-2.5 rounded-lg border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800"
            >
              Cấu hình lại
            </button>
            <button
              onClick={() => {
                resetQuizState();
                onExit();
              }}
              className="px-5 py-2.5 rounded-lg border border-zinc-600 text-zinc-200 font-semibold hover:bg-zinc-800"
            >
              Thoát Quiz Mode
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCorrect = selectedAnswer === currentQuestion.correct_answer;

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-10">
      <div className="bg-[#111312] rounded-2xl border border-[#2b3130] shadow-[0_26px_60px_-36px_rgba(0,0,0,0.85)] p-5 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-zinc-100">Quiz Mode</h2>
          <div className="text-sm font-semibold text-zinc-300">
            Câu {currentQuestionIndex + 1}/{quizList.length}
          </div>
        </div>

        <div className="mb-5 rounded-xl bg-zinc-900 border border-zinc-700 p-4">
          <p className="text-base sm:text-lg font-semibold text-zinc-100 leading-relaxed">
            {currentQuestion.question}
          </p>
        </div>

        <div className="space-y-3 mb-5">
          {currentQuestion.answers.map((answer, idx) => {
            let answerClass = 'border-zinc-700 bg-zinc-900 text-zinc-100 hover:border-amber-500/60 hover:bg-zinc-800';
            if (showResult) {
              if (answer === currentQuestion.correct_answer) {
                answerClass = 'border-emerald-500/70 bg-emerald-500/15 text-emerald-200';
              } else if (answer === selectedAnswer) {
                answerClass = 'border-rose-500/70 bg-rose-500/15 text-rose-200';
              } else {
                answerClass = 'border-zinc-800 bg-zinc-900/60 text-zinc-500';
              }
            }

            return (
              <button
                key={answer}
                type="button"
                onClick={() => handleSelectAnswer(answer)}
                disabled={showResult}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-medium transition flex items-center gap-3 ${answerClass} ${
                  showResult ? 'cursor-default' : ''
                }`}
              >
                <span className="w-8 h-8 rounded-lg border border-zinc-600 bg-zinc-800 text-zinc-200 font-bold text-sm inline-flex items-center justify-center shrink-0">
                  {optionLabels[idx] || String.fromCharCode(65 + idx)}
                </span>
                <span>{answer}</span>
              </button>
            );
          })}
        </div>

        {showResult && (
          <div className={`mb-5 p-4 rounded-xl border ${isCorrect ? 'bg-emerald-500/12 border-emerald-500/40' : 'bg-rose-500/12 border-rose-500/40'}`}>
            <p className={`font-bold ${isCorrect ? 'text-emerald-200' : 'text-rose-200'}`}>
              {isCorrect ? '✅ Chính xác' : '❌ Chưa đúng'}
            </p>
            {currentQuestion.explanation && (
              <p className="mt-2 text-sm sm:text-base text-zinc-300 leading-relaxed">
                Giải thích: {currentQuestion.explanation}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-wrap gap-3 justify-between items-center">
          <div className="text-sm font-semibold text-zinc-300">Điểm hiện tại: {score}</div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                resetQuizState();
                onExit();
              }}
              className="px-4 py-2 rounded-lg border border-zinc-600 text-zinc-200 hover:bg-zinc-800"
            >
              Thoát
            </button>
            <button
              onClick={handleNextQuestion}
              disabled={!showResult}
              className={`px-5 py-2 rounded-lg font-semibold text-white ${
                !showResult ? 'bg-zinc-600 cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-600'
              }`}
            >
              {currentQuestionIndex === quizList.length - 1 ? 'Xem kết quả' : 'Câu hỏi tiếp theo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeckQuizMode;
