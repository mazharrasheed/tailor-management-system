from django.db import models
from django.contrib.auth.models import User
# Create your models here.



class CustomPermissions(models.Model):
    class Meta:
        permissions = [
            ('view_dashboard', 'Can view dashboard'),
            ("view_balance_sheet", "Can view balance sheet"),
            ("view_store", "Can view store"),
            ("view_reports", "Can view reports"),
            ("view_inventory", "Can view inventory"),
            # Add more custom permissions here
        ]


class SoftDeleteManager(models.Manager):
    def get_queryset(self):
        return super().get_queryset().filter(is_deleted=False)

class SoftDeleteModel(models.Model):
    is_deleted = models.BooleanField(default=False)

    filtered = SoftDeleteManager()
    objects = models.Manager()

    class Meta:
        abstract = True

    def delete(self):
        self.is_deleted = True
        self.save()

    def hard_delete(self):
        super().delete()



class Task(SoftDeleteModel):
    Customer=models.ForeignKey('Customer', on_delete=models.RESTRICT, related_name='tasks', null=True, blank=True)
    title = models.CharField(max_length=100)
    description = models.TextField(blank=True)
    completed = models.BooleanField(default=False)
    assigned_to = models.ForeignKey(User, on_delete=models.CASCADE, related_name='tasks')
    created_at = models.DateTimeField(auto_now_add=True)
    due_date = models.DateTimeField(null=True, blank=True )

    def __str__(self):
        return self.title
    
    
class Customer(SoftDeleteModel):     

    name = models.CharField(max_length=100)
    Phome_number=models.CharField(max_length=15,blank=True)
    Adress=models.CharField(max_length=255,blank=True)
    description = models.TextField(blank=True)
    front_pocket_right=models.BooleanField(default=False)
    front_pocket_left=models.BooleanField(default=True)
    side_pocket_right=models.BooleanField(default=True)
    side_pocket_left=models.BooleanField(default=False)
    coller= models.CharField(max_length=100, blank=True)
    tera= models.CharField(max_length=100, blank=True)
    sleve_length= models.CharField(max_length=100, blank=True)
    sleve_hole= models.CharField(max_length=100, blank=True)
    cuff_hole= models.CharField(max_length=100, blank=True)
    cuff_width= models.CharField(max_length=100, blank=True)
    chest= models.CharField(max_length=100, blank=True)
    belly= models.CharField(max_length=100, blank=True)
    shirt_kera_round= models.BooleanField(default=True)
    shirt_kera= models.CharField(max_length=100, blank=True)
    shirt_length= models.CharField(max_length=100, blank=True)
    shalwar_length= models.CharField(max_length=100, blank=True)
    shalwar_hole= models.CharField(max_length=100, blank=True)
    shalwar_pocket=models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.name
    
    
class Category(SoftDeleteModel):
    name = models.CharField(max_length=100)
    
    def __str__(self):
        return self.name
