"""
Tests for Task Service
"""
from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from tasks.models import Task
import uuid


class TaskModelTests(TestCase):
    """Tests for Task model"""
    
    def test_create_task(self):
        """Test creating a task"""
        task = Task.objects.create(
            title="Test Task",
            description="Test description",
            created_by="user-123"
        )
        
        self.assertIsNotNone(task.id)
        self.assertEqual(task.title, "Test Task")
        self.assertEqual(task.status, "pending")
        self.assertEqual(task.priority, "medium")
    
    def test_task_str_representation(self):
        """Test task string representation"""
        task = Task.objects.create(
            title="My Task",
            created_by="user-123"
        )
        
        self.assertEqual(str(task), "My Task")


class TaskAPITests(APITestCase):
    """Tests for Task API endpoints"""
    
    def setUp(self):
        """Set up test data"""
        self.task = Task.objects.create(
            title="Test Task",
            description="Test description",
            created_by="user-123"
        )
    
    def test_list_tasks(self):
        """Test listing all tasks"""
        url = reverse('task-list')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIsInstance(response.data, list)
    
    def test_create_task(self):
        """Test creating a task via API"""
        url = reverse('task-list')
        data = {
            "title": "New Task",
            "description": "New description",
            "created_by": "user-456",
            "priority": "high"
        }
        
        response = self.client.post(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], "New Task")
    
    def test_retrieve_task(self):
        """Test retrieving a single task"""
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], self.task.title)
    
    def test_update_task(self):
        """Test updating a task"""
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        data = {"title": "Updated Task"}
        
        response = self.client.patch(url, data, format='json')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['title'], "Updated Task")
    
    def test_delete_task(self):
        """Test deleting a task"""
        url = reverse('task-detail', kwargs={'pk': self.task.id})
        response = self.client.delete(url)
        
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Task.objects.filter(id=self.task.id).exists())
    
    def test_task_stats(self):
        """Test task statistics endpoint"""
        url = reverse('task-stats')
        response = self.client.get(url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('total', response.data)
        self.assertIn('pending', response.data)


class HealthCheckTests(APITestCase):
    """Tests for health check endpoint"""
    
    def test_health_check(self):
        """Test health check endpoint"""
        response = self.client.get('/health')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['status'], 'ok')
        self.assertEqual(response.data['service'], 'task-service')
