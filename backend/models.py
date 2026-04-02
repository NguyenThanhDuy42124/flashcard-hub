"""SQLAlchemy ORM models for the database."""
from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from datetime import datetime
from database import Base


class User(Base):
    """User account model."""
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(100), unique=True, index=True, nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    decks = relationship("Deck", back_populates="owner")
    study_sessions = relationship("StudySession", back_populates="user")


class Deck(Base):
    """Flashcard deck model."""
    __tablename__ = "decks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False, index=True)
    description = Column(Text, nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    is_public = Column(Boolean, default=True)
    allow_card_additions = Column(Boolean, default=True)
    expired_at = Column(DateTime, nullable=True, index=True)
    status = Column(String(20), nullable=False, default="active", index=True)
    tag = Column(String(255), nullable=True)  # For categorization

    # Relationships
    owner = relationship("User", back_populates="decks")
    cards = relationship("Card", back_populates="deck", cascade="all, delete-orphan")
    study_sessions = relationship("StudySession", back_populates="deck")


class Card(Base):
    """Individual flashcard model."""
    __tablename__ = "cards"

    id = Column(Integer, primary_key=True, index=True)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    title = Column(String(255), nullable=True, index=True, default=None)  # Card question/title
    chapter = Column(String(100), nullable=True, index=True, default=None)  # Chapter/section for grouping
    front = Column(Text, nullable=False)
    back = Column(Text, nullable=False)
    position = Column(Integer, nullable=True, index=True)  # Manual ordering within deck
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    deck = relationship("Deck", back_populates="cards")
    reviews = relationship("CardReview", back_populates="card", cascade="all, delete-orphan")


class StudySession(Base):
    """Study session tracking model."""
    __tablename__ = "study_sessions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    deck_id = Column(Integer, ForeignKey("decks.id"), nullable=False)
    started_at = Column(DateTime, default=datetime.utcnow)
    ended_at = Column(DateTime, nullable=True)
    cards_reviewed = Column(Integer, default=0)
    cards_correct = Column(Integer, default=0)

    # Relationships
    user = relationship("User", back_populates="study_sessions")
    deck = relationship("Deck", back_populates="study_sessions")
    card_reviews = relationship("CardReview", back_populates="study_session", cascade="all, delete-orphan")


class CardReview(Base):
    """SRS review record for each card."""
    __tablename__ = "card_reviews"

    id = Column(Integer, primary_key=True, index=True)
    card_id = Column(Integer, ForeignKey("cards.id"), nullable=False)
    study_session_id = Column(Integer, ForeignKey("study_sessions.id"), nullable=False)
    quality = Column(Integer, nullable=False)  # 0-5 rating from SM-2
    ease_factor = Column(Float, default=2.5)  # SM-2 ease factor
    interval = Column(Integer, default=1)  # Days until next review
    repetitions = Column(Integer, default=0)  # Number of times reviewed
    next_review_date = Column(DateTime, nullable=True)
    reviewed_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    card = relationship("Card", back_populates="reviews")
    study_session = relationship("StudySession", back_populates="card_reviews")
