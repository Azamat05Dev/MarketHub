import redis
import os
from dotenv import load_dotenv
from typing import Optional
from datetime import datetime
from sqlalchemy.orm import Session
from app.models.database import Booking
import uuid

load_dotenv()

redis_client = redis.from_url(os.getenv("REDIS_URL"))

class BookingService:
    def __init__(self):
        self.redis = redis_client
        self.lock_ttl = 10  # Lock expires in 10 seconds

    async def book_slot(self, db: Session, user_id: str, analyst_id: str, slot_time: datetime, duration_minutes: int = 30) -> Optional[Booking]:
        """
        Book a time slot with Redis distributed lock.
        Handles high-load scenario where 1000+ users try to book same slot.
        """
        # Create unique lock key for this slot
        lock_key = f"lock:booking:{analyst_id}:{slot_time.isoformat()}"
        
        # Try to acquire lock (NX = only set if not exists)
        lock_acquired = self.redis.set(lock_key, user_id, nx=True, ex=self.lock_ttl)
        
        if not lock_acquired:
            # Another user already locked this slot
            return None
        
        try:
            # Check if slot is already booked in database
            existing_booking = db.query(Booking).filter(
                Booking.analyst_id == analyst_id,
                Booking.slot_time == slot_time,
                Booking.status != "cancelled"
            ).first()
            
            if existing_booking:
                return None
            
            # Create new booking
            booking = Booking(
                id=str(uuid.uuid4()),
                user_id=user_id,
                analyst_id=analyst_id,
                slot_time=slot_time,
                duration_minutes=duration_minutes,
                status="confirmed"
            )
            
            db.add(booking)
            db.commit()
            db.refresh(booking)
            
            return booking
            
        finally:
            # Always release the lock
            self.redis.delete(lock_key)

    def get_user_bookings(self, db: Session, user_id: str):
        """Get all bookings for a user"""
        return db.query(Booking).filter(Booking.user_id == user_id).all()

    def cancel_booking(self, db: Session, booking_id: str, user_id: str) -> bool:
        """Cancel a booking"""
        booking = db.query(Booking).filter(
            Booking.id == booking_id,
            Booking.user_id == user_id
        ).first()
        
        if not booking:
            return False
        
        booking.status = "cancelled"
        db.commit()
        return True
