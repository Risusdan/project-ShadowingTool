"""Shared pytest fixtures for the MyShadowing backend test suite."""

import pytest
from flask import Flask
from flask.testing import FlaskClient
from flask_sqlalchemy import SQLAlchemy

from app import create_app, db as _db


@pytest.fixture()
def app() -> Flask:
    """Create a Flask app configured for testing (in-memory DB)."""
    app = create_app(testing=True)
    yield app


@pytest.fixture()
def client(app: Flask) -> FlaskClient:
    """Provide a Flask test client bound to the test app."""
    return app.test_client()


@pytest.fixture()
def db(app: Flask) -> SQLAlchemy:
    """Yield the SQLAlchemy instance inside an app context."""
    with app.app_context():
        yield _db
