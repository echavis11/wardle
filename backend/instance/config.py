import os

class Config:
    """Base configuration."""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'you-will-never-guess-this-secret-key-change-it'
    # Fallback to a default if SECRET_KEY environment variable is not set.
    # IMPORTANT: Change this to a strong, random key in production!

    # Example database configuration (if you were using one)
    # SQLALCHEMY_DATABASE_URI = os.environ.get('DATABASE_URL') or \
    #     'sqlite:///' + os.path.join(os.path.abspath(os.path.dirname(__file__)), '../app.db')
    # SQLALCHEMY_TRACK_MODIFICATIONS = False

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
