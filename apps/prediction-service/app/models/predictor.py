"""
Price Predictor using multiple ML approaches
"""
import numpy as np
from datetime import datetime, timedelta
from typing import Dict, List, Optional
import aiohttp
import asyncio

class PricePredictor:
    """Simple ML-based price predictor using moving averages and trend analysis"""
    
    def __init__(self):
        self.cache: Dict[str, dict] = {}
        self.cache_ttl = 300  # 5 minutes
        
    async def fetch_historical_data(self, symbol: str, days: int = 30) -> List[dict]:
        """Fetch historical price data from Binance API"""
        try:
            url = f"https://api.binance.com/api/v3/klines"
            params = {
                "symbol": f"{symbol}USDT",
                "interval": "1h",
                "limit": days * 24  # hours
            }
            
            async with aiohttp.ClientSession() as session:
                async with session.get(url, params=params) as response:
                    if response.status == 200:
                        data = await response.json()
                        return [
                            {
                                "timestamp": item[0],
                                "open": float(item[1]),
                                "high": float(item[2]),
                                "low": float(item[3]),
                                "close": float(item[4]),
                                "volume": float(item[5])
                            }
                            for item in data
                        ]
        except Exception as e:
            print(f"Error fetching data: {e}")
        return []
    
    def calculate_sma(self, prices: List[float], period: int) -> float:
        """Simple Moving Average"""
        if len(prices) < period:
            return prices[-1] if prices else 0
        return sum(prices[-period:]) / period
    
    def calculate_ema(self, prices: List[float], period: int) -> float:
        """Exponential Moving Average"""
        if len(prices) < period:
            return prices[-1] if prices else 0
        
        multiplier = 2 / (period + 1)
        ema = prices[0]
        for price in prices[1:]:
            ema = (price * multiplier) + (ema * (1 - multiplier))
        return ema
    
    def calculate_rsi(self, prices: List[float], period: int = 14) -> float:
        """Relative Strength Index"""
        if len(prices) < period + 1:
            return 50
        
        gains = []
        losses = []
        
        for i in range(1, len(prices)):
            change = prices[i] - prices[i-1]
            if change > 0:
                gains.append(change)
                losses.append(0)
            else:
                gains.append(0)
                losses.append(abs(change))
        
        avg_gain = sum(gains[-period:]) / period
        avg_loss = sum(losses[-period:]) / period
        
        if avg_loss == 0:
            return 100
        
        rs = avg_gain / avg_loss
        rsi = 100 - (100 / (1 + rs))
        return rsi
    
    def predict_trend(self, prices: List[float]) -> str:
        """Predict trend based on moving averages"""
        if len(prices) < 50:
            return "neutral"
        
        sma_20 = self.calculate_sma(prices, 20)
        sma_50 = self.calculate_sma(prices, 50)
        current_price = prices[-1]
        
        if current_price > sma_20 > sma_50:
            return "bullish"
        elif current_price < sma_20 < sma_50:
            return "bearish"
        else:
            return "neutral"
    
    async def predict(self, symbol: str) -> dict:
        """Generate price prediction for a cryptocurrency"""
        
        # Check cache
        cache_key = f"{symbol}_{datetime.now().strftime('%Y%m%d%H')}"
        if cache_key in self.cache:
            return self.cache[cache_key]
        
        # Fetch historical data
        historical = await self.fetch_historical_data(symbol, days=30)
        
        if not historical:
            return {
                "symbol": symbol,
                "error": "Failed to fetch historical data",
                "predictions": []
            }
        
        # Extract close prices
        close_prices = [h["close"] for h in historical]
        current_price = close_prices[-1]
        
        # Calculate indicators
        sma_20 = self.calculate_sma(close_prices, 20)
        sma_50 = self.calculate_sma(close_prices, 50)
        ema_12 = self.calculate_ema(close_prices, 12)
        ema_26 = self.calculate_ema(close_prices, 26)
        rsi = self.calculate_rsi(close_prices)
        trend = self.predict_trend(close_prices)
        
        # Calculate volatility
        returns = [(close_prices[i] - close_prices[i-1]) / close_prices[i-1] 
                   for i in range(1, len(close_prices))]
        volatility = np.std(returns) * 100
        
        # Generate predictions
        # Simple linear regression based on recent trend
        recent_prices = close_prices[-24:]  # Last 24 hours
        x = np.arange(len(recent_prices))
        slope = np.polyfit(x, recent_prices, 1)[0]
        
        predictions = []
        timeframes = [
            ("1h", 1),
            ("4h", 4),
            ("24h", 24),
            ("7d", 168)
        ]
        
        for label, hours in timeframes:
            # Predict based on trend + mean reversion
            trend_factor = 1 + (slope / current_price) * hours * 0.5
            
            # Mean reversion factor (RSI based)
            if rsi > 70:
                mean_reversion = 0.98  # Overbought - expect pullback
            elif rsi < 30:
                mean_reversion = 1.02  # Oversold - expect bounce
            else:
                mean_reversion = 1.0
            
            predicted_price = current_price * trend_factor * mean_reversion
            change_percent = ((predicted_price - current_price) / current_price) * 100
            
            # Confidence based on volatility and trend strength
            trend_strength = abs(sma_20 - sma_50) / current_price * 100
            confidence = max(30, min(85, 70 - volatility * 2 + trend_strength * 5))
            
            predictions.append({
                "timeframe": label,
                "predicted_price": round(predicted_price, 2),
                "change_percent": round(change_percent, 2),
                "confidence": round(confidence, 1)
            })
        
        result = {
            "symbol": symbol,
            "current_price": round(current_price, 2),
            "timestamp": datetime.now().isoformat(),
            "indicators": {
                "sma_20": round(sma_20, 2),
                "sma_50": round(sma_50, 2),
                "ema_12": round(ema_12, 2),
                "ema_26": round(ema_26, 2),
                "rsi": round(rsi, 2),
                "volatility": round(volatility, 2),
                "trend": trend
            },
            "predictions": predictions,
            "recommendation": self._get_recommendation(rsi, trend)
        }
        
        # Cache result
        self.cache[cache_key] = result
        
        return result
    
    def _get_recommendation(self, rsi: float, trend: str) -> dict:
        """Generate trading recommendation based on indicators"""
        if rsi < 30 and trend in ["neutral", "bullish"]:
            return {
                "action": "BUY",
                "strength": "strong",
                "reason": "Oversold conditions with potential reversal"
            }
        elif rsi > 70 and trend in ["neutral", "bearish"]:
            return {
                "action": "SELL",
                "strength": "strong",
                "reason": "Overbought conditions with potential pullback"
            }
        elif trend == "bullish" and 30 <= rsi <= 70:
            return {
                "action": "BUY",
                "strength": "moderate",
                "reason": "Bullish trend continuation expected"
            }
        elif trend == "bearish" and 30 <= rsi <= 70:
            return {
                "action": "SELL",
                "strength": "moderate",
                "reason": "Bearish trend continuation expected"
            }
        else:
            return {
                "action": "HOLD",
                "strength": "neutral",
                "reason": "No clear signal - wait for better entry"
            }

# Global predictor instance
predictor = PricePredictor()
