# Re-export specific functions for easier imports in routes.py
from .db_service import get_all_items
from .embedding_service import recommend_clothes, prefilter_candidates
from .recommendation_service import recommend_outfit