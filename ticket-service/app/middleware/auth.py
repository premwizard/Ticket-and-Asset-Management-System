import jwt
import requests
import os
from functools import wraps
from flask import request, jsonify, g
from datetime import datetime

SUPABASE_URL = os.getenv('SUPABASE_URL')
_jwks_cache = None

def get_jwks():
  global _jwks_cache
  if _jwks_cache:
    return _jwks_cache
  url = f"{SUPABASE_URL}/auth/v1/.well-known/jwks.json"
  response = requests.get(url, timeout=5)
  _jwks_cache = response.json()
  return _jwks_cache

def verify_supabase_token(token):
  try:
    jwks = get_jwks()
    header = jwt.get_unverified_header(token)
    kid = header.get('kid')

    public_key = None
    for key in jwks.get('keys', []):
      if key.get('kid') == kid:
        from jwt.algorithms import ECAlgorithm
        public_key = ECAlgorithm.from_jwk(key)
        break

    if not public_key:
      raise Exception('Public key not found in JWKS')

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

      # Removed activity tracking

    except Exception as e:
      # ── Track Failed Attempt ──
      # If we can identify the user via email in the request (e.g. if passed as header for some reason, 
      # but standard JWT auth doesn't have it if token is invalid).
      # For now, we'll just log it. In a real system, we might track by IP.
      print(f"[AUTH FAILED]: {str(e)}")
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
