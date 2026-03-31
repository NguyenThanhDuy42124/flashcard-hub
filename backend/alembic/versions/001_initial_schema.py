"""Initial migration - Create tables."""
from alembic import op
import sqlalchemy as sa


revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Create initial database schema."""
    # Create users table
    op.create_table(
        'users',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('username', sa.String(100), nullable=False),
        sa.Column('email', sa.String(100), nullable=False),
        sa.Column('password_hash', sa.String(255), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('username'),
        sa.UniqueConstraint('email')
    )
    op.create_index('ix_users_username', 'users', ['username'])
    op.create_index('ix_users_email', 'users', ['email'])

    # Create decks table
    op.create_table(
        'decks',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('title', sa.String(255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('owner_id', sa.Integer(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.Column('is_public', sa.Boolean(), nullable=False, default=True),
        sa.Column('tag', sa.String(255), nullable=True),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['owner_id'], ['users.id']),
        sa.UniqueConstraint('title', 'owner_id')
    )
    op.create_index('ix_decks_title', 'decks', ['title'])
    op.create_index('ix_decks_owner_id', 'decks', ['owner_id'])

    # Create cards table
    op.create_table(
        'cards',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=False),
        sa.Column('front', sa.Text(), nullable=False),
        sa.Column('back', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ondelete='CASCADE')
    )
    op.create_index('ix_cards_deck_id', 'cards', ['deck_id'])

    # Create study_sessions table
    op.create_table(
        'study_sessions',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('user_id', sa.Integer(), nullable=False),
        sa.Column('deck_id', sa.Integer(), nullable=False),
        sa.Column('started_at', sa.DateTime(), nullable=False),
        sa.Column('ended_at', sa.DateTime(), nullable=True),
        sa.Column('cards_reviewed', sa.Integer(), nullable=False, default=0),
        sa.Column('cards_correct', sa.Integer(), nullable=False, default=0),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['user_id'], ['users.id']),
        sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], ondelete='CASCADE')
    )
    op.create_index('ix_study_sessions_user_id', 'study_sessions', ['user_id'])
    op.create_index('ix_study_sessions_deck_id', 'study_sessions', ['deck_id'])

    # Create card_reviews table
    op.create_table(
        'card_reviews',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('card_id', sa.Integer(), nullable=False),
        sa.Column('study_session_id', sa.Integer(), nullable=False),
        sa.Column('quality', sa.Integer(), nullable=False),
        sa.Column('ease_factor', sa.Float(), nullable=False, default=2.5),
        sa.Column('interval', sa.Integer(), nullable=False, default=1),
        sa.Column('repetitions', sa.Integer(), nullable=False, default=0),
        sa.Column('next_review_date', sa.DateTime(), nullable=True),
        sa.Column('reviewed_at', sa.DateTime(), nullable=False),
        sa.PrimaryKeyConstraint('id'),
        sa.ForeignKeyConstraint(['card_id'], ['cards.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['study_session_id'], ['study_sessions.id'], ondelete='CASCADE')
    )
    op.create_index('ix_card_reviews_card_id', 'card_reviews', ['card_id'])
    op.create_index('ix_card_reviews_study_session_id', 'card_reviews', ['study_session_id'])
    op.create_index('ix_card_reviews_next_review_date', 'card_reviews', ['next_review_date'])


def downgrade() -> None:
    """Drop all tables."""
    op.drop_index('ix_card_reviews_next_review_date', 'card_reviews')
    op.drop_index('ix_card_reviews_study_session_id', 'card_reviews')
    op.drop_index('ix_card_reviews_card_id', 'card_reviews')
    op.drop_table('card_reviews')

    op.drop_index('ix_study_sessions_deck_id', 'study_sessions')
    op.drop_index('ix_study_sessions_user_id', 'study_sessions')
    op.drop_table('study_sessions')

    op.drop_index('ix_cards_deck_id', 'cards')
    op.drop_table('cards')

    op.drop_index('ix_decks_owner_id', 'decks')
    op.drop_index('ix_decks_title', 'decks')
    op.drop_table('decks')

    op.drop_index('ix_users_email', 'users')
    op.drop_index('ix_users_username', 'users')
    op.drop_table('users')
