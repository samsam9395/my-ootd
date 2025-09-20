from supabase import create_client

# Fetch all items
def get_all_items(supabase_url, supabase_key):
    supabase = create_client(supabase_url, supabase_key)
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
