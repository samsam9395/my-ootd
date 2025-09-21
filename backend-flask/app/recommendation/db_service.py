from supabase import create_client
from flask import current_app

_supabase = None

def get_supabase():
    global _supabase
    if _supabase is None:
        _supabase = create_client(
            current_app.config["SUPABASE_URL"],
            current_app.config["SUPABASE_KEY"]
        )
    return _supabase



# Fetch all items
def get_all_items():
    supabase = get_supabase()
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
    """).execute()
    return response.data

# Fetch all style tags
def fetch_style_tags():
    supabase = get_supabase()
    response = supabase.table("styles").select("*").execute()
    return response.data

# Add new style tags
def create_style_tags(names):
    supabase = get_supabase()
    new_tags = [{"name": name} for name in names]
    response = supabase.table("styles").insert(new_tags).execute()
    return response.data