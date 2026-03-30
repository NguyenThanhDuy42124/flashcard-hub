"""
WSGI entry point for production deployment.
Use with Gunicorn or other WSGI servers.

Example:
    gunicorn -w 4 -b 0.0.0.0:8000 wsgi:app
"""
from app import app

if __name__ == "__main__":
    app.run()
