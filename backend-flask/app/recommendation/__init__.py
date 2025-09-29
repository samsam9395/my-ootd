from flask import Blueprint

# Create the blueprint
recommendation_bp = Blueprint("recommendation", __name__, url_prefix="/recommendation")

# Re-export functions from service modules for easier imports
from .db_service import (
    get_all_items,
    fetch_style_tags,
    create_style_tags,
    insert_cloth,
    insert_cloth_style_relation,
    get_random_items,
    update_cloth_in_db,
    delete_cloth_in_db
)
from .embedding_service import recommend_clothes, prefilter_candidates
from .recommendation_service import recommend_outfit
