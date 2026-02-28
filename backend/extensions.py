"""Shared Flask extensions (single instances, survive debug reloader)."""

from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()
