/**
 * API service - Axios configuration and API calls.
 */
import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: 'http://localhost:8000',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Add error handling interceptor
API.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

// ============== DECK ENDPOINTS ==============

export const decksAPI = {
  // List all decks
  listDecks: (skip = 0, limit = 10, tag = null) =>
    API.get('/api/decks', { params: { skip, limit, tag } }),

  // Get specific deck
  getDeck: (deckId) =>
    API.get(`/api/decks/${deckId}`),

  // Get deck cards
  getDeckCards: (deckId) =>
    API.get(`/api/decks/${deckId}/cards`),

  // Create new deck
  createDeck: (deckData) =>
    API.post('/api/decks/create', deckData),

  // Upload HTML deck
  uploadHtmlDeck: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/api/decks/upload-html', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Update deck
  updateDeck: (deckId, deckData) =>
    API.put(`/api/decks/${deckId}`, deckData),

  // Delete deck
  deleteDeck: (deckId) =>
    API.delete(`/api/decks/${deckId}`),
};

// ============== CARD ENDPOINTS ==============

export const cardsAPI = {
  // Create new card
  createCard: (deckId, cardData) =>
    API.post(`/api/cards?deck_id=${deckId}`, cardData),

  // Update card
  updateCard: (cardId, cardData) =>
    API.put(`/api/cards/${cardId}`, cardData),

  // Delete card
  deleteCard: (cardId) =>
    API.delete(`/api/cards/${cardId}`),
};

// ============== STUDY ENDPOINTS ==============

export const studyAPI = {
  // Start study session
  startSession: (deckId) =>
    API.post('/api/study-sessions', { deck_id: deckId }),

  // Submit card review
  submitReview: (cardId, reviewData) =>
    API.post(`/api/cards/${cardId}/review`, reviewData),

  // Get user progress
  getUserProgress: () =>
    API.get('/api/users/progress'),
};

export default API;
