from functools import wraps
from flask import request, jsonify
import jwt
import os

SECRET_KEY = os.environ.get("SECRET_KEY", "devkey")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            auth_header = request.headers['Authorization']
            token = auth_header.split(" ")[1] if len(auth_header.split(" ")) > 1 else None

        if not token:
            return jsonify({"message": "Token is missing"}), 401

        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            user_id = payload["sub"]
        except jwt.ExpiredSignatureError:
            return jsonify({"message": "Token expired"}), 401
        except:
            return jsonify({"message": "Invalid token"}), 401

        return f(user_id=user_id, *args, **kwargs)
    return decorated