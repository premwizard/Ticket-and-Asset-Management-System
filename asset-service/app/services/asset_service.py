"""
app/services/asset_service.py

Business logic for Asset Inventory management.
"""

from app.models.asset import Asset
from app import db
import logging

logger = logging.getLogger(__name__)

class AssetService:
    @staticmethod
    def get_all_assets():
        """Fetch all assets. Returns empty list if DB is down."""
        try:
            return Asset.query.order_by(Asset.name.asc()).all()
        except Exception as exc:
            logger.error("Database connection failed in get_all_assets: %s", exc)
            return []

    @staticmethod
    def create_asset(data, user_role):
        """Create new asset. Any authenticated user can create."""
        if not data.get('name') or not data.get('type'):
            raise ValueError("Name and Type are required")

        new_asset = Asset(
            name=data['name'],
            type=data['type'],
            status=data.get('status', 'active'),
            assigned_to=data.get('assigned_to'),
            serial_number=data.get('serial_number')
        )
        db.session.add(new_asset)
        db.session.commit()
        return new_asset

    @staticmethod
    def update_asset(asset_id, data, user_role):
        """Update asset. Only admins allowed."""
        if user_role != 'admin':
            raise PermissionError("Access denied")

        asset = Asset.query.get(asset_id)
        if not asset:
            return None

        if 'name' in data: asset.name = data['name']
        if 'type' in data: asset.type = data['type']
        if 'status' in data: asset.status = data['status']
        if 'assigned_to' in data: asset.assigned_to = data['assigned_to']
        if 'serial_number' in data: asset.serial_number = data['serial_number']

        db.session.commit()
        return asset

    @staticmethod
    def delete_asset(asset_id, user_role):
        """Delete asset. Only admins allowed."""
        if user_role != 'admin':
            raise PermissionError("Access denied")
            
        asset = Asset.query.get(asset_id)
        if not asset:
            return False
            
        db.session.delete(asset)
        db.session.commit()
        return True

    @staticmethod
    def get_stats():
        """Summary metrics for assets. Returns zeros if DB is down."""
        try:
            return {
                "total": Asset.query.count(),
                "active": Asset.query.filter(Asset.status == "active").count(),
                "maintenance": Asset.query.filter(Asset.status == "maintenance").count(),
            }
        except Exception as exc:
            logger.error("Database connection failed in get_stats (Asset): %s", exc)
            return {
                "total": 0,
                "active": 0,
                "maintenance": 0,
                "note": "Database connection error. Displaying mock zeros."
            }
