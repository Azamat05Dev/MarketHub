# Booking Service

High-load booking service with Redis distributed locks.

## Features

- VIP analyst booking system
- Redis distributed locks (handles 1000+ concurrent requests)
- PostgreSQL for persistence
- Saga pattern for transactions
- Conflict prevention

## Tech Stack

- **Framework**: FastAPI
- **Database**: PostgreSQL + SQLAlchemy
- **Cache/Locks**: Redis
- **Validation**: Pydantic

## Installation

```bash
# Create virtual environment
python -m venv venv
.\venv\Scripts\activate  # Windows

# Install dependencies
pip install -r requirements.txt
```

## Running

```bash
uvicorn app.main:app --reload --port 3003
```

## API Endpoints

- `POST /api/booking/book` - Book a time slot
- `GET /api/booking/slots/:analyst_id` - Get available slots
- `GET /api/booking/my-bookings` - Get user's bookings
- `DELETE /api/booking/:booking_id` - Cancel booking

## License

MIT
