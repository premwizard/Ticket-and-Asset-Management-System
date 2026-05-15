"""
app/models/ticket.py — Ticket SQLAlchemy Model

Defines the Ticket ORM model and TicketAttachment model for file support.
SQLAlchemy handles table creation and all queries.
"""

import enum
from datetime import datetime, timezone

from app import db


class TicketStatus(str, enum.Enum):
    """Enumeration of valid ticket statuses."""
    OPEN        = "open"
    IN_PROGRESS = "in-progress"
    RESOLVED    = "resolved"
    CLOSED      = "closed"


class TicketPriority(str, enum.Enum):
    """Enumeration of valid ticket priorities."""
    LOW    = "low"
    MEDIUM = "medium"
    HIGH   = "high"


class Ticket(db.Model):
    """
    Ticket ORM model.
    Each ticket belongs to a user (created_by = Supabase user ID).
    """

    __tablename__ = "tickets"

    id = db.Column(
        db.Integer, primary_key=True, autoincrement=True,
        doc="Auto-incrementing ticket ID"
    )
    title = db.Column(
        db.String(255), nullable=False,
        doc="Short summary of the ticket"
    )
    description = db.Column(
        db.Text, nullable=True,
        doc="Detailed description of the issue"
    )
    status = db.Column(
        db.Enum(TicketStatus), nullable=False, default=TicketStatus.OPEN,
        doc="Current status: open | in-progress | closed"
    )
    priority = db.Column(
        db.Enum(TicketPriority), nullable=False, default=TicketPriority.MEDIUM,
        doc="Priority level: low | medium | high"
    )
    project_id = db.Column(
        db.Integer, db.ForeignKey('projects.id'), nullable=True,
        doc="Optional ID of the project this ticket belongs to"
    )
    created_by = db.Column(
        db.String(128), nullable=False, index=True,
        doc="Supabase user ID of the ticket creator"
    )
    created_at = db.Column(
        db.DateTime(timezone=True), nullable=False,
        default=lambda: datetime.now(timezone.utc),
        doc="UTC timestamp when the ticket was created"
    )
    updated_at = db.Column(
        db.DateTime(timezone=True), nullable=True,
        onupdate=lambda: datetime.now(timezone.utc),
        doc="UTC timestamp of the last update"
    )

    # ── Relationships ────────────────────────────────────────────────────────

    attachments = db.relationship(
        "TicketAttachment",
        backref="ticket",
        lazy=True,
        cascade="all, delete-orphan",
        doc="List of files attached to this ticket"
    )

    # ── Methods ───────────────────────────────────────────────────────────────

    def to_dict(self) -> dict:
        """Serialize the ticket to a JSON-safe dictionary."""
        return {
            "id":          self.id,
            "title":       self.title,
            "description": self.description,
            "status":      self.status.value if self.status else None,
            "priority":    self.priority.value if self.priority else None,
            "project_id":  self.project_id,
            "created_by":  self.created_by,
            "created_at":  self.created_at.isoformat() if self.created_at else None,
            "updated_at":  self.updated_at.isoformat() if self.updated_at else None,
            "attachments": [a.to_dict() for a in self.attachments]
        }

    def __repr__(self):
        return f"<Ticket id={self.id} title={self.title!r} status={self.status}>"


class TicketAttachment(db.Model):
    """
    Model for files attached to tickets.
    Stored in Supabase Storage, metadata stored here.
    """

    __tablename__ = "ticket_attachments"

    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    ticket_id = db.Column(
        db.Integer,
        db.ForeignKey("tickets.id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    file_name = db.Column(db.String(255), nullable=False)
    file_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)
    storage_path = db.Column(db.String(500), nullable=False)
    storage_url = db.Column(db.Text)
    uploaded_by = db.Column(db.String(128), nullable=False)
    uploaded_at = db.Column(
        db.DateTime(timezone=True), 
        nullable=False,
        default=lambda: datetime.now(timezone.utc)
    )

    def to_dict(self) -> dict:
        """Serialize attachment to dict."""
        return {
            "id":           self.id,
            "ticket_id":    self.ticket_id,
            "file_name":    self.file_name,
            "file_type":    self.file_type,
            "file_size":    self.file_size,
            "storage_path": self.storage_path,
            "storage_url":  self.storage_url,
            "uploaded_by":  self.uploaded_by,
            "uploaded_at":  self.uploaded_at.isoformat()
        }
