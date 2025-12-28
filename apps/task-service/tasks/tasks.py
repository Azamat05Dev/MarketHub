from celery import shared_task
from io import BytesIO
import logging

logger = logging.getLogger(__name__)

@shared_task
def generate_pdf_report(user_id: str):
    """
    Generate PDF report for tasks.
    This is a Celery background task.
    """
    try:
        from .models import Task
        
        if user_id == 'all':
            tasks = Task.objects.all()
        else:
            tasks = Task.objects.filter(created_by=user_id)
        
        # Simple text report (ReportLab can be used for real PDF)
        report_content = "TASK REPORT\n" + "=" * 50 + "\n\n"
        
        for task in tasks:
            report_content += f"Title: {task.title}\n"
            report_content += f"Status: {task.status}\n"
            report_content += f"Priority: {task.priority}\n"
            report_content += f"Created: {task.created_at}\n"
            report_content += "-" * 30 + "\n\n"
        
        # In production, save to S3 or file storage
        logger.info(f"Generated report for user: {user_id}, tasks count: {tasks.count()}")
        
        return {
            'success': True,
            'tasks_count': tasks.count(),
            'message': 'Report generated successfully'
        }
        
    except Exception as e:
        logger.error(f"Error generating report: {e}")
        return {'success': False, 'error': str(e)}


@shared_task
def send_task_notification(task_id: str, event_type: str):
    """
    Send notification when task is created or updated.
    This is a Celery background task.
    """
    try:
        from .models import Task
        
        task = Task.objects.get(id=task_id)
        
        # In production, send email/push notification
        logger.info(f"Notification: Task '{task.title}' - {event_type}")
        
        # Email would be sent here using Django's send_mail
        # send_mail(
        #     subject=f'Task {event_type}: {task.title}',
        #     message=f'Task status: {task.status}',
        #     from_email='noreply@markethub.com',
        #     recipient_list=[task.assigned_to_email],
        # )
        
        return {
            'success': True,
            'task_id': task_id,
            'event': event_type
        }
        
    except Exception as e:
        logger.error(f"Error sending notification: {e}")
        return {'success': False, 'error': str(e)}


@shared_task
def cleanup_old_tasks():
    """
    Cleanup old completed tasks (scheduled task).
    Run this daily via Celery Beat.
    """
    from datetime import timedelta
    from django.utils import timezone
    from .models import Task
    
    cutoff_date = timezone.now() - timedelta(days=90)
    old_tasks = Task.objects.filter(
        status='completed',
        updated_at__lt=cutoff_date
    )
    
    count = old_tasks.count()
    old_tasks.delete()
    
    logger.info(f"Cleaned up {count} old tasks")
    return {'deleted_count': count}
