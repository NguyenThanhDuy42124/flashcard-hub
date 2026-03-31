from fastapi import FastAPI
from fastapi.responses import FileResponse
import uvicorn

app = FastAPI()

@app.get("/missing")
async def serve_missing():
    return FileResponse("path_does_not_exist.html")

if __name__ == "__main__":
    uvicorn.run("test_fastapi:app", port=8004)
