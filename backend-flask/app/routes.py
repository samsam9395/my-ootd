
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

#Create new cloth item
@bp.route("/api/clothes", methods=["POST"])
def add_cloth():
    """
    Expecting JSON body:
    {
        "name": "T-shirt",
        "colour": "Red",
        "image_url": "https://..."
    }
    """
    data = request.json
    print('request data:', data)
    # Basic validation
    if not all([data.get("name"), data.get("type"), data.get("category"),
                data.get("colour"), data.get("image_url")]):
        return jsonify({"message": "Missing required fields"}), 400

    cloth = insert_cloth(
    name=data.get("name", "").strip(),
    type_=data.get("type", "").strip(),
    category=data.get("category", "").strip(),
    colour=data.get("colour", "").strip(),
    image_url=data.get("image_url", "").strip()
)
    if not cloth:
        return jsonify({"message": "Insert failed"}), 500

    return jsonify(cloth), 201


# Update existing cloth itemupdate_cloth
@bp.route("/api/clothes/<int:id>", methods=["PUT"])
def update_cloth(id):
    data = request.json
    try:
        result = update_cloth_in_db(id, data)
        if not id or not data:
            return jsonify({"message": "No valid fields to update"}), 400
        return jsonify({"success": True, "updated": result}), 200
    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500


# Get random clothes for Shuffle
@bp.route("/api/clothes/random", methods=["GET"])
def get_random_clothes():
    try:
        items = get_random_items()
        return jsonify(items)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

# Cosine similarity recommendation
@bp.route("/api/recommendations/cosine",methods=["POST"])
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

# AI-based recommendation
@bp.route("/api/recommendations/ai", methods=["POST"])
def recommend_ai():
    data = request.json
    selected_item_id = data.get("item_id")
    print("Selected item ID:", selected_item_id)
    try:
        outfit = recommend_outfit(
            selected_item_id=selected_item_id)
        return jsonify(outfit)
    except Exception as e:
        print("Error in /recommend_ai:", e)
        return jsonify({"error": str(e)}), 500

# Fetch style tags
@bp.route("/api/style-tags", methods=["GET"])
def get_style_tags():
    tags = fetch_style_tags()
    return jsonify(tags)

# Add new style tags
@bp.route("/api/style-tags", methods=["POST"])
def add_style_tags():
    data = request.json
    """
    Expecting { names: ["casual", "formal", ...] }
    """
    names: list[str] = data.get("names", [])
    if not names:
        return jsonify({"message": "No style names provided"}), 400

    add_styles_res = create_style_tags(
        names=[name.lower() for name in names]
    )
    return jsonify(add_styles_res)


# Add styles to a cloth item
@bp.route("/api/cloth_styles", methods=["POST"])
def add_cloth_styles():
    """
    Expecting JSON body:
    [
        {"cloth_id": 1, "style_id": 2},
        {"cloth_id": 1, "style_id": 3}
    ]
    """
    data = request.json
    print("Received cloth-style relation data:", data)
    if not isinstance(data, list) or not data:
        return jsonify({"message": "Invalid input, expected a non-empty list"}), 400
    try:
        response = insert_cloth_style_relation(data)
        print("Insert cloth-style relation response:", response)
        return jsonify(response), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

#Delete cloth item
@bp.route("/api/clothes/<int:id>", methods=["DELETE"])
def delete_cloth(id):
    if not id:
        return jsonify({"message": "Cloth ID is required"}), 400
    try:
        success = delete_cloth_in_db(id)
        if not success:
            return jsonify({"message": "Cloth not found or delete failed"}), 404
        return jsonify({"message": "Cloth deleted successfully"}), 200
    except Exception as e:
        return jsonify({"message": str(e)}), 500