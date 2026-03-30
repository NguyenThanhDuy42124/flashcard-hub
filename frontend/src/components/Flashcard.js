import React, { useState } from 'react';

const Flashcard = ({ card, isFlipped, onFlip }) => {
  return (
    <div
      onClick={onFlip}
      className="min-h-80 bg-white rounded-xl shadow-lg p-8 cursor-pointer hover:shadow-xl transition-shadow flex flex-col items-center justify-center text-center border-2 border-gray-200 hover:border-blue-500"
    >
      {isFlipped ? (
        <div className="w-full h-full flex flex-col">
          <div className="text-xs text-gray-500 mb-4 font-semibold">💡 ĐÁP ÁN</div>
          <div className="flex-1 flex items-center justify-center text-left">
            {typeof card.back === 'string' && card.back.includes('\n') ? (
              <ul className="space-y-2 text-sm">
                {card.back.split('\n').map((line, idx) => (
                  <li key={idx} className="text-gray-800">
                    {line.startsWith('-') ? (
                      <span className="ml-4">• {line.substring(1).trim()}</span>
                    ) : (
                      <strong className="block">{line}</strong>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-lg text-gray-800 leading-relaxed">{card.back}</p>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-4 animate-bounce">Nhấp để xem câu hỏi</div>
        </div>
      ) : (
        <div className="w-full h-full flex flex-col">
          <div className="text-xs text-gray-500 mb-4 font-semibold">❓ CÂU HỎI</div>
          <div className="flex-1 flex items-center justify-center">
            <p className="text-2xl font-bold text-gray-900 leading-relaxed">{card.front}</p>
          </div>
          <div className="text-xs text-gray-400 mt-4 animate-bounce">Nhấp để xem đáp án</div>
        </div>
      )}
    </div>
  );
};

export default Flashcard;
