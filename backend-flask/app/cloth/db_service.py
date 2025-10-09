from supabase import create_client
from flask import current_app, g
import unicodedata

_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            current_app.config["SUPABASE_URL"],
            current_app.config["SUPABASE_KEY"]
        )
    return _supabase

# -------------------------------
# Helper to get current user_id from token (set in g.user_id by token_required)
# -------------------------------
def get_current_user_id():
    return getattr(g, "user_id", None)


# Fetch cloth by type and pagination
def get_clothes_by_type(category: str | None, limit: int, offset: int):
    user_id = get_current_user_id()
    if not user_id:
        return []

    supabase = get_supabase()
    query = supabase.table("clothes").select("""
        id, name, type, colour, category, image_url,
        clothes_styles!inner(
            styles!inner(id, name)
        )
    """).eq("user_id", user_id).range(offset, offset + limit - 1)
    
    if category and category.lower() != "all":
        query = query.eq("category", category.lower())

    data = query.execute()
    result = [
        {
            "id": row["id"],
            "name": row["name"],
            "type": row["type"],
            "colour": row["colour"],
            "category": row["category"],
            "styles": [cs["styles"]["name"] for cs in row.get("clothes_styles", []) if cs.get("styles")],
            "image_url": row["image_url"]
        }
        for row in data.data
    ]
    return result

# Fetch all items
def get_all_items():
    supabase = get_supabase()
    user_id = get_current_user_id()
    
    if not user_id:
        return []  # or handle unauthorized
    
    try:
        response = supabase.table("clothes").select("""
            id,
            name,
            type,
            colour,
            category,
            image_url,
            clothes_styles (
                styles (
                    id,
                    name
                )
            )
        """).eq("user_id", user_id).execute()
        
        return response.data
    except Exception as e:
        print("Error fetching items:", e)
        return None
   

# Fetch all style tags
def fetch_style_tags():
    supabase = get_supabase()
    try:
        response = supabase.table("styles").select("*").execute()
        return response.data
    except Exception as e:
        print("Error fetching style tags:", e)
        return None

# Add new style tags
def create_style_tags(names):
    supabase = get_supabase()
    new_tags = [{"name": name.strip().lower()} for name in names if name.strip()]
    
    if not new_tags:  # nothing new
        return []  

    try:
        response = supabase.table("styles").upsert(new_tags, on_conflict="name").execute()
        return response.data   # this is already your inserted rows
    except Exception as e:
        # handle the Supabase error
        print("Error inserting style tags:", e)
        return None

# Add cloth style relation table
def insert_cloth_style_relation(cloth_styles):
    supabase = get_supabase()
    try:
        response = supabase.table("clothes_styles").upsert(cloth_styles).execute()
        return response.data
    except Exception as e:
        print("Error inserting cloth styles:", e)
        return None

# Get random 5 items for Shuffle
def get_random_items():
    supabase = get_supabase()
    user_id = get_current_user_id()
    try:
        response = supabase.rpc("get_random_clothes", {"p_user_id": user_id, "limit_count": 5}).execute()
        return response.data

    except Exception as e:
        print("Error fetching random items:", e)
        return None
    


# Add cloth item
def insert_cloth(name,type_, category, colour):
    user_id = get_current_user_id()
    if not user_id:
        return None
    
    supabase = get_supabase()
    # Normalize here
    clean_name = unicodedata.normalize('NFC', name)
    name = clean_name.strip()
    type_ = unicodedata.normalize('NFC', type_).strip().lower()
    category = unicodedata.normalize('NFC', category).strip().lower()
    colour = unicodedata.normalize('NFC', colour).strip().lower()

    try:
        # 1. Check if cloth with the same name exists
        existing = supabase.table("clothes").select("*")\
            .eq("name", name).eq("user_id", user_id).execute()
        
        if existing.data and len(existing.data) > 0:
            # 2. Update existing row
            cloth_id = existing.data[0]["id"]
            response = supabase.table("clothes").update({
                "type": type_,
                "category": category,
                "colour": colour,
            }).eq("id", cloth_id).execute()
            return response.data[0]
        else:
            # 3. Insert new row
            response = supabase.table("clothes").insert({
                "name": name,
                "type": type_,
                "category": category,
                "colour": colour,
                "user_id": user_id,
            }).execute()
            return response.data[0] if response.data else None
    except Exception as e:
        print("Error inserting cloth:", e)
        return None


    # Update existing cloth item using RPC (transactional)
def update_cloth_in_db(cloth_id, cloth_data):
    user_id = get_current_user_id()
    if not user_id:
        return {"success": False, "error": "Unauthorized"}

    supabase = get_supabase()
    # verify ownership
    existing = supabase.table("clothes").select("id")\
        .eq("id", cloth_id).eq("user_id", user_id).execute()
    if not existing.data:
        return {"success": False, "error": "Cloth not found or not yours"}


    try:
        # 1. Extract style IDs from input
        style_ids = []
        new_style_names = []

        for s in cloth_data.get("styles", []):
            if s.get("id"):  # existing style
                style_ids.append(int(s["id"]))
            elif s.get("name"):  # new style
                new_style_names.append(s["name"].strip().lower())

        # 2. Ensure new styles exist (returns rows with IDs)
        new_style_rows = create_style_tags(new_style_names) if new_style_names else []

        # 3. Combine all style IDs
        all_style_ids = style_ids + [row["id"] for row in (new_style_rows or [])]

        # 4. Call the RPC to update cloth and relations in a transaction
        response = supabase.rpc(
    "update_cloth_with_styles",
    {
        "p_user_id": user_id,
        "p_cloth_id": cloth_id,
        "p_name": cloth_data["name"],
        "p_colour": cloth_data["colour"],
        "p_type": cloth_data["type"],
        "p_style_ids": all_style_ids  # list of integers
    }
).execute()
        return {"success": True}

    except Exception as e:
        print("Error in update_cloth_in_db:", e)
        return {"success": False, "error": str(e)}
        
        
