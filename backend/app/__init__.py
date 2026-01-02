from flask import Flask
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
import os

db = SQLAlchemy()
jwt = JWTManager()

def create_app():
    app = Flask(__name__, instance_relative_config=True)

    app.config.from_object("instance.config.Config")

    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY", app.config["SECRET_KEY"]
    )
    app.config["JWT_SECRET_KEY"] = os.environ.get(
        "JWT_SECRET_KEY", app.config["SECRET_KEY"]
    )

    CORS(
        app,
        resources={r"/api/*": {
            "origins": [
                "http://localhost:3000",
                "https://wardle-peach.vercel.app"
            ],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type", "Authorization"],
            "supports_credentials": False
        }}
    )

    db.init_app(app)
    jwt.init_app(app)

    from app.routes import api_bp
    app.register_blueprint(api_bp)

    return app
