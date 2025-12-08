from rest_framework import serializers
from .models import Task,Category
from django.contrib.auth.models import User
import re

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


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']

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

            'front_pocket_right',
            'side_pocket_left',
            'side_pocket_right',
            'side_pocket_left',

            'coller',
            'tera',
            'sleve_length',
            'sleve_hole',
            'cuff_hole',
            'cuff_width',

            'chest',
            'belly',

            'shirt_kera_round',
            'shirt_kera',
            'shirt_length',

            'shalwar_length',
            'shalwar_hole',
            'shalwar_pocket',

            'created_at'
        ]


class CategorySerializer(serializers.ModelSerializer):

    class Meta:

        model=Category
        fields=['id','name']
        