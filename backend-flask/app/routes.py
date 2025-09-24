
from flask import Blueprint, request, jsonify, current_app
from .recommendation import (
    get_all_items,
    recommend_clothes,   # cosine similarity flow
    recommend_outfit,    # OpenRouter AI flow
    fetch_style_tags,
    create_style_tags,
    insert_cloth,
    insert_cloth_style_relation,
    get_random_items
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


@bp.route("/recommend_ai", methods=["POST"])
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
    
@bp.route("/get_style_tags", methods=["GET"])
def get_style_tags():
    tags = fetch_style_tags()
    return jsonify(tags)

@bp.route("/add_style_tags", methods=["POST"])
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

@bp.route("/add_cloth", methods=["POST"])
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
    # Basic validation
    if not all([data.get("name"), data.get("type"), data.get("category"),
                data.get("colour"), data.get("image_url")]):
        return jsonify({"message": "Missing required fields"}), 400

    cloth = insert_cloth(
        data["name"], data["type"], data["category"], data["colour"], data["image_url"]
    )
    if not cloth:
        return jsonify({"message": "Insert failed"}), 500

    return jsonify(cloth), 201
    
@bp.route("/add_cloth_styles", methods=["POST"])
def add_cloth_styles():
    """
    Expecting JSON body:
    [
        {"cloth_id": 1, "style_id": 2},
        {"cloth_id": 1, "style_id": 3}
    ]
    """
    data = request.json
    if not isinstance(data, list) or not data:
        return jsonify({"message": "Invalid input, expected a non-empty list"}), 400
    try:
        response = insert_cloth_style_relation(data)
        return jsonify(response), 201
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@bp.route("/get_random_clothes", methods=["GET"])
def get_random_clothes():
    try:
        items = get_random_items()
        return jsonify(items)
    except Exception as e:
        return jsonify({"message": str(e)}), 500

@bp.route("/update_cloth", methods=["PUT"])
def update_cloth():
    data = request.json
    cloth_id = data.get("id")
    if not cloth_id:
        return jsonify({"message": "Missing cloth ID"}), 400
    # Fetch existing item
    existing_items = get_all_items()
    existing_item = next((item for item in existing_items if item['id'] == cloth_id), None)
    if not existing_item:
        return jsonify({"message": "Cloth not found"}), 404
    
    # Update fields if provided, else keep existing
    name = data.get("name", existing_item["name"])
    type_ = data.get("type", existing_item["type"])
    colour = data.get("colour", existing_item["colour"])
    updated_cloth = insert_cloth(name, type_,  colour)
    if not updated_cloth:
        return jsonify({"message": "Update failed"}), 500
    return jsonify(updated_cloth), 200
