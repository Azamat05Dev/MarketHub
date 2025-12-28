from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import HttpResponse
from .models import Task, TaskComment
from .serializers import TaskSerializer, TaskCreateSerializer, TaskCommentSerializer
from .tasks import generate_pdf_report, send_task_notification

class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return TaskCreateSerializer
        return TaskSerializer
    
    def list(self, request):
        """List all tasks with optional filtering"""
        queryset = self.queryset
        
        # Filter by status
        status_filter = request.query_params.get('status')
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        # Filter by assigned user
        assigned_to = request.query_params.get('assigned_to')
        if assigned_to:
            queryset = queryset.filter(assigned_to=assigned_to)
        
        # Filter by created_by
        created_by = request.query_params.get('created_by')
        if created_by:
            queryset = queryset.filter(created_by=created_by)
        
        serializer = TaskSerializer(queryset, many=True)
        return Response(serializer.data)
    
    def create(self, request):
        """Create a new task"""
        serializer = TaskCreateSerializer(data=request.data)
        if serializer.is_valid():
            task = serializer.save()
            # Send notification asynchronously
            send_task_notification.delay(str(task.id), 'created')
            return Response(TaskSerializer(task).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def add_comment(self, request, pk=None):
        """Add a comment to a task"""
        task = self.get_object()
        serializer = TaskCommentSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save(task=task)
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def update_status(self, request, pk=None):
        """Update task status"""
        task = self.get_object()
        new_status = request.data.get('status')
        if new_status not in dict(Task.STATUS_CHOICES):
            return Response({'error': 'Invalid status'}, status=status.HTTP_400_BAD_REQUEST)
        
        task.status = new_status
        task.save()
        send_task_notification.delay(str(task.id), 'status_updated')
        return Response(TaskSerializer(task).data)
    
    @action(detail=False, methods=['get'])
    def generate_report(self, request):
        """Generate PDF report of all tasks"""
        user_id = request.query_params.get('user_id', 'all')
        # Trigger async PDF generation
        task_result = generate_pdf_report.delay(user_id)
        return Response({
            'message': 'Report generation started',
            'task_id': task_result.id
        })
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """Get task statistics"""
        total = Task.objects.count()
        pending = Task.objects.filter(status='pending').count()
        in_progress = Task.objects.filter(status='in_progress').count()
        completed = Task.objects.filter(status='completed').count()
        
        return Response({
            'total': total,
            'pending': pending,
            'in_progress': in_progress,
            'completed': completed
        })
