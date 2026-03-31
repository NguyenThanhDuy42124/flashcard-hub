/**
 * API service - Axios configuration and API calls.
 */
import axios from 'axios';

// Create axios instance with default config
const API = axios.create({
  baseURL: '/api',  // Relative URL - works on any domain/port
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
    API.get('/decks', { params: { skip, limit, tag } }),

  // Get specific deck
  getDeck: (deckId) =>
    API.get(`/decks/${deckId}`),

  // Get deck cards with sorting and filtering
  getDeckCards: (deckId, sortBy = 'chapter', chapter = null, search = null) =>
    API.get(`/decks/${deckId}/cards`, { 
      params: { 
        sort_by: sortBy,
        chapter: chapter,
        search: search
      } 
    }),

  // Create new card in deck
  createCard: (deckId, cardData) =>
    API.post(`/cards?deck_id=${deckId}`, cardData),

  // Create new deck
  createDeck: (deckData) =>
    API.post('/decks/create', deckData),

  // Upload HTML deck
  uploadHtmlDeck: (file) => {
    const formData = new FormData();
    formData.append('file', file);
    return API.post('/decks/upload-html', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // Paste HTML content as string
  pasteHtmlContent: (htmlContent, deckName) =>
    API.post('/decks/create-from-html-content', {
      title: deckName || 'Imported Deck',
      description: '',
      html_content: htmlContent
    }),

  // Update deck
  updateDeck: (deckId, deckData) =>
    API.put(`/decks/${deckId}`, deckData),

  // Delete deck
  deleteDeck: (deckId) =>
    API.delete(`/decks/${deckId}`),
};

// ============== CARD ENDPOINTS ==============

export const cardsAPI = {
  // Create new card
  createCard: (deckId, cardData) =>
    API.post(`/cards?deck_id=${deckId}`, cardData),

  // Update card
  updateCard: (cardId, cardData) =>
    API.put(`/cards/${cardId}`, cardData),

  // Delete card
  deleteCard: (cardId) =>
    API.delete(`/cards/${cardId}`),
};

// ============== STUDY ENDPOINTS ==============

export const studyAPI = {
  // Start study session
  startSession: (deckId) =>
    API.post('/study-sessions', { deck_id: deckId }),

  // Submit card review
  submitReview: (cardId, reviewData) =>
    API.post(`/cards/${cardId}/review`, reviewData),

  // Get user progress
  getUserProgress: () =>
    API.get('/users/progress'),
};

export default API;
