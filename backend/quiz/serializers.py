from rest_framework import serializers
from .models import Quiz, Question, Choice, Submission, Answer


class ChoiceSerializer(serializers.ModelSerializer):
    class Meta:
        model = Choice
        fields = ('id', 'text')


class ChoicePublicSerializer(serializers.ModelSerializer):
    """Hides the is_correct field from public API."""
    class Meta:
        model = Choice
        fields = ('id', 'text')


class QuestionSerializer(serializers.ModelSerializer):
    choices = ChoiceSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'qtype', 'order', 'choices')


class QuestionPublicSerializer(serializers.ModelSerializer):
    """Public version that hides correct answers."""
    choices = ChoicePublicSerializer(many=True, read_only=True)

    class Meta:
        model = Question
        fields = ('id', 'text', 'qtype', 'order', 'choices')


class QuizListSerializer(serializers.ModelSerializer):
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'question_count')
    
    def get_question_count(self, obj):
        return obj.questions.count()


class QuizDetailSerializer(serializers.ModelSerializer):
    questions = QuestionSerializer(many=True, read_only=True)

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'questions')


class QuizPublicSerializer(serializers.ModelSerializer):
    """Public API for quiz taking — doesn't expose correct answers."""
    questions = QuestionPublicSerializer(many=True, read_only=True)
    question_count = serializers.SerializerMethodField()

    class Meta:
        model = Quiz
        fields = ('id', 'title', 'question_count', 'questions')
    
    def get_question_count(self, obj):
        return obj.questions.count()


class SubmitAnswerSerializer(serializers.Serializer):
    question = serializers.IntegerField()
    choice = serializers.IntegerField(required=False, allow_null=True)
    text = serializers.CharField(required=False, allow_blank=True)


class SubmitSerializer(serializers.Serializer):
    answers = SubmitAnswerSerializer(many=True)
