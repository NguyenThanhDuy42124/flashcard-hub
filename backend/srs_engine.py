"""Spaced Repetition System (SuperMemo 2) implementation."""
from datetime import datetime, timedelta
from typing import Tuple


class SM2Engine:
    """SuperMemo 2 algorithm implementation for spaced repetition."""

    def __init__(self):
        """Initialize SM-2 engine with default parameters."""
        self.MIN_QUALITY = 0
        self.MAX_QUALITY = 5
        self.MIN_EASE = 1.3
        self.DEFAULT_EASE = 2.5

    def calculate_interval(
        self,
        repetitions: int,
        ease_factor: float,
        quality: int
    ) -> Tuple[int, float]:
        """
        Calculate next review interval and update ease factor using SM-2 algorithm.

        Args:
            repetitions: Number of times the card has been reviewed
            ease_factor: Current ease factor (difficulty multiplier)
            quality: Quality of recall (0-5 scale)
                - 5: Perfect response
                - 4: Correct response after some hesitation
                - 3: Correct response after serious difficulty
                - 2: Incorrect response; correct one remembered
                - 1: Incorrect response; correct one forgotten
                - 0: Complete blackout; correct response unknown

        Returns:
            Tuple of (new_interval_in_days, new_ease_factor)
        """
        # Validate quality input
        if quality < self.MIN_QUALITY:
            quality = self.MIN_QUALITY
        elif quality > self.MAX_QUALITY:
            quality = self.MAX_QUALITY

        # Calculate new ease factor
        new_ease = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))

        # Ensure ease factor doesn't go below minimum
        if new_ease < self.MIN_EASE:
            new_ease = self.MIN_EASE

        # Calculate interval based on quality and repetitions
        if quality < 3:
            # Failed response - reset interval
            new_interval = 1
            new_repetitions = 0
        else:
            # Successful response
            if repetitions == 0:
                new_interval = 1
            elif repetitions == 1:
                new_interval = 3
            else:
                new_interval = max(1, round(new_interval * new_ease))

            new_repetitions = repetitions + 1

        return new_interval, new_ease, new_repetitions

    def get_next_review_date(
        self,
        interval_days: int,
        base_date: datetime = None
    ) -> datetime:
        """
        Calculate next review date based on interval.

        Args:
            interval_days: Number of days until next review
            base_date: Base date to calculate from (defaults to now)

        Returns:
            Next review datetime
        """
        if base_date is None:
            base_date = datetime.utcnow()

        return base_date + timedelta(days=interval_days)

    def is_due_for_review(self, next_review_date: datetime) -> bool:
        """
        Check if a card is due for review.

        Args:
            next_review_date: Scheduled next review date

        Returns:
            True if card is due for review
        """
        return next_review_date <= datetime.utcnow()

    def get_difficulty_category(self, ease_factor: float) -> str:
        """
        Get difficulty category based on ease factor.

        Args:
            ease_factor: Current ease factor

        Returns:
            Difficulty category string
        """
        if ease_factor < 1.5:
            return "Very Difficult"
        elif ease_factor < 2.0:
            return "Difficult"
        elif ease_factor < 2.5:
            return "Medium"
        elif ease_factor < 3.0:
            return "Easy"
        else:
            return "Very Easy"


# Global SM2 instance
sm2_engine = SM2Engine()
