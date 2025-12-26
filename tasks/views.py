from django.shortcuts import render

# Create your views here.

from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticated
from .models import Task,Customer
from .serializers import TaskSerializer,UserSignupSerializer,CustomerSerializer
from .serializers import (
    ShalwarQameezSerializer, ShirtSerializer, TrouserSerializer,
    VaseCoatSerializer, SheerVaniSerializer, CoatSerializer
)
from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from rest_framework.authtoken.models import Token
from rest_framework.decorators import api_view, permission_classes
from .serializers import TaskSerializer, UserSerializer
from rest_framework.decorators import action
from rest_framework.permissions import DjangoObjectPermissions
from django.contrib.auth.models import Permission
from django.contrib.auth.models import Group

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from django.core.mail import send_mail
from django.utils.crypto import get_random_string
from django.conf import settings
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
import json

reset_tokens = {}  # simple in-memory store; use DB in production

@csrf_exempt
def forgot_password(request):
    if request.method == "POST":
        try:
            if request.content_type == "application/json":
                data = json.loads(request.body.decode("utf-8"))
            else:
                data = request.POST
            email = data.get("email")

            if not email:
                return JsonResponse({"error": "Email is required."}, status=400)
            
            print('reset_tokens')
            user = User.objects.get(email=email)
            token = get_random_string(32)
            reset_tokens[token] = user.username

            reset_link = f"{settings.FRONTEND_URL}/reset-password/{token}"
            send_mail(
                "Password Reset Request",
                f"Click here to reset your password: {reset_link}",
                settings.DEFAULT_FROM_EMAIL,
                [email],
                fail_silently=False,
            )
            return JsonResponse({"message": "Password reset link sent to your email."})

        except json.JSONDecodeError:
            return JsonResponse({"error": "Invalid JSON format."}, status=400)
        except User.DoesNotExist:
            return JsonResponse({"error": "Email not found."}, status=400)

    return JsonResponse({"error": "Invalid request method."}, status=400)

@csrf_exempt
def reset_password(request, token):
    if request.method == "POST":
        data = json.loads(request.body)
        new_password = data.get("new_password")
        username = reset_tokens.get(token)
        if not username:
            return JsonResponse({"error": "Invalid or expired token"}, status=400)
        user = User.objects.get(username=username)
        user.set_password(new_password)
        user.save()
        del reset_tokens[token]  # remove used token
        return JsonResponse({"message": "Password reset successful"})
    return JsonResponse({"error": "Invalid request"}, status=400)


class ChangePasswordView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        user = request.user

        old_password = request.data.get("old_password")
        new_password1 = request.data.get("new_password1")
        new_password2 = request.data.get("new_password2")

        if not user.check_password(old_password):
            return Response(
                {"old_password": ["Old password is incorrect"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        if new_password1 != new_password2:
            return Response(
                {"new_password2": ["Passwords do not match"]},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            validate_password(new_password1, user)
        except ValidationError as e:
            return Response(
                {"new_password2": e.messages},
                status=status.HTTP_400_BAD_REQUEST
            )

        user.set_password(new_password1)
        user.save()

        return Response(
            {"detail": "Password changed successfully"},
            status=status.HTTP_200_OK
        )


class UserProfileView(APIView):

    def get(self, request):
        users = User.objects.filter(username=request.user.username) 
        serializer = UserSerializer(users, many=True)
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

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request, *args, **kwargs):
        users = self.get_queryset()
        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)


# @api_view(['GET'])
# @permission_classes([IsAuthenticated])
# def user_permissions_view(request):
#     user = request.user
#     user_perms = user.get_all_permissions()  # {"app_label.codename"}
#     permission_objects = []
#     for perm in user_perms:
#         app_label, codename = perm.split(".")
#         # ⛔ Skip permissions not belonging to "tasks" app
#         if app_label != "tasks":
#             continue
#         try:
#             perm_obj = Permission.objects.get(codename=codename, content_type__app_label="tasks")
#             permission_objects.append({
#                 "codename": perm_obj.codename,
#                 "name": perm_obj.name,
#                 "app_label": "tasks"
#             })
#         except Permission.DoesNotExist:
#             pass
#     return Response({
#         "username": user.username,
#         "permissions": permission_objects
#     })

from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from django.contrib.auth.models import Permission


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_permissions_view(request):
    user = request.user

    # -----------------------------
    # ✅ SUPERUSER: return ALL permissions
    # -----------------------------
    if user.is_superuser:
        perms = Permission.objects.select_related("content_type").all()

        permission_objects = [
            {
                "codename": perm.codename,
                "name": perm.name,
                "app_label": perm.content_type.app_label,
            }
            for perm in perms
        ]

        return Response({
            "username": user.username,
            "is_superuser": True,
            "permissions": permission_objects,
        })

    # -----------------------------
    # ✅ NORMAL USER: only assigned permissions
    # (filtered to tasks app)
    # -----------------------------
    user_perms = user.get_all_permissions()  # {"app_label.codename"}
    permission_objects = []

    for perm in user_perms:
        app_label, codename = perm.split(".")

        # Only allow permissions from tasks app
        if app_label != "tasks":
            continue

        try:
            perm_obj = Permission.objects.get(
                codename=codename,
                content_type__app_label=app_label
            )
            permission_objects.append({
                "codename": perm_obj.codename,
                "name": perm_obj.name,
                "app_label": app_label,
            })
        except Permission.DoesNotExist:
            pass

    return Response({
        "username": user.username,
        "is_superuser": False,
        "permissions": permission_objects,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_groups(request):
    groups = Group.objects.all()
    data = [{"id": g.id, "name": g.name} for g in groups]
    return Response(data)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def current_user(request):
    return Response({
        'id': request.user.id,
        'username': request.user.username,
        'is_superuser': request.user.is_superuser
    })


class CustomerViewSet(viewsets.ModelViewSet):

    queryset=Customer.filtered.all()
    serializer_class=CustomerSerializer
    permission_classes=[permissions.IsAuthenticated,DjangoObjectPermissions]
    

    def create(self, request, *args, **kwargs):
        print(self.request.user,self.request.data)
        return super().create(request, *args, **kwargs)
    

from rest_framework import viewsets, permissions

from .models import (
    Shalwar_Qameez, Shirt, Trouser,
    Vase_Coat, Sheer_Vani, Coat
)
from django_filters.rest_framework import DjangoFilterBackend
class ShalwarQameezViewSet(viewsets.ModelViewSet):
    queryset = Shalwar_Qameez.objects.all()
    serializer_class = ShalwarQameezSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        qs = Shalwar_Qameez.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs


class ShirtViewSet(viewsets.ModelViewSet):
    queryset = Shirt.objects.all()
    serializer_class = ShirtSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Shirt.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

class TrouserViewSet(viewsets.ModelViewSet):
    queryset = Trouser.objects.all()
    serializer_class = TrouserSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Trouser.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

class VaseCoatViewSet(viewsets.ModelViewSet):
    queryset = Vase_Coat.objects.all()
    serializer_class = VaseCoatSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Vase_Coat.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

class SheerVaniViewSet(viewsets.ModelViewSet):
    queryset = Sheer_Vani.objects.all()
    serializer_class = SheerVaniSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Sheer_Vani.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs

class CoatViewSet(viewsets.ModelViewSet):
    queryset = Coat.objects.all()
    serializer_class = CoatSerializer
    permission_classes = [permissions.IsAuthenticated]
    def get_queryset(self):
        qs = Coat.objects.all()
        customer_id = self.request.query_params.get("customer")
        print(customer_id)
        if customer_id:
            qs = qs.filter(customer_id=customer_id)
        return qs
