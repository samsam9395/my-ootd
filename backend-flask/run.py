import os
from app import create_app

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 10000))  # ✅ Changed to 10000 (Render's default)
    debug_mode = os.environ.get("FLASK_ENV") != "production"  # ✅ Only debug in dev
    app.run(host="0.0.0.0", port=port, debug=debug_mode)