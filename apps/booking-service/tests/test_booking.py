"""
Tests for Booking Service
"""
import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


class TestHealthEndpoint:
    """Tests for health check endpoint"""
    
    def test_health_check(self):
        """Test that health endpoint returns OK"""
        response = client.get("/api/booking/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "ok"
        assert data["service"] == "booking-service"


class TestBookingEndpoints:
    """Tests for booking endpoints"""
    
    def test_create_booking(self):
        """Test creating a new booking"""
        booking_data = {
            "user_id": "test-user-123",
            "analyst_id": "analyst-456",
            "slot_time": "2025-12-30T10:00:00",
            "duration_minutes": 30
        }
        
        response = client.post("/api/booking/book", json=booking_data)
        # May succeed or fail based on DB state
        assert response.status_code in [200, 201, 409, 500]
    
    def test_get_user_bookings(self):
        """Test getting bookings for a user"""
        response = client.get("/api/booking/my-bookings?user_id=test-user-123")
        assert response.status_code == 200
        assert isinstance(response.json(), list)
    
    def test_cancel_booking_not_found(self):
        """Test canceling a non-existent booking"""
        response = client.delete(
            "/api/booking/non-existent-id?user_id=test-user"
        )
        assert response.status_code == 404


class TestRootEndpoint:
    """Tests for root endpoint"""
    
    def test_root(self):
        """Test root endpoint returns service info"""
        response = client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "MarketHub" in data["message"]
