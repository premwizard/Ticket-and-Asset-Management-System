"""
app/routes/notifications.py — Notifications Management
"""

from flask import Blueprint, request, jsonify, g
from app.models.notification import Notification
from app import db
from app.middleware.auth import require_auth
from datetime import datetime
import logging

logger = logging.getLogger(__name__)
notifications_bp = Blueprint('notifications', __name__)

@notifications_bp.route('/', methods=['GET'])
@require_auth
def get_notifications():
    """Get notifications for the current user."""
    user_id = g.user['id']
    is_admin = g.user.get('is_admin', False)
    
    # Admins see notifications targeted to 'admins' or themselves
    if is_admin:
        query = Notification.query.filter(
            (Notification.user_id == user_id) | (Notification.user_id == 'admins')
        )
    else:
        query = Notification.query.filter_by(user_id=user_id)
        
    notifications = query.order_by(Notification.created_at.desc()).all()
    return jsonify([n.to_dict() for n in notifications]), 200

@notifications_bp.route('/<int:id>/read', methods=['PUT'])
@require_auth
def mark_as_read(id):
    notification = Notification.query.get_or_404(id)
    # Check ownership
    if notification.user_id != g.user['id'] and notification.user_id != 'admins':
        return jsonify({"error": "Forbidden"}), 403
        
    notification.is_read = True
    db.session.commit()
    return jsonify(notification.to_dict()), 200

@notifications_bp.route('/read-all', methods=['PUT'])
@require_auth
def mark_all_read():
    user_id = g.user['id']
    is_admin = g.user.get('is_admin', False)
    
    if is_admin:
        notifications = Notification.query.filter(
            ((Notification.user_id == user_id) | (Notification.user_id == 'admins')),
            Notification.is_read == False
        ).all()
    else:
        notifications = Notification.query.filter_by(user_id=user_id, is_read=False).all()
        
    for n in notifications:
        n.is_read = True
    db.session.commit()
    return jsonify({"message": f"Marked {len(notifications)} notifications as read"}), 200

@notifications_bp.route('/<int:id>', methods=['DELETE'])
@require_auth
def delete_notification(id):
    notification = Notification.query.get_or_404(id)
    if notification.user_id != g.user['id'] and notification.user_id != 'admins':
        return jsonify({"error": "Forbidden"}), 403
        
    db.session.delete(notification)
    db.session.commit()
    return jsonify({"message": "Notification deleted"}), 200
