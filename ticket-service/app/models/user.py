from datetime import datetime
import logging
from app import db

logger = logging.getLogger(__name__)


class User(db.Model):
    """
    Local user record.
    Links a Supabase user ID to an application role and email.
    """

    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)

    # The Supabase user ID — this is the primary lookup key for local roles
    supabase_id = db.Column(
        db.String(128), unique=True, nullable=False, index=True,
        doc="Supabase user ID (e.g. '476fbad1-...')"
    )

    # User email — stored for auditing and display
    email = db.Column(db.String(255), nullable=False)

    # RBAC role — "user" or "admin"
    role = db.Column(
        db.String(32), nullable=False, default="user",
        doc="User role: user | admin"
    )

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow
    )

    def to_dict(self) -> dict:
        return {
            "supabase_id": self.supabase_id,
            "email": self.email,
            "role": self.role,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None
        }

    def __repr__(self):
        return f"<User email={self.email!r} role={self.role!r}>"


def create_user_record(supabase_id: str, email: str, role: str = "user") -> None:
    """
    Upsert a local user record.
    If user exists, updates email, role, and updated_at ONLY if changed.
    Otherwise creates a new record.

    Args:
        supabase_id: The Supabase user ID.
        email: The user's email address.
        role: The role (default: "user").
    """
    try:
        # Validate role
        if role not in ("user", "admin"):
            role = "user"

        existing = User.query.filter_by(supabase_id=supabase_id).first()
        if existing:
            # ONLY execute write & commit if data has actually changed!
            if existing.email != email or existing.role != role:
                existing.email = email
                existing.role = role
                db.session.commit()
                logger.info("Updated local user record for %s", supabase_id)
            else:
                # Direct read-only pass-through: NO DB WRITE, NO COMMIT!
                logger.debug("Local user record for %s is up to date (no-op)", supabase_id)
        else:
            user = User(supabase_id=supabase_id, email=email, role=role)
            db.session.add(user)
            db.session.commit()
            logger.info("Created local user record for %s (%s)", supabase_id, email)
        
    except Exception as exc:
        db.session.rollback()
        logger.error("Failed to sync user record: %s", exc)
        raise


def get_user_by_supabase_id(supabase_id: str) -> dict | None:
    """
    Retrieve a local user record by Supabase user ID.
    Returns a dict or None if not found.
    """
    try:
        user = User.query.filter_by(supabase_id=supabase_id).first()
        return user.to_dict() if user else None
    except Exception as exc:
        logger.warning("Could not look up user %s: %s", supabase_id, exc)
        return None
