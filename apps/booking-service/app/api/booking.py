from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.schemas.booking import BookingCreate, BookingResponse
from app.services.booking import BookingService
from typing import List

router = APIRouter(prefix="/api/booking", tags=["booking"])
booking_service = BookingService()

@router.post("/book", response_model=BookingResponse)
async def book_slot(booking_data: BookingCreate, db: Session = Depends(get_db)):
    """
    Book a time slot with an analyst.
    Uses Redis distributed lock to prevent double-booking.
    """
    booking = await booking_service.book_slot(
        db=db,
        user_id=booking_data.user_id,
        analyst_id=booking_data.analyst_id,
        slot_time=booking_data.slot_time,
        duration_minutes=booking_data.duration_minutes
    )
    
    if not booking:
        raise HTTPException(
            status_code=409,
            detail="Slot already booked or locked by another user"
        )
    
    return booking

@router.get("/my-bookings", response_model=List[BookingResponse])
def get_my_bookings(user_id: str, db: Session = Depends(get_db)):
    """Get all bookings for a user"""
    bookings = booking_service.get_user_bookings(db, user_id)
    return bookings

@router.delete("/{booking_id}")
def cancel_booking(booking_id: str, user_id: str, db: Session = Depends(get_db)):
    """Cancel a booking"""
    success = booking_service.cancel_booking(db, booking_id, user_id)
    
    if not success:
        raise HTTPException(status_code=404, detail="Booking not found")
    
    return {"message": "Booking cancelled successfully"}

@router.get("/health")
def health_check():
    """Health check endpoint"""
    return {
        "status": "ok",
        "service": "booking-service"
    }
