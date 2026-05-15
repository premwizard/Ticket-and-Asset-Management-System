"""
app/models/asset.py — Asset SQLAlchemy Model

Defines the Asset ORM model for the asset_db database.

Fields match the spec:
  id, name, type, assigned_to, status, purchase_date
  Plus: description, serial_number, purchase_cost (extended fields)
"""

import enum
from datetime import datetime, timezone

from app import db


class AssetStatus(str, enum.Enum):
    """Enumeration of valid asset statuses."""
    ACTIVE      = "active"
    INACTIVE    = "inactive"
    IN_USE      = "in-use"
    MAINTENANCE = "maintenance"
    RETIRED     = "retired"


class Asset(db.Model):
    """
    Asset ORM model.
    Represents a physical or digital asset tracked by the organization.
    """

    __tablename__ = "assets"

    # ── Columns ──────────────────────────────────────────────────────────────

    id = db.Column(
        db.Integer, primary_key=True, autoincrement=True,
        doc="Auto-incrementing asset ID"
    )
    name = db.Column(
        db.String(255), nullable=False,
        doc="Asset name (e.g. 'MacBook Pro 16-inch')"
    )
    type = db.Column(
        db.String(100), nullable=True,
        doc="Asset type/category (e.g. 'Laptop', 'Monitor', 'Software')"
    )
    assigned_to = db.Column(
        db.String(128), nullable=True,
        doc="Supabase user ID of the user this asset is assigned to"
    )
    status = db.Column(
        db.Enum(AssetStatus), nullable=False, default=AssetStatus.ACTIVE,
        doc="Current asset status: active | inactive | in-use | maintenance | retired"
    )
    purchase_date = db.Column(
        db.Date, nullable=True,
        doc="Date the asset was purchased"
    )
    serial_number = db.Column(
        db.String(100), nullable=True, unique=True,
        doc="Asset serial number (optional, must be unique if provided)"
    )
    purchase_cost = db.Column(
        db.Numeric(10, 2), nullable=True,
        doc="Purchase cost in USD"
    )
    description = db.Column(
        db.Text, nullable=True,
        doc="Additional notes or description about the asset"
    )
    created_by = db.Column(
        db.String(128), nullable=False, index=True,
        doc="Supabase user ID of the person who added this asset"
    )
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
    )
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
    )

    # ── Methods ───────────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        """Serialize the asset to a JSON-safe dictionary."""
        return {
            "id":            self.id,
            "name":          self.name,
            "type":          self.type,
            "assigned_to":   self.assigned_to,
            "status":        self.status.value if self.status else None,
            "purchase_date": self.purchase_date.isoformat() if self.purchase_date else None,
            "serial_number": self.serial_number,
            "purchase_cost": float(self.purchase_cost) if self.purchase_cost is not None else None,
            "description":   self.description,
            "created_by":    self.created_by,
            "created_at":    self.created_at.isoformat() if self.created_at else None,
            "updated_at":    self.updated_at.isoformat() if self.updated_at else None,
        }

    def __repr__(self):
        return f"<Asset id={self.id} name={self.name!r} status={self.status}>"
