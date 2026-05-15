"""
app/models/notification.py — Notification Model
"""

from datetime import datetime
from app import db

class Notification(db.Model):
    """
    Model to store system notifications for users.
    """
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    user_id = db.Column(db.String(128), index=True) # Target user ID (null for all or admins)
    title = db.Column(db.String(255), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(50)) # 'info', 'warning', 'error', 'ticket_new', etc.
    is_read = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    def to_dict(self):
        return {
            "id": self.id,
            "user_id": self.user_id,
            "title": self.title,
            "message": self.message,
            "type": self.type,
            "is_read": self.is_read,
            "created_at": self.created_at.isoformat() if self.created_at else None
        }
