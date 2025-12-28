"""Celery configuration for taskservice."""
import os
from celery import Celery

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'taskservice.settings')

app = Celery('taskservice')
app.config_from_object('django.conf:settings', namespace='CELERY')
app.autodiscover_tasks()

@app.task(bind=True)
def debug_task(self):
    print(f'Request: {self.request!r}')
