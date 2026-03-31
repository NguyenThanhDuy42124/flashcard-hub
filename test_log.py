from fastapi import FastAPI
import uvicorn
import json

app = FastAPI()

@app.get("/test")
async def test():
    return {"hello": "world"}

if __name__ == "__main__":
    log_config = {
        "version": 1,
        "disable_existing_loggers": False,
        "formatters": {
            "access": {
                "()": "uvicorn.logging.AccessFormatter",
                "fmt": "%(asctime)s %(levelname)s uvicorn.access: %(client_addr)s - \"%(request_line)s\" %(status_code)s",
                "datefmt": "%Y-%m-%d %H:%M:%S",
                "use_colors": False
            },
        },
        "handlers": {
            "access": {
                "formatter": "access",
                "class": "logging.StreamHandler",
                "stream": "ext://sys.stdout"
            }
        },
        "loggers": {
            "uvicorn.access": {"handlers": ["access"], "level": "INFO", "propagate": False},
        }
    }
    uvicorn.run("test_log:app", port=8005, log_config=log_config)
