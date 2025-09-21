
from flask import Blueprint, request, jsonify, current_app
from .recommendation import (
    get_all_items,
    recommend_clothes,   # cosine similarity flow
    recommend_outfit,    # OpenRouter AI flow
    fetch_style_tags,
    create_style_tags
)

import os

bp = Blueprint("routes", __name__)

@bp.route("/recommend_cosine",methods=["POST"])
def recommend_cosine():
    data = request.json
    selected_item_id = data.get("item_id")
    
    # Fetch all clothes using current app configs
    all_items = get_all_items()
    
    selected_item = next((item for item in all_items if item['id'] == selected_item_id), None)
    if not selected_item:
        return jsonify({"error": "Item not found"}), 404

    recs = recommend_clothes(
        selected_item,
        all_items,
        top_k=5,
        model_name=current_app.config["HF_MODEL_NAME"]
    )
    return jsonify(recs)

@bp.route("/get_style_tags", methods=["GET"])
def get_style_tags():
    tags = fetch_style_tags()
    return jsonify(tags)

@bp.route("/add_style_tags", methods=["POST"])
def add_style_tags():
    data = request.json
    # Expecting { names: ["casual", "formal", ...] }
    names: list[str] = data.get("names", [])
    if not names:
        return jsonify({"message": "No style names provided"}), 400
    
    add_styles_res = create_style_tags(
        names=names
    )
    return jsonify(add_styles_res)

@bp.route("/recommend_ai", methods=["POST"])
def recommend_ai():
    data = request.json
    selected_item_id = data.get("item_id")
    try:
        outfit = recommend_outfit(
            selected_item_id=selected_item_id)
        return jsonify(outfit)
    except Exception as e:
        return jsonify({"error": str(e)}), 500