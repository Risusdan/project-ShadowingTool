"""Flask application factory for the MyShadowing backend."""

import os

from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy

db = SQLAlchemy()


def create_app(testing: bool = False) -> Flask:
    """Create and configure the Flask application.

    Args:
        testing: If True, use an in-memory SQLite database instead of a
            persistent file. Defaults to False.

    Returns:
        Configured Flask application instance with database tables created.
    """
    app = Flask(__name__)

    # Database config
    db_path = os.path.join(app.instance_path, "shadowing.db")
    os.makedirs(app.instance_path, exist_ok=True)
    if testing:
        app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///:memory:"
    else:
        app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{db_path}"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    # Init extensions
    CORS(app)
    db.init_app(app)

    # Register blueprints
    from routes.video import video_bp

    app.register_blueprint(video_bp, url_prefix="/api")

    # Create tables
    with app.app_context():
        import models  # noqa: F401

        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5000)
