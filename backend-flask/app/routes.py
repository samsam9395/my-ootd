
from flask import Blueprint, request, jsonify, current_app
from .recommendation import (
    get_all_items,
    recommend_clothes,   # cosine similarity flow
    recommend_outfit,    # OpenRouter AI flow
    fetch_style_tags,
    create_style_tags,
    insert_cloth,
    insert_cloth_style_relation,
    get_random_items,
    update_cloth_in_db,
    delete_cloth_in_db
)

import os

bp = Blueprint("routes", __name__)


