"""Pydantic models for request/response validation."""
from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime


class CardBase(BaseModel):
    """Base card model."""
    front: str
    back: str
    title: Optional[str] = None  # Card question/title
    chapter: Optional[str] = None  # Chapter/section


class CardCreate(CardBase):
    """Card creation request."""
    pass


class CardResponse(CardBase):
    """Card response model."""
    id: int
    deck_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DeckBase(BaseModel):
    """Base deck model."""
    title: str
    description: Optional[str] = None
    tag: Optional[str] = None
    is_public: bool = True


class DeckCreate(DeckBase):
    """Deck creation request."""
    cards: Optional[List[CardCreate]] = []


class DeckUpdate(BaseModel):
    """Deck update request."""
    title: Optional[str] = None
    description: Optional[str] = None
    tag: Optional[str] = None
    is_public: Optional[bool] = None


class CreateDeckFromHTMLRequest(BaseModel):
    """Request to create deck from HTML content."""
    title: str
    description: Optional[str] = None
    html_content: str
    tag: Optional[str] = None
    

class DeckResponse(DeckBase):
    """Deck response model."""
    id: int
    owner_id: int
    created_at: datetime
    updated_at: datetime
    cards: List[CardResponse] = []

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    """Base user model."""
    username: str
    email: EmailStr


class UserCreate(UserBase):
    """User creation request."""
    password: str


class UserResponse(UserBase):
    """User response model."""
    id: int
    created_at: datetime

    class Config:
        from_attributes = True


class CardReviewRequest(BaseModel):
    """Card review submission request."""
    card_id: int
    quality: int  # 0-5 rating
    study_session_id: int


class StudySessionCreate(BaseModel):
    """Study session creation request."""
    deck_id: int


class StudySessionResponse(BaseModel):
    """Study session response model."""
    id: int
    user_id: int
    deck_id: int
    started_at: datetime
    ended_at: Optional[datetime] = None
    cards_reviewed: int
    cards_correct: int

    class Config:
        from_attributes = True


class UserProgressResponse(BaseModel):
    """User progress statistics response."""
    total_cards_reviewed: int
    total_sessions: int
    average_accuracy: float
    decks_studied: int
    current_streak: int


class AppendHTMLRequest(BaseModel):
    html_content: str
