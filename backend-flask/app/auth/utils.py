from passlib.hash import bcrypt
import jwt
import os
from datetime import datetime, timedelta

ACCESS_MIN = 15
REFRESH_DAYS = 7
SECRET_KEY = os.getenv("SECRET_KEY", "dev-secret")

def hash_password(password: str) -> str:
    return bcrypt.hash(password)

def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.verify(password, hashed)

def create_access_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.utcnow() + timedelta(minutes=ACCESS_MIN)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")

def create_refresh_token(user_id: str, jti: str) -> str:
    payload = {
        "sub": user_id,
        "jti": jti,
        "exp": datetime.utcnow() + timedelta(days=REFRESH_DAYS)
    }
    return jwt.encode(payload, SECRET_KEY, algorithm="HS256")