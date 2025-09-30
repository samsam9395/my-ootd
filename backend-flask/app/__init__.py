from flask import Flask, app
from flask_cors import CORS
import os
from dotenv import load_dotenv
from .auth import auth_bp
from .cloth import bp as cloth_bp
from .recommendation import bp as rec_bp

def create_app():
    # Load .env only in development
    if os.getenv("FLASK_ENV") != "production":
        load_dotenv()

    app = Flask(__name__)

    # Configs
    app.config["SUPABASE_URL"] = os.getenv("SUPABASE_URL")
    app.config["SUPABASE_KEY"] = os.getenv("SUPABASE_SERVICE_ROLE_KEY")
    app.config["OPEN_ROUTER_API_KEY"] = os.getenv("OPEN_ROUTER_API_KEY")

   

    # Register blueprints
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(cloth_bp, url_prefix="/api/clothes")
    app.register_blueprint(rec_bp, url_prefix="/api/recommendations")

    # Allow all routes from localhost:3000 (dev only)
    CORS(app, origins=["http://localhost:3000"], supports_credentials=True,  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
    
    return app