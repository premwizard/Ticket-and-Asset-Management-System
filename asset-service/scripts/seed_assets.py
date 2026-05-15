"""
scripts/seed_assets.py — Database Seeder for Asset Service

Usage:
  # From asset-service root directory:
  python -m scripts.seed_assets
"""

import sys
from datetime import datetime, timedelta, date

import logging

import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models.asset import Asset, AssetStatus
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_assets():
    app = create_app()
    with app.app_context():
        logger.info("Starting Asset database seed...")

        # Create mock users
        mock_supabase_id = "seeder-mock-user-1234"
        admin_supabase_id = "seeder-mock-admin-5678"

        user = User.query.filter_by(supabase_id=mock_supabase_id).first()
        if not user:
            user = User(supabase_id=mock_supabase_id, role="user")
            db.session.add(user)

        admin = User.query.filter_by(supabase_id=admin_supabase_id).first()
        if not admin:
            admin = User(supabase_id=admin_supabase_id, role="admin")
            db.session.add(admin)

        db.session.commit()

        if Asset.query.count() > 0:
            logger.info("Assets already exist. Skipping seed.")
            return

        today = date.today()

        assets_data = [
            {
                "name": "MacBook Pro 16-inch (M3 Max)",
                "type": "Laptop",
                "assigned_to": mock_supabase_id,
                "status": AssetStatus.IN_USE,
                "purchase_date": today - timedelta(days=100),
                "serial_number": "C02XYZ1234",
                "purchase_cost": 3499.00,
                "description": "Developer laptop for John Doe",
                "created_by": admin_supabase_id,
            },
            {
                "name": "Dell UltraSharp 32 4K USB-C Hub Monitor",
                "type": "Monitor",
                "assigned_to": mock_supabase_id,
                "status": AssetStatus.IN_USE,
                "purchase_date": today - timedelta(days=100),
                "serial_number": "DELL-U32-987",
                "purchase_cost": 899.00,
                "description": "Primary display",
                "created_by": admin_supabase_id,
            },
            {
                "name": "AWS EC2 Reserved Instance",
                "type": "Cloud Server",
                "assigned_to": None,
                "status": AssetStatus.ACTIVE,
                "purchase_date": today - timedelta(days=365),
                "serial_number": "i-0abcd1234efgh5678",
                "purchase_cost": 1500.00,
                "description": "Production Web Server",
                "created_by": admin_supabase_id,
            },
            {
                "name": "Lenovo ThinkPad X1 Carbon",
                "type": "Laptop",
                "assigned_to": None,
                "status": AssetStatus.MAINTENANCE,
                "purchase_date": today - timedelta(days=730),
                "serial_number": "PF-12345ABC",
                "purchase_cost": 1800.00,
                "description": "Needs battery replacement",
                "created_by": admin_supabase_id,
            },
        ]

        for data in assets_data:
            asset = Asset(**data)
            db.session.add(asset)

        try:
            db.session.commit()
            logger.info(f"Successfully seeded {len(assets_data)} assets.")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to seed assets: {e}")

if __name__ == "__main__":
    seed_assets()
