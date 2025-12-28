"""
Predictions API endpoints
"""
from fastapi import APIRouter, HTTPException
from app.models.predictor import predictor

router = APIRouter()

SUPPORTED_SYMBOLS = ["BTC", "ETH", "SOL", "BNB", "ADA", "XRP", "DOT", "AVAX"]

@router.get("/{symbol}")
async def get_prediction(symbol: str):
    """Get AI-powered price prediction for a cryptocurrency"""
    symbol = symbol.upper()
    
    if symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(
            status_code=400,
            detail=f"Symbol {symbol} not supported. Available: {SUPPORTED_SYMBOLS}"
        )
    
    prediction = await predictor.predict(symbol)
    return prediction

@router.get("/")
async def get_all_predictions():
    """Get predictions for all supported cryptocurrencies"""
    predictions = []
    
    for symbol in SUPPORTED_SYMBOLS:
        try:
            pred = await predictor.predict(symbol)
            predictions.append(pred)
        except Exception as e:
            predictions.append({
                "symbol": symbol,
                "error": str(e)
            })
    
    return {
        "predictions": predictions,
        "supported_symbols": SUPPORTED_SYMBOLS
    }

@router.get("/{symbol}/indicators")
async def get_indicators(symbol: str):
    """Get technical indicators for a cryptocurrency"""
    symbol = symbol.upper()
    
    if symbol not in SUPPORTED_SYMBOLS:
        raise HTTPException(status_code=400, detail=f"Symbol {symbol} not supported")
    
    prediction = await predictor.predict(symbol)
    
    return {
        "symbol": symbol,
        "current_price": prediction.get("current_price"),
        "indicators": prediction.get("indicators"),
        "recommendation": prediction.get("recommendation")
    }
