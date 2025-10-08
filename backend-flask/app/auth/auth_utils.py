import traceback
from functools import wraps
from flask import request, jsonify, g
import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY_BACKEND", "dev-secret")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")

            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        # Decode token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.user_id = payload.get("sub")  # save into request context

        except jwt.ExpiredSignatureError:
            print("JWT expired!")
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            traceback.print_exc()
            return jsonify({"message": "Invalid token"}), 401
        except Exception:
            return jsonify({"message": "Invalid token"}), 401

        return f(*args, **kwargs)
        # return f(user_id=user_id, *args, **kwargs)

    return decorated