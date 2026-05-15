"""
app/services/ticket_service.py

Encapsulates all business logic for ticket management.
Decouples the HTTP layer (routes) from the persistence layer (models).
"""

from app.models.ticket import Ticket
from app import db
import logging

logger = logging.getLogger(__name__)

class TicketService:
    @staticmethod
    def get_all_tickets(user_id=None, role='user'):
        """Fetch tickets based on role. Returns empty list if DB is down."""
        try:
            query = Ticket.query
            if role != 'admin':
                query = query.filter(Ticket.created_by == user_id)
            return query.order_by(Ticket.created_at.desc()).all()
        except Exception as exc:
            logger.error("Database connection failed in get_all_tickets: %s", exc)
            return []

    @staticmethod
    def create_ticket(data, user_id):
        """Validate and create a new ticket."""
        if not data.get('title') or not data.get('description'):
            raise ValueError("Title and Description are required")
        
        new_ticket = Ticket(
            title=data['title'],
            description=data['description'],
            status=data.get('status', 'open'),
            priority=data.get('priority', 'medium'),
            created_by=user_id
        )
        db.session.add(new_ticket)
        db.session.commit()
        return new_ticket

    @staticmethod
    def update_ticket(ticket_id, data, user_id, role):
        """Update ticket fields. Restricted by role."""
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return None
        
        # Security check: Non-admins can only update their own tickets
        if role != 'admin' and ticket.created_by != user_id:
            raise PermissionError("Access denied")

        if 'title' in data: ticket.title = data['title']
        if 'description' in data: ticket.description = data['description']
        if 'status' in data: ticket.status = data['status']
        if 'priority' in data: ticket.priority = data['priority']

        db.session.commit()
        return ticket

    @staticmethod
    def delete_ticket(ticket_id, user_id, role):
        """Delete a ticket. Only admins can delete."""
        if role != 'admin':
            raise PermissionError("Only admins can delete tickets")
            
        ticket = Ticket.query.get(ticket_id)
        if not ticket:
            return False
            
        db.session.delete(ticket)
        db.session.commit()
        return True

    @staticmethod
    def get_stats(user_id, role):
        """Generate summary statistics. Returns zeros if DB is down."""
        try:
            query = Ticket.query
            if role != 'admin':
                query = query.filter(Ticket.created_by == user_id)

            return {
                "total": query.count(),
                "open": query.filter(Ticket.status == "open").count(),
                "in_progress": query.filter(Ticket.status == "in_progress").count(),
                "resolved": query.filter(Ticket.status == "resolved").count(),
            }
        except Exception as exc:
            logger.error("Database connection failed in get_stats: %s", exc)
            return {
                "total": 0,
                "open": 0,
                "in_progress": 0,
                "resolved": 0,
                "note": "Database connection error. Displaying mock zeros."
            }