# Update cloth image URL only 
def update_cloth_url(cloth_id: int, image_url:str) -> bool:
    user_id = get_current_user_id()
    if not user_id:
            return False


    supabase = get_supabase()
    try:
        res = supabase.table("clothes").update({"image_url":image_url}).eq("id", cloth_id).execute()
        return bool(res.data)  # True if at least one row updated
    except Exception as e:
        print("Error updating cloth URL:", e)
        return False

# Delete cloth item
def delete_cloth_in_db(cloth_id: int) -> bool:
    """
    Deletes a cloth item by its ID.
    Returns True if deletion succeeded, False otherwise.
    """
    
    user_id = get_current_user_id()
    if not user_id:
        return False

    supabase = get_supabase()
    
    try:
        #get cloth item first for image path
        cloth_res = supabase.table("clothes").select("image_url")\
            .eq("id", cloth_id).eq("user_id", user_id).execute()
        
        if not cloth_res.data:
            return False # cloth not found

        image_url = cloth_res.data[0].get("image_url")
        
        #delete from database first
        delete_res = supabase.table("clothes").delete()\
            .eq("id", cloth_id).eq("user_id", user_id).execute()
        
        if not delete_res.data:
            return False #deletion failed
        
        #delete image from storage
        if image_url:
            try:
                # Extract the file path from url
                if "/clothes-images/" in image_url:
                    file_path = image_url.split("clothes-images/")[1]
                    # Remove any query parameters
                    file_path = file_path.split("?")[0]
                    
                    supabase.storage.from_("clothes-images").remove([file_path])
            except Exception as storage_error:
                # Log the error but do not fail the whole operation
                print(f"Warning:Failed to delete image from storage: {storage_error}")
        return True
    except Exception as e:
        print(f"Error deleting cloth item: {e}")
        return False

# Fetch selected item and relevant items sharing styles
def get_relevant_items_by_shared_styles(selected_item_id: int, top_n_per_category: int = 3):
    """
    Fetch the selected item and related items that share style tags.
    Returns:
        selected_item: dict
        grouped_shortlist: dict {category: [items]}
    """
    user_id = get_current_user_id()
    if not user_id:
        return None, {}

    supabase = get_supabase()

    # Step 1: Fetch selected item
    selected_resp = (
        supabase.table("clothes")
        .select("""
            id,
            name,
            type,
            colour,
            category,
            image_url,
            clothes_styles (
                styles (
                    id,
                    name
                )
            )
        """)
        .eq("user_id", user_id)
        .eq("id", selected_item_id)
        .single()
        .execute()
    )
    selected_item = selected_resp.data
    if not selected_item:
        return None, {}
    
    # convert selected_item id
    selected_item["id"] = int(selected_item["id"])
    
    # convert clothes_styles ids
    for cs in selected_item.get("clothes_styles", []):
        if cs.get("styles"):
            cs["styles"]["id"] = int(cs["styles"]["id"])

    # Step 2: Get selected item's style IDs
    style_ids = [s["styles"]["id"] for s in selected_item.get("clothes_styles", []) if s.get("styles")]
    if not style_ids:
        return selected_item, {}

    # Step 3: Get other clothes sharing any of these styles
    clothes_styles_resp = (
        supabase.table("clothes_styles")
        .select("cloth_id, style_id")
        .in_("style_id", style_ids)
        .neq("cloth_id", selected_item_id)
        .execute()
    )

    # Step 4: Count shared styles per cloth_id
    shared_count = {}
    for row in clothes_styles_resp.data:
        cid = row["cloth_id"]
        shared_count[cid] = shared_count.get(cid, 0) + 1

    related_clothes_ids = list(shared_count.keys())
    if not related_clothes_ids:
        return selected_item, {}

    # Step 5: Fetch full data for related clothes
    clothes_resp = (
        supabase.table("clothes")
        .select("""
            id,
            name,
            type,
            colour,
            category,
            image_url,
            clothes_styles (
                styles (
                    id,
                    name
                )
            )
        """)
        .eq("user_id", user_id)
        .in_("id", related_clothes_ids)
        .execute()
    )
    all_items = clothes_resp.data or []

    # Step 6: Sort by number of shared styles & group by category
    relevant_style_items = {}
    for item in sorted(all_items, key=lambda x: shared_count.get(x["id"], 0), reverse=True):
        cat = item["category"]
        if cat not in relevant_style_items:
            relevant_style_items[cat] = []
        if len(relevant_style_items[cat]) < top_n_per_category:
            relevant_style_items[cat].append({
                "id": item["id"],
                "name": item["name"],
                "type": item["type"],
                "colour": item["colour"],
                "category": item["category"],
                "styles": [s["styles"]["name"] for s in item.get("clothes_styles", []) if s.get("styles")],
                "image_url": item["image_url"]
            })

    return selected_item, relevant_style_items
