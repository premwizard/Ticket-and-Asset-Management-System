"""
app/models/__init__.py — Ticket Service Models Package

Exposes the db instance and all models for easy import elsewhere.
"""

from app import db  # noqa: F401
from app.models.user import User  # noqa: F401
from app.models.ticket import Ticket, TicketAttachment  # noqa: F401
from app.models.project import Project  # noqa: F401
from app.models.notification import Notification # noqa: F401
