"""
SQL scripts for manual database setup test
Run these if migrations fail
"""

CREATE DATABASE IF NOT EXISTS flashcard_hub
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE flashcard_hub;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(100) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_username (username),
  INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Decks table
CREATE TABLE IF NOT EXISTS decks (
  id INT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  owner_id INT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  is_public BOOLEAN DEFAULT TRUE,
  tag VARCHAR(255),
  FOREIGN KEY (owner_id) REFERENCES users(id),
  UNIQUE KEY unique_title_owner (title, owner_id),
  INDEX idx_title (title),
  INDEX idx_owner_id (owner_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Cards table
CREATE TABLE IF NOT EXISTS cards (
  id INT AUTO_INCREMENT PRIMARY KEY,
  deck_id INT NOT NULL,
  front LONGTEXT NOT NULL,
  back LONGTEXT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  INDEX idx_deck_id (deck_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Study sessions table
CREATE TABLE IF NOT EXISTS study_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  deck_id INT NOT NULL,
  started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  ended_at DATETIME,
  cards_reviewed INT DEFAULT 0,
  cards_correct INT DEFAULT 0,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (deck_id) REFERENCES decks(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_deck_id (deck_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Card reviews table (SRS data)
CREATE TABLE IF NOT EXISTS card_reviews (
  id INT AUTO_INCREMENT PRIMARY KEY,
  card_id INT NOT NULL,
  study_session_id INT NOT NULL,
  quality INT NOT NULL,
  ease_factor FLOAT DEFAULT 2.5,
  interval INT DEFAULT 1,
  repetitions INT DEFAULT 0,
  next_review_date DATETIME,
  reviewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (card_id) REFERENCES cards(id) ON DELETE CASCADE,
  FOREIGN KEY (study_session_id) REFERENCES study_sessions(id) ON DELETE CASCADE,
  INDEX idx_card_id (card_id),
  INDEX idx_study_session_id (study_session_id),
  INDEX idx_next_review_date (next_review_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE utf8mb4_unicode_ci;
