from fastapi import FastAPI
from app.api import router as api_router

app = FastAPI()

# Include the API router
app.include_router(api_router)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "Hello World"}