from flask import Flask, request
from flask_cors import CORS
import os, psutil, time, threading
from dotenv import load_dotenv
from .auth import auth_bp
from .cloth import bp as cloth_bp
from .recommendation import bp as rec_bp

def monitor_memory_during_startup():
    process = psutil.Process(os.getpid())
    for i in range(10):  # check 10 times (~10 seconds)
        mem = process.memory_info().rss / 1024 / 1024  # in MB
        print(f"[MEMORY DEBUG] Flask using: {mem:.2f} MB")
        time.sleep(1)
        
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

    # --- ✅ FIXED CORS Configuration ---
    # Define allowed origins
    allowed_origins = [
        "http://localhost:3000",
        "https://my-ootd.vercel.app",  # Production domain
    ]
    # CORS for specific origins
    CORS(
        app,
        resources={r"/api/*": {"origins": allowed_origins}},
        supports_credentials=True,
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Content-Type"],
    )
    # Dynamic CORS for Vercel preview URLs
    @app.after_request
    def apply_dynamic_cors(response):
        origin = request.headers.get("Origin")
        
        # Allow any *.vercel.app subdomain
        if origin and (origin.endswith(".vercel.app") or origin in allowed_origins):
            response.headers["Access-Control-Allow-Origin"] = origin
            response.headers["Access-Control-Allow-Credentials"] = "true"
            response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
            response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
            response.headers["Vary"] = "Origin"
        
        return response
    
    # Health check endpoint for Render
    @app.route("/health")
    def health():
        return {"status": "ok"}, 200
    
    # After initializing blueprints, models, etc.
    threading.Thread(target=monitor_memory_during_startup, daemon=True).start()
    return app