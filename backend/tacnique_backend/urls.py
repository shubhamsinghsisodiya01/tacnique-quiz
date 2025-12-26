from django.contrib import admin
from django.urls import path, include
#url
urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('quiz.urls')),
]
