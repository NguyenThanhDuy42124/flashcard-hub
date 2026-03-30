import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { decksAPI, studyAPI } from '../api';
import Flashcard from './Flashcard';

const StudyMode = ({ onStudyComplete }) => {
  const { deckId } = useParams();
  const navigate = useNavigate();
  const [deck, setDeck] = useState(null);
  const [cards, setCards] = useState([]);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [studySession, setStudySession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [reviewFeedback, setReviewFeedback] = useState(null);

  useEffect(() => {
    const initializeStudy = async () => {
      try {
        setLoading(true);
        // Fetch deck and cards
        const deckResponse = await decksAPI.getDeck(deckId);
        setDeck(deckResponse.data);
        
        const cardsResponse = await decksAPI.getDeckCards(deckId);
        setCards(cardsResponse.data);

        // Start study session
        const sessionResponse = await studyAPI.startSession(deckId);
        setStudySession(sessionResponse.data);
      } catch (error) {
        console.error('Failed to initialize study:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeStudy();
  }, [deckId]);

  const handleCardReview = async (quality) => {
    try {
      const currentCard = cards[currentCardIndex];
      
      const response = await studyAPI.submitReview(currentCard.id, {
        card_id: currentCard.id,
        quality: quality,
        study_session_id: studySession.id
      });

      setReviewFeedback({
        quality,
        nextReviewDate: response.data.next_review_date,
        easeFactor: response.data.ease_factor
      });

      // Move to next card after delay
      setTimeout(() => {
        if (currentCardIndex < cards.length - 1) {
          setCurrentCardIndex(currentCardIndex + 1);
          setIsFlipped(false);
          setReviewFeedback(null);
        } else {
          // Study session complete
          completeStudy();
        }
      }, 1500);
    } catch (error) {
      console.error('Failed to submit review:', error);
    }
  };

  const completeStudy = async () => {
    onStudyComplete();
    navigate('/');
  };

  if (loading) return <div className="text-center py-16">Đang tải tài liệu học tập...</div>;
  if (!deck || cards.length === 0) return <div className="text-center py-16">Không tìm thấy thẻ nào</div>;

  const currentCard = cards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / cards.length) * 100;

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">{deck.title}</h1>
        <p className="text-gray-600">Chế độ Ôn Tập - Hệ thống SRS</p>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-700">
            Thẻ {currentCardIndex + 1} của {cards.length}
          </span>
          <span className="text-sm text-gray-600">
            {studySession?.cards_correct || 0} đúng
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Main Card Area */}
      <div className="mb-8 min-h-96">
        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={() => setIsFlipped(!isFlipped)}
        />
      </div>

      {/* Review Feedback */}
      {reviewFeedback && (
        <div className={`mb-8 p-4 rounded-lg text-center text-white ${
          reviewFeedback.quality >= 3 ? 'bg-gradient-success' : 'bg-gradient-danger'
        }`}>
          <p className="text-lg font-semibold mb-1">
            {reviewFeedback.quality >= 3 ? '✓ Tốt!' : '✗ Hãy nhớ cái này'}
          </p>
          <p className="text-sm opacity-90">
            Ôn tập lại trong {Math.round(Math.random() * 7 + 1)} ngày
          </p>
        </div>
      )}

      {/* Rating Buttons */}
      <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mb-8">
        {[
          { value: 0, label: 'Quên', color: 'red' },
          { value: 1, label: 'Khó', color: 'orange' },
          { value: 3, label: 'Tốt', color: 'blue' },
          { value: 4, label: 'Dễ', color: 'green' },
          { value: 5, label: 'Tuyệt Vời', color: 'purple' }
        ].map((btn) => (
          <button
            key={btn.value}
            onClick={() => handleCardReview(btn.value)}
            disabled={!isFlipped || reviewFeedback}
            className={`py-2 rounded-lg font-semibold text-white transition disabled:opacity-50 disabled:cursor-not-allowed
              ${btn.color === 'red' && 'bg-red-500 hover:bg-red-600'}
              ${btn.color === 'orange' && 'bg-orange-500 hover:bg-orange-600'}
              ${btn.color === 'blue' && 'bg-blue-500 hover:bg-blue-600'}
              ${btn.color === 'green' && 'bg-green-500 hover:bg-green-600'}
              ${btn.color === 'purple' && 'bg-purple-500 hover:bg-purple-600'}
            `}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex-1 border-2 border-gray-400 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
        >
          🚪 Thoát Ôn Tập
        </button>
        <button
          onClick={() => {
            setCurrentCardIndex(0);
            setIsFlipped(false);
            setReviewFeedback(null);
          }}
          className="flex-1 border-2 border-blue-600 text-blue-600 py-3 rounded-lg font-semibold hover:bg-blue-50 transition"
        >
          🔄 Bắt Đầu Lại
        </button>
      </div>

      {/* Study Tips */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="font-bold text-blue-900 mb-2">💡 Mẹo Lặp Lại Cách Xa</h3>
        <p className="text-blue-800 text-sm">
          Đánh giá khả năng nhớ của bạn một cách trung thực: "Quên" có nghĩa là bạn quên mất, "Khó" cần luyện tập, "Tốt" là vững chắc,
          và "Tuyệt Vời" có nghĩa là bạn biết rõ. Hệ thống sẽ lên lịch ôn tập dựa trên đánh giá của bạn.
        </p>
      </div>
    </div>
  );
};

export default StudyMode;
