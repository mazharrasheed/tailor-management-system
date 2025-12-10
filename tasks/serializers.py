from rest_framework import serializers
from .models import Task
from .models import (
    Shalwar_Qameez, Shirt, Trouser,
    Vase_Coat, Sheer_Vani, Coat
)
from django.contrib.auth.models import User
import re
from django.contrib.auth.models import Permission

class UserSignupSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = User
        fields = ['id','username', 'password']

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("This username is already taken.")
        if not re.match(r'^[a-zA-Z0-9_.-]+$', value):
            raise serializers.ValidationError("Username can only contain letters, numbers, underscores, hyphens, and dots.")
        if len(value) < 5:
            raise serializers.ValidationError("Username must be at least 5 characters long.")
        return value

    def validate_password(self, value):
        if len(value) < 8:
            raise serializers.ValidationError("Password must be at least 8 characters long.")
        if not re.search(r'[A-Z]', value):
            raise serializers.ValidationError("Password must contain at least one uppercase letter.")
        if not re.search(r'[a-z]', value):
            raise serializers.ValidationError("Password must contain at least one lowercase letter.")
        if not re.search(r'[0-9]', value):
            raise serializers.ValidationError("Password must contain at least one digit.")
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', value):
            raise serializers.ValidationError("Password must contain at least one special character.")
        return value

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            # email=validated_data.get('email', ''),
            password=validated_data['password']
        )
        return user


# class UserSerializer(serializers.ModelSerializer):
#     class Meta:
#         model = User
#         fields = ['id', 'username']

class UserSerializer(serializers.ModelSerializer):
    permissions = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'permissions']  # include permissions

    def get_permissions(self, obj):
        # Return all permissions the user has
        user_perms = obj.get_all_permissions()

        # Convert "app.codename" to object list
        perms_list = []
        for perm in user_perms:
            app_label, codename = perm.split('.')
            try:
                perm_obj = Permission.objects.get(codename=codename)
                perms_list.append({
                    "codename": perm_obj.codename,
                    "name": perm_obj.name,
                    "app_label": app_label
                })
            except Permission.DoesNotExist:
                pass

        return perms_list
    
class TaskSerializer(serializers.ModelSerializer):
    assigned_to_username = serializers.CharField(source='assigned_to.username', read_only=True)

    def get_permissions(self, obj):
        user = self.context['request'].user
        perms = {
            'can_view': user.has_perm('app.view_task', obj),
            'can_edit': user.has_perm('app.change_task', obj),
            'can_delete': user.has_perm('app.delete_task', obj),
        }
        return perms

    class Meta:
        model = Task
        fields = ['id', 'title','customer' ,'description', 'completed', 'assigned_to', 'assigned_to_username', 'created_at','due_date']


from rest_framework import serializers
from .models import Customer


from rest_framework import serializers
from .models import Customer

from rest_framework import serializers
from .models import Customer


from rest_framework import serializers
from .models import Customer


class CustomerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Customer
        fields = [
            'id',
            'name',
            'Phome_number',
            'Adress',
            'description',
            'created_at'
        ]


class ShalwarQameezSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shalwar_Qameez
        fields = "__all__"


class ShirtSerializer(serializers.ModelSerializer):
    class Meta:
        model = Shirt
        fields = "__all__"


class TrouserSerializer(serializers.ModelSerializer):
    class Meta:
        model = Trouser
        fields = "__all__"


class VaseCoatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vase_Coat
        fields = "__all__"


class SheerVaniSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sheer_Vani
        fields = "__all__"


class CoatSerializer(serializers.ModelSerializer):
    class Meta:
        model = Coat
        fields = "__all__"
