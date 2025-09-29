from flask import request, jsonify, g, make_response
import datetime
import os, jwt, datetime, uuid
import bcrypt
from functools import wraps
from . import auth_bp # import the blueprint

from app.recommendation.db_service import get_supabase



SECRET_KEY = os.getenv("SECRET_KEY_BACKEND", "dev-secret")
nowUTC = datetime.datetime.now(datetime.timezone.utc)

# ---------------- JWT decorator ----------------
def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return jsonify({"error":"Missing token"}), 401
        token = auth_header.split(" ",1)[1]
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            return jsonify({"error":"Token expired"}), 401
        except:
            return jsonify({"error":"Invalid token"}), 401
        g.user_id = payload["sub"]
        return f(*args, **kwargs)
    return decorated

# ---------------- Signup ----------------
@auth_bp.route("/signup", methods=["POST"])
def signup():
    data = request.json
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")
    
    print('request data:', data)

    if not email or not username or not password:
        return jsonify({"error":"Missing fields"}), 400

    if len(password) < 8 or not any(c.isalpha() for c in password) or not any(c.isdigit() for c in password):
        return jsonify({"error":"Password must be at least 8 characters and include at least one letter and one number"}), 400

    if len(password.encode("utf-8")) > 72:  # count bytes
        print('Password too long', password, len(password.encode("utf-8")))
        return jsonify({"error": "Password too long; max 72 bytes"}), 400

    supabase = get_supabase()

    # Check if email/username exists
    if supabase.table("users").select("*").eq("email", email).execute().data:
        return jsonify({"error":"Email exists"}), 400
    if supabase.table("users").select("*").eq("username", username).execute().data:
        return jsonify({"error":"Username exists"}), 400

    # Hash password correctly
    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    print('password_hash generated', password_hash)

    # Insert user
    user = supabase.table("users").insert({
        "email": email,
        "username": username,
        "password_hash": password_hash,
        "created_at": nowUTC.isoformat()  # convert datetime to string
    }).execute()
    user_id = user.data[0]["id"]

    # Create tokens
    access_token = jwt.encode({
        "sub": user_id,
        "exp": nowUTC + datetime.timedelta(minutes=15)
    }, SECRET_KEY, algorithm="HS256")

    refresh_jti = str(uuid.uuid4())
    refresh_token = jwt.encode({
        "sub": user_id,
        "jti": refresh_jti,
        "exp": nowUTC + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

    # Store refresh token
    supabase.table("refresh_tokens").insert({
        "user_id": user_id,
        "jti": refresh_jti,
        "revoked": False,
        "expires_at": (nowUTC + datetime.timedelta(days=7)).isoformat()
    }).execute()

    # Only return JSON-serializable data
    user_response = {
        "id": user_id,
        "email": email,
        "username": username
    }

    resp = make_response(jsonify({"access_token": access_token, "user": user_response}))
    resp.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Lax")
    return resp, 201
# ---------------- Login ----------------
@auth_bp.route("/login", methods=["POST"])
def login():
    supabase = get_supabase()
    data = request.json
    email = data.get("email")
    username = data.get("username")
    password = data.get("password")

    res = supabase.table("users").select("*").eq("email", email).execute()
    if not res.data:
        return jsonify({"error":"Invalid credentials"}), 401

    user = res.data[0]
    if not bcrypt.verify(password, user["password_hash"]):
        return jsonify({"error":"Invalid credentials"}), 401

    user_id = user["id"]

    access_token = jwt.encode({
        "sub": user_id,
        "exp": nowUTC + datetime.timedelta(minutes=15)
    }, SECRET_KEY, algorithm="HS256")

    refresh_jti = str(uuid.uuid4())
    refresh_token = jwt.encode({
        "sub": user_id,
        "jti": refresh_jti,
        "exp": nowUTC + datetime.timedelta(days=7)
    }, SECRET_KEY, algorithm="HS256")

    # Store refresh token
    supabase.table("refresh_tokens").insert({
        "user_id": user_id,
        "jti": refresh_jti,
        "revoked": False,
        "expires_at": nowUTC + datetime.timedelta(days=7)
    }).execute()

    resp = make_response(jsonify({"access_token": access_token, "user": user}))
    resp.set_cookie("refresh_token", refresh_token, httponly=True, samesite="Lax")
    return resp

# ---------------- Refresh ----------------
@auth_bp.route("/refresh", methods=["POST"])
def refresh():
    supabase = get_supabase()
    token = request.cookies.get("refresh_token")
    if not token:
        return jsonify({"error":"Missing refresh token"}), 401
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload["sub"]
        jti = payload["jti"]
    except jwt.ExpiredSignatureError:
        return jsonify({"error":"Refresh token expired"}), 401
    except:
        return jsonify({"error":"Invalid token"}), 401

    # Check if token is revoked
    rt = supabase.table("refresh_tokens").select("*").eq("jti", jti).execute()
    if not rt.data or rt.data[0]["revoked"]:
        return jsonify({"error":"Token revoked"}), 401

    # Issue new access token
    access_token = jwt.encode({
        "sub": user_id,
        "exp": nowUTC + datetime.timedelta(minutes=15)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"access_token": access_token})

# ---------------- Logout ----------------
@auth_bp.route("/logout", methods=["POST"])
def logout():
    supabase = get_supabase()
    token = request.cookies.get("refresh_token")
    if token:
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            jti = payload["jti"]
            # revoke token
            supabase.table("refresh_tokens").update({"revoked": True}).eq("jti", jti).execute()
        except:
            pass
    resp = make_response(jsonify({"message":"Logged out"}))
    resp.delete_cookie("refresh_token")
    return resp