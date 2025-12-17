from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TaskViewSet,UserSignupView,UserListView,UserProfileView,UserViewSet,current_user,user_permissions_view,CustomerViewSet
from .views import (
    ShalwarQameezViewSet, ShirtViewSet, TrouserViewSet,
    VaseCoatViewSet, SheerVaniViewSet, CoatViewSet,list_groups,ChangePasswordView
)
router = DefaultRouter()

router.register(r'tasks', TaskViewSet,basename='task')
router.register(r'users', UserViewSet,basename='user')
router.register(r'customers', CustomerViewSet,basename='customer')
router.register(r'shalwar-qameez', ShalwarQameezViewSet)
router.register(r'shirt', ShirtViewSet)
router.register(r'trouser', TrouserViewSet)
router.register(r'vase-coat', VaseCoatViewSet)
router.register(r'sheer-vani', SheerVaniViewSet)
router.register(r'coat', CoatViewSet)


urlpatterns = [
    path('', include(router.urls)),
    path('current_user/', current_user),
    path('change-password/', ChangePasswordView.as_view()),
    path('allusers/',UserListView.as_view(),name='allusers' ),
    path('profile/',UserProfileView.as_view(),name='profile' ),
    path('signup/',UserSignupView.as_view(),name='singup' ),
    path('users/me/permissions/',user_permissions_view),
    path("groups/", list_groups),
]
