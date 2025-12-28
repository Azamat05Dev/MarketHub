from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class BookingCreate(BaseModel):
    user_id: str
    analyst_id: str
    slot_time: datetime
    duration_minutes: int = 30

class BookingResponse(BaseModel):
    id: str
    user_id: str
    analyst_id: str
    slot_time: datetime
    duration_minutes: int
    status: str
    created_at: datetime

    class Config:
        from_attributes = True
