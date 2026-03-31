import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), "backend"))
from main import app
for route in app.routes:
    print(getattr(route, "methods", None), route.path)
