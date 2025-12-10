from django.contrib import admin
from .models import (
    Shalwar_Qameez, Shirt, Trouser,
    Vase_Coat, Sheer_Vani, Coat,Task,Customer
)

# Register your models here.

admin.site.register(Shalwar_Qameez)
admin.site.register(Shirt)  
admin.site.register(Trouser)
admin.site.register(Vase_Coat)
admin.site.register(Sheer_Vani)
admin.site.register(Coat)
admin.site.register(Task)
admin.site.register(Customer)
