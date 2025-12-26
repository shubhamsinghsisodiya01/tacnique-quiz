from django.urls import path
from . import views

urlpatterns = [
    path('quizzes/', views.QuizListAPIView.as_view(), name='quiz-list'),
    path('quizzes/<int:pk>/', views.QuizDetailAPIView.as_view(), name='quiz-detail'),
    path('quizzes/<int:pk>/public/', views.QuizPublicAPIView.as_view(), name='quiz-public'),
    path('quizzes/<int:pk>/submit/', views.QuizSubmitAPIView.as_view(), name='quiz-submit'),
]
