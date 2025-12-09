from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task,Category,Customer
from .serializers import TaskSerializer,UserSignupSerializer,CategorySerializer,CustomerSerializer
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from .serializers import TaskSerializer, UserSerializer
from rest_framework.decorators import action
from rest_framework.permissions import DjangoObjectPermissions

class UserProfileView(APIView):

    def get(self, request):
        users = User.objects.filter(username=request.user.username) 
        serializer = UserSignupSerializer(users, many=True)
        return Response(serializer.data)
    
class UserListView(APIView):
    def get(self, request):
        if request.user.is_superuser:
            users = User.objects.all() 
        else:
            users = User.objects.filter(username=request.user)
        serializer = UserSignupSerializer(users, many=True)
        return Response(serializer.data)
    
class UserSignupView(APIView):
    permission_classes = [permissions.AllowAny]

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'message': 'User created successfully!',
                'token': token.key
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TaskViewSet(viewsets.ModelViewSet):
    serializer_class = TaskSerializer
    permission_classes = [permissions.IsAuthenticated,DjangoObjectPermissions]

    def get_queryset(self):
        user = self.request.user
        if user.is_superuser |user.has_perm('tasks.view_task'):
            return Task.filtered.all()
        return Task.filtered.filter(assigned_to=user)

    def create(self, request, *args, **kwargs):
        # Allow any user with the add_task permission
        if not request.user.has_perm('tasks.add_task'):
            return Response({"error": "You do not have permission to add tasks."}, status=403)
        return super().create(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        task = self.get_object()
        if not request.user.has_perm('tasks.delete_task', task):
            return Response({"error": "You do not have permission to delete this task."}, status=403)
        task.delete()  # Soft delete
        return Response({'detail': 'Task soft-deleted.'}, status=status.HTTP_204_NO_CONTENT)

    def update(self, request, *args, **kwargs):
        task = self.get_object()
        if not request.user.has_perm('tasks.change_task', task):
            return Response({"error": "You do not have permission to update this task."}, status=403)
        return super().update(request, *args, **kwargs)

    @action(detail=True, methods=['delete'], url_path='hard-delete')
    def hard_delete(self, request, pk=None):
        try:
            task = Task.objects.get(pk=pk)
            if not request.user.has_perm('tasks.delete_task', task):
                return Response({"error": "You do not have permission to hard-delete this task."}, status=403)
            task.hard_delete()
            return Response({'detail': 'Task permanently deleted.'}, status=status.HTTP_204_NO_CONTENT)
        except Task.DoesNotExist:
            return Response({'detail': 'Task not found.'}, status=status.HTTP_404_NOT_FOUND)

class UserViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'is_superuser': request.user.is_superuser
    })

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    user = request.user
    all_perms = user.get_all_permissions()  # returns set of strings like "app_label.codename"
    # Optional: group permissions by app
    permissions_by_app = {}
    for perm in all_perms:
        app_label, codename = perm.split('.')
        permissions_by_app.setdefault(app_label, []).append(codename)

    if not permissions_by_app:
        print("no permissions")
        return Response({
            'username': user.username,
            'permissions': {'tasks':[]}
    })  
    else:
        return Response({
            'username': user.username,
            'permissions': permissions_by_app
    })

from rest_framework.response import Response
from django.contrib.auth.models import Permission
# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
def user_permissions_view(request):
    user = request.user

    # Get permission strings: app.codename
    user_permissions = user.get_all_permissions()

    # Build full objects from Permission model
    permission_objects = []
    for perm_str in user_permissions:
        app_label, codename = perm_str.split(".")
        try:
            perm = Permission.objects.get(codename=codename)
            permission_objects.append({
                "codename": perm.codename,
                "name": perm.name,
                "app_label": app_label
            })
        except Permission.DoesNotExist:
            pass

    return Response({
        "username": user.username,
        "permissions": permission_objects
    })


class CustomerViewSet(viewsets.ModelViewSet):

    queryset=Customer.filtered.all()
    serializer_class=CustomerSerializer
    permission_classes=[permissions.IsAuthenticated,DjangoObjectPermissions]

    def create(self, request, *args, **kwargs):
        print(self.request.user,self.request.data)
        return super().create(request, *args, **kwargs)
    
class CategoryViewSet(viewsets.ModelViewSet):

    queryset=Category.filtered.all()
    serializer_class=CategorySerializer
    permission_classes=[permissions.IsAuthenticated,DjangoObjectPermissions]

    def create(self, request, *args, **kwargs):
        print(self.request.user,self.request.data)
        return super().create(request, *args, **kwargs)