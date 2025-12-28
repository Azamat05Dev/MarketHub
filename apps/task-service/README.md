# Task Service

Workflow and task management service with background job processing.

## Features

- Task management (create, assign, track)
- PDF report generation
- Automated email notifications
- Celery background jobs
- MongoDB for flexible documents

## Tech Stack

- **Framework**: Django 5
- **Database**: MongoDB
- **Task Queue**: Celery + RabbitMQ
- **PDF**: ReportLab

## API Endpoints

- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/:id` - Get task detail
- `PUT /api/tasks/:id` - Update task
- `DELETE /api/tasks/:id` - Delete task
- `POST /api/tasks/generate-report` - Generate PDF report

## Running

```bash
# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Start server
python manage.py runserver 3004

# Start Celery worker 
celery -A taskservice worker -l info
```
