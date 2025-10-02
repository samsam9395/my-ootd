import traceback
from functools import wraps
from flask import request, jsonify, g
import jwt
import os

SECRET_KEY = os.getenv("SECRET_KEY_BACKEND", "dev-secret")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        print("==== token_required start ====")
        print('request.headers:', request.headers)
        token = None
        if 'Authorization' in request.headers:
            parts = request.headers['Authorization'].split(" ")
            print('Authorization header parts:', parts)
            if len(parts) == 2:
                token = parts[1]

        if not token:
            return jsonify({"message": "Token is missing"}), 401
        
        # Decode token
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
            g.user_id = payload.get("sub")  # save into request context
            print(f"Decoded payload: {payload}")
        except jwt.ExpiredSignatureError:
            print("JWT expired!")
            return jsonify({"message": "Token expired"}), 401
        except jwt.InvalidTokenError as e:
            print(f"JWT decode failed: {str(e)}")
            traceback.print_exc()
            return jsonify({"message": "Invalid token"}), 401
        except Exception:
            return jsonify({"message": "Invalid token"}), 401

        print("==== token_required end ====")
        return f(*args, **kwargs)
        # return f(user_id=user_id, *args, **kwargs)

    return decorated