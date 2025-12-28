from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from app.api import booking
import os

# Rate Limiter
limiter = Limiter(key_func=get_remote_address)

app = FastAPI(
    title="MarketHub Booking Service",
    description="High-load booking service with Redis distributed locks",
    version="1.0.0"
)

# Add rate limiter to app state
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

# CORS middleware
allowed_origins = ["*"] if os.getenv("NODE_ENV") != "production" else [
    os.getenv("FRONTEND_URL", "https://your-domain.com")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Security headers middleware
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    return response

# Include routers
app.include_router(booking.router)

@app.get("/")
@limiter.limit("100/minute")
def root(request: Request):
    return {
        "message": "MarketHub Booking Service",
        "version": "1.0.0",
        "endpoints": {
            "docs": "/docs",
            "health": "/api/booking/health"
        }
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 3003))
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=True)
