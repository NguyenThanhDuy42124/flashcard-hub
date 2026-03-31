"""Add title and chapter columns to cards table.

Revision ID: 002
Revises: 001
Create Date: 2026-03-31

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade():
    # Add title and chapter columns to cards table
    op.add_column('cards', sa.Column('title', sa.String(255), nullable=True))
    op.add_column('cards', sa.Column('chapter', sa.String(100), nullable=True))
    
    # Create indexes for better query performance
    op.create_index(op.f('ix_cards_title'), 'cards', ['title'])
    op.create_index(op.f('ix_cards_chapter'), 'cards', ['chapter'])


def downgrade():
    # Drop indexes
    op.drop_index(op.f('ix_cards_chapter'), table_name='cards')
    op.drop_index(op.f('ix_cards_title'), table_name='cards')
    
    # Drop columns
    op.drop_column('cards', 'chapter')
    op.drop_column('cards', 'title')
