"""
scripts/seed_tickets.py — Database Seeder for Ticket Service

Usage:
  # From ticket-service root directory:
  python -m scripts.seed_tickets
"""

import sys
import random
from datetime import datetime, timedelta, timezone

import logging

# Ensure we can import app
import os
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app import create_app, db
from app.models.ticket import Ticket, TicketStatus, TicketPriority
from app.models.user import User

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def seed_tickets():
    app = create_app()
    with app.app_context():
        logger.info("Starting Ticket database seed...")

        # Ensure we have at least one user to assign tickets to
        # In a real scenario, this user is created during Supabase signup.
        # We create a mock Supabase user ID for the seeder.
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

        # Check if tickets already exist to prevent duplicate seeding
        if Ticket.query.count() > 0:
            logger.info("Tickets already exist. Skipping seed.")
            return

        now = datetime.now(timezone.utc)

        tickets_data = [
            {
                "title": "Cannot connect to office VPN",
                "description": "I get an error 809 when trying to connect to the Chicago office VPN.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.HIGH,
                "created_by": mock_supabase_id,
                "created_at": now - timedelta(days=2),
            },
            {
                "title": "Need a new monitor for desk",
                "description": "My left monitor is flickering. Need a replacement.",
                "status": TicketStatus.IN_PROGRESS,
                "priority": TicketPriority.MEDIUM,
                "created_by": mock_supabase_id,
                "created_at": now - timedelta(days=5),
            },
            {
                "title": "Software license request: IntelliJ IDEA",
                "description": "I need a license for IntelliJ IDEA Ultimate for the new backend project.",
                "status": TicketStatus.CLOSED,
                "priority": TicketPriority.LOW,
                "created_by": mock_supabase_id,
                "created_at": now - timedelta(days=10),
            },
            {
                "title": "Server DB-01 is unreachable",
                "description": "Production database is not responding to ping.",
                "status": TicketStatus.OPEN,
                "priority": TicketPriority.HIGH,
                "created_by": admin_supabase_id,
                "created_at": now - timedelta(hours=2),
            },
        ]

        for data in tickets_data:
            ticket = Ticket(**data)
            db.session.add(ticket)

        try:
            db.session.commit()
            logger.info(f"Successfully seeded {len(tickets_data)} tickets.")
        except Exception as e:
            db.session.rollback()
            logger.error(f"Failed to seed tickets: {e}")

if __name__ == "__main__":
    seed_tickets()
