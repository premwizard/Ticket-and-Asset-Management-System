import jwt
from jwt import PyJWKClient
import requests
import os
from functools import wraps
from flask import request, jsonify, g

# Startup verification log
try:
    import cryptography
    print("Cryptography Installed Successfully")
except ImportError:
    print("WARNING: cryptography library is not installed!")

SUPABASE_URL = os.getenv('SUPABASE_URL')
_jwk_client = None

def get_jwk_client():
    global _jwk_client
    if _jwk_client:
        return _jwk_client
    url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
    _jwk_client = PyJWKClient(url)
    return _jwk_client

def verify_supabase_token(token):
  try:
    client = get_jwk_client()
    signing_key = client.get_signing_key_from_jwt(token)
    public_key = signing_key.key

    payload = jwt.decode(
      token,
      public_key,
      algorithms=['ES256'],
      options={'verify_aud': False}
    )

    # Debug: print full payload to see role location
    print(f"[JWT PAYLOAD]: {payload}")
    return payload

  except Exception as e:
    print(f"[JWT ERROR]: {str(e)}")
    raise

def extract_role(payload):
  # Check ALL possible locations for role in JWT
  role = (
    payload.get('user_metadata', {}).get('role') or
    payload.get('app_metadata', {}).get('role') or
    payload.get('role') or
    'user'  # default if not found anywhere
  )
  print(f"[ROLE EXTRACTED]: {role}")
  return role

def require_auth(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    # Always allow OPTIONS preflight — no auth check
    if request.method == 'OPTIONS':
      return f(*args, **kwargs)

    auth_header = request.headers.get('Authorization', '')
    if not auth_header.startswith('Bearer '):
      return jsonify({
        "error": "Unauthorized",
        "debug": "Missing or invalid Authorization header"
      }), 401

    token = auth_header.split(' ', 1)[1].strip()
    if not token:
      return jsonify({
        "error": "Unauthorized",
        "debug": "Empty token"
      }), 401

    try:
      payload = verify_supabase_token(token)
      user_id = payload.get('sub')

      if not user_id:
        return jsonify({
          "error": "Unauthorized",
          "debug": "Missing sub claim in token"
        }), 401

      role = extract_role(payload)

      g.user = {
        "user_id": user_id,
        "id": user_id,
        "email": payload.get("email", ""),
        "role": role,
        "is_admin": role == "admin"
      }

      print(f"[AUTH OK] user={g.user['email']} role={g.user['role']}")

      # ── Auto-Sync Local User Record ──
      try:
          from app.models.user import create_user_record
          create_user_record(user_id, g.user['email'], role)
      except Exception as sync_err:
          print(f"[SYNC ERROR]: {str(sync_err)}")

    except Exception as e:
      return jsonify({
        "error": "Unauthorized",
        "debug": str(e)
      }), 401

    return f(*args, **kwargs)
  return decorated

def require_admin(f):
  @wraps(f)
  def decorated(*args, **kwargs):
    # Check g.user exists (require_auth must run first)
    if not hasattr(g, 'user') or not g.user:
      return jsonify({
        "error": "Unauthorized",
        "debug": "No auth context found"
      }), 401

    if not g.user.get('is_admin'):
      return jsonify({
        "error": "Forbidden",
        "message": "Admin access required",
        "your_role": g.user.get('role', 'unknown')
      }), 403

    print(f"[ADMIN OK] user={g.user['email']}")
    return f(*args, **kwargs)
  return decorated
