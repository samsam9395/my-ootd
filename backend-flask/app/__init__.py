from flask import Flask, app
from flask_cors import CORS
import os
from dotenv import load_dotenv

def create_app():
    # Load .env only in development
    if os.getenv("FLASK_ENV") != "production":
        load_dotenv()

    app = Flask(__name__)

    # Configs
    app.config["SUPABASE_URL"] = os.getenv("SUPABASE_URL")
    app.config["SUPABASE_KEY"] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    app.config["HF_MODEL_NAME"] = os.getenv("HF_MODEL_NAME", "all-MiniLM-L6-v2")

   # Allow all routes from localhost:3000 (dev only)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True, methods=["GET","POST","OPTIONS"])

    # Register routes
    from .routes import bp as routes_bp
    app.register_blueprint(routes_bp)

    return app