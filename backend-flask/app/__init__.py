from flask import Flask, request
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
    app.register_blueprint(cloth_bp, url_prefix="/api/clothes", strict_slashes=False)
    app.register_blueprint(rec_bp, url_prefix="/api/recommendations", strict_slashes=False)

    # Allow all routes from localhost:3000 (dev only)
    CORS(app, origins=[
        "http://localhost:3000",
        "https://my-ootd-samsam9395s-projects.vercel.app",
    ], supports_credentials=True,  methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["Content-Type", "Authorization"])
    
    # --- ✅ Dynamic CORS for vercel preview URLs ---
    @app.after_request
    def apply_cors(response):
        origin = request.headers.get("Origin")
        if origin and origin.endswith(".vercel.app"):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Vary"] = "Origin"
            response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    # ---------------------------------------------
    
    return app