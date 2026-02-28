"""Flask application factory for the MyShadowing backend."""

import os

from flask import Flask, jsonify
from flask_cors import CORS
from werkzeug.exceptions import HTTPException

from extensions import db


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
    from routes.progress import progress_bp

    app.register_blueprint(video_bp, url_prefix="/api")
    app.register_blueprint(progress_bp, url_prefix="/api")

    # Global JSON error handlers
    @app.errorhandler(404)
    def not_found(e: HTTPException):
        return jsonify({"error": "Not found", "error_code": "NOT_FOUND"}), 404

    @app.errorhandler(405)
    def method_not_allowed(e: HTTPException):
        return jsonify({"error": "Method not allowed", "error_code": "METHOD_NOT_ALLOWED"}), 405

    @app.errorhandler(Exception)
    def internal_error(e: Exception):
        if isinstance(e, HTTPException):
            return jsonify({"error": e.description, "error_code": "HTTP_ERROR"}), e.code
        app.logger.exception("Unhandled exception")
        return jsonify({"error": "Internal server error", "error_code": "INTERNAL_ERROR"}), 500

    # Create tables
    with app.app_context():
        import models  # noqa: F401

        db.create_all()

    return app


if __name__ == "__main__":
    app = create_app()
    app.run(debug=True, port=5001)
