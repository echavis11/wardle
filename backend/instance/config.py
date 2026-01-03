import os

BASE_DIR = os.path.abspath(os.path.dirname(__file__))

class Config:
    SECRET_KEY = "dev-secret-key"
    SQLALCHEMY_DATABASE_URI = (
        "sqlite:///" + os.path.join(BASE_DIR, "wardle.db")
    )
    SQLALCHEMY_TRACK_MODIFICATIONS = False

    JWT_TOKEN_LOCATION = ["headers"]
    JWT_COOKIE_CSRF_PROTECT = False

    # Other configurations
    DEBUG = True # Set to False in production
    TESTING = False
    JSON_SORT_KEYS = False # Keep JSON keys in order you add them, useful for debugging

class DevelopmentConfig(Config):
    DEBUG = True

class TestingConfig(Config):
    TESTING = True

class ProductionConfig(Config):
    DEBUG = False
    # You might want to use a different SECRET_KEY for production
    # SECRET_KEY = os.environ.get('PRODUCTION_SECRET_KEY')
