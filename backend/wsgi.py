"""
WSGI entry point for production deployment.
Use with Gunicorn or other WSGI servers.

Example:
    gunicorn -w 2 -b 0.0.0.0:8000 wsgi:app
"""
from main import app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
