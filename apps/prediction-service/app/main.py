"""
MarketHub AI Prediction Service
Provides ML-based cryptocurrency price predictions
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api import predictions
import os

app = FastAPI(
    title="MarketHub AI Prediction Service",
    description="Machine Learning based cryptocurrency price predictions",
    version="1.0.0"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routes
app.include_router(predictions.router, prefix="/api/predictions", tags=["predictions"])

@app.get("/")
def root():
    return {
        "service": "MarketHub AI Prediction Service",
        "version": "1.0.0",
        "endpoints": {
            "predictions": "/api/predictions/{symbol}",
            "health": "/health"
        }
    }

@app.get("/health")
def health():
    return {"status": "healthy", "service": "prediction-service"}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3005))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
