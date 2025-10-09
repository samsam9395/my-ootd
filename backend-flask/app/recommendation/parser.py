import json

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
