"""
app/routes/auth.py — Authentication and Session Endpoints
"""

from flask import Blueprint, request, jsonify, g
from app.models.user import User
from app import db
from app.middleware.auth import require_auth, require_admin
import logging

logger = logging.getLogger(__name__)
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/sync', methods=['POST'])
@require_auth
def sync_user():
    """
    Called after login to sync user record.
    """
    user_data = g.user
    user_id = user_data['user_id']
    email = user_data['email']
    role = user_data.get('role', 'user')
    
    # Update or create local user
    from app.models.user import create_user_record
    create_user_record(user_id, email, role)
    
    return jsonify({
        "message": "User synced",
        "user_id": user_id,
        "email": email,
        "role": role
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@require_auth
def logout():
    """
    Explicit logout.
    """
    return jsonify({"message": "Logged out successfully"}), 200
