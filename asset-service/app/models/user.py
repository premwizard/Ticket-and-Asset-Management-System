"""
app/models/user.py — Local User Record for Asset Service

The Asset Service mirrors the user table to resolve roles.
In Phase 4, we'll replace this with session claims for a cleaner architecture.
For Phase 1, we replicate the same pattern as the Ticket Service.
"""

from datetime import datetime
import logging
from app import db

logger = logging.getLogger(__name__)


class User(db.Model):
    """
    Local user record in Asset Service.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    supabase_id = db.Column(db.String(128), unique=True, nullable=False, index=True)
    email = db.Column(db.String(255), nullable=False)
    role = db.Column(db.String(32), nullable=False, default="user")
    
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self):
        return {
            "supabase_id": self.supabase_id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }


def get_user_by_supabase_id(supabase_id: str) -> dict | None:
    """
    Look up user role by Supabase user ID.
    """
    try:
        user = User.query.filter_by(supabase_id=supabase_id).first()
        return user.to_dict() if user else None
    except Exception as exc:
        logger.debug("Asset service user lookup failed: %s", exc)
        return None


def create_user_record(supabase_id: str, email: str, role: str = "user") -> None:
    """
    Upsert a user record in the asset service's local user table.
    """
    try:
        existing = User.query.filter_by(supabase_id=supabase_id).first()
        if existing:
            # ONLY execute write & commit if data has actually changed!
            if existing.email != email or existing.role != role:
                existing.email = email
                existing.role = role
                db.session.commit()
                logger.info("Asset service: updated user record for %s", supabase_id)
            else:
                # Direct read-only pass-through: NO DB WRITE, NO COMMIT!
                logger.debug("Asset service: user record for %s is up to date (no-op)", supabase_id)
        else:
            user = User(supabase_id=supabase_id, email=email, role=role)
            db.session.add(user)
            db.session.commit()
            logger.info("Asset service: created user record for %s", supabase_id)
            
    except Exception as exc:
        db.session.rollback()
        logger.error("Asset service: failed to sync user record: %s", exc)
