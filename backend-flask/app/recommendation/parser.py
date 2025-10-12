import json
from app.cloth.db_service import get_details_for_ids

def map_ai_json_to_db_items(ai_res_json, relevant_style_items):
    """
    Map AI JSON response to DB items. Only include items that exist in relevant_style_items.
    Returns outfit dict with style_phrase and style_flair if at least one item found.
    Returns {"success": False, "message": "..."} if no valid items can be mapped.
    """
    # Normalize input: could be str, dict, list, or unexpected
    if isinstance(ai_res_json, str):
        try:
            ai_res_json = json.loads(ai_res_json)
        except json.JSONDecodeError:
            return {"success": False, "message": "Invalid AI response format"}
    
    # If AI returned a list with one object inside, extract it
    if isinstance(ai_res_json, list) and len(ai_res_json) == 1 and isinstance(ai_res_json[0], dict):
        ai_res_json = ai_res_json[0]
    
    # If it's not a dict at this point, we can't process it
    if not isinstance(ai_res_json, dict):
        return {"success": False, "message": "Unexpected AI response type"}

    outfit = {
        "success": True,
        "message": "Recommendations available",
        "items": [],
    }
    has_item = False

    for category, value in ai_res_json.items():
        if category in ["style_phrase", "style_flair"]:
            outfit[f"_{category}"] = value
            continue

        # Get items of that category from DB
        category_items = relevant_style_items.get(category, [])
        # Find DB item by ID
        db_item = next((item for item in category_items if item["id"] == value), None)
        if db_item:
            outfit["items"].append({
                "id": db_item.get("id"),
                "type": db_item.get("type"),
                "name": db_item.get("name"),
                "colour": db_item.get("colour"),
                "image_url": db_item.get("image_url"),
                "styles": db_item.get("styles", []),
                "category": db_item.get("category"),
            })
            has_item = True

    if not has_item:
        return {"success": False, "message": "No recommendations available"}

    return outfit

def map_ai_json_to_db_details(ai_res_json):
    """
    Map AI JSON response (category -> cloth_id) to full DB details.
    Returns outfit dict with success, message, and items list.
    """
    # Normalize input: could be str, dict, list, or unexpected
    if isinstance(ai_res_json, str):
        try:
            ai_res_json = json.loads(ai_res_json)
        except json.JSONDecodeError:
            return {"success": False, "message": "Invalid AI response format"}
    
    # If AI returned a list with one object inside, extract it
    if isinstance(ai_res_json, list) and len(ai_res_json) == 1 and isinstance(ai_res_json[0], dict):
        ai_res_json = ai_res_json[0]
    
    # If it's not a dict at this point, we can't process it
    if not isinstance(ai_res_json, dict):
        return {"success": False, "message": "Unexpected AI response type"}

    # --- Extract cloth IDs (skip style_phrase and style_flair) ---
    top_ids = [v for k, v in ai_res_json.items() if k not in ["style_phrase", "style_flair"]]

    # --- Fetch full details from DB ---
    db_items = get_details_for_ids(top_ids, with_image=True)
    db_items_map = {item["id"]: item for item in db_items}

    outfit = {
        "success": True,
        "message": "Recommendations available",
        "items": [],
        "style_phrase": ai_res_json.get("style_phrase", ""),
        "style_flair": ai_res_json.get("style_flair", ""),
    }

    # --- Map AI categories to DB items ---
    for category, cloth_id in ai_res_json.items():
        if category in ["style_phrase", "style_flair"]:
            continue
        db_item = db_items_map.get(cloth_id)
        if db_item:
            outfit["items"].append({
                "id": db_item.get("id"),
                "type": db_item.get("type"),
                "name": db_item.get("name"),
                "colour": db_item.get("colour"),
                "category": db_item.get("category"),
                "image_url": db_item.get("image_url"),
                "styles": db_item.get("styles", []),
            })

    if not outfit["items"]:
        return {"success": False, "message": "No recommendations available"}

    return outfit