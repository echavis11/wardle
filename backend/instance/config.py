import os

class Config:
    SECRET_KEY = "dev-secret-key"
    SQLALCHEMY_DATABASE_URI = "sqlite:///wardle.db"
    SQLALCHEMY_TRACK_MODIFICATIONS = False

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
