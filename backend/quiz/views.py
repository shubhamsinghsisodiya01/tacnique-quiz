from rest_framework import generics, status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.throttling import AnonRateThrottle
from django.shortcuts import get_object_or_404

from .models import Quiz, Question, Choice, Submission, Answer
from .serializers import (
    QuizListSerializer,
    QuizDetailSerializer,
    QuizPublicSerializer,
    SubmitSerializer,
)


class AnonQuizThrottle(AnonRateThrottle):
    scope = 'anon_quiz'


class QuizListAPIView(generics.ListAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizListSerializer


class QuizDetailAPIView(generics.RetrieveAPIView):
    queryset = Quiz.objects.all()
    serializer_class = QuizDetailSerializer


class QuizPublicAPIView(generics.RetrieveAPIView):
    """
    Public API endpoint to fetch quiz questions without revealing correct answers.
    Used by the React frontend to display the quiz.
    """
    queryset = Quiz.objects.all()
    serializer_class = QuizPublicSerializer
    throttle_classes = [AnonQuizThrottle]


class QuizSubmitAPIView(APIView):
    throttle_classes = [AnonQuizThrottle]
    
    def post(self, request, pk):
        quiz = get_object_or_404(Quiz, pk=pk)
        serializer = SubmitSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        data = serializer.validated_data

        submission = Submission.objects.create(quiz=quiz)
        total = 0
        correct = 0
        results = []

        for ans in data['answers']:
            qid = ans['question']
            question = get_object_or_404(Question, pk=qid, quiz=quiz)
            selected_choice = None
            text_answer = ''
            is_correct = False
            correct_choice_text = None

            if 'choice' in ans and ans['choice'] is not None:
                try:
                    selected_choice = Choice.objects.get(pk=ans['choice'], question=question)
                except Choice.DoesNotExist:
                    selected_choice = None
            if 'text' in ans:
                text_answer = ans['text']

            Answer.objects.create(
                submission=submission,
                question=question,
                selected_choice=selected_choice,
                text_answer=text_answer,
            )

            # Score the answer
            if question.qtype in ('mcq', 'tf'):
                total += 1
                # Find the correct choice
                correct_choice = question.choices.filter(is_correct=True).first()
                if correct_choice:
                    correct_choice_text = correct_choice.text
                    if selected_choice and selected_choice.is_correct:
                        correct += 1
                        is_correct = True
                        
            # Build per-question result for client
            results.append({
                'question_id': question.id,
                'question_text': question.text,
                'question_type': question.qtype,
                'user_answer': selected_choice.text if selected_choice else text_answer,
                'correct_answer': correct_choice_text,
                'is_correct': is_correct,
            })

        score = None
        if total > 0:
            score = (correct / total) * 100.0
        submission.score = score
        submission.save()

        return Response({
            'score': score,
            'correct': correct,
            'total': total,
            'results': results
        }, status=status.HTTP_201_CREATED)
