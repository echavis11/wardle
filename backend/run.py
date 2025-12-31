from flask_cors import CORS
from app import create_app

app = create_app()
CORS(app)

# DO NOT call app.run() in production
if __name__ == "__main__":
    app.run()