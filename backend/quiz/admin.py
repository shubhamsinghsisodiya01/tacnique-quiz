from django.contrib import admin
from django.forms import ModelForm, ValidationError
from .models import Quiz, Question, Choice


class ChoiceForm(ModelForm):
    class Meta:
        model = Choice
        fields = ['text', 'is_correct']

    def clean(self):
        cleaned_data = super().clean()
        text = cleaned_data.get('text', '').strip()
        if not text:
            raise ValidationError("Choice text cannot be empty.")
        return cleaned_data


class ChoiceInline(admin.TabularInline):
    model = Choice
    form = ChoiceForm
    extra = 1
    fields = ('text', 'is_correct')
    classes = ['collapse']
    
    def get_queryset(self, request):
        qs = super().get_queryset(request)
        return qs.order_by('id')


class QuestionForm(ModelForm):
    class Meta:
        model = Question
        fields = ['text', 'qtype', 'order']
        help_texts = {
            'qtype': 'MCQ and True/False require at least 2 answer options',
            'order': 'Display order in the quiz (lower numbers appear first)',
        }

    def clean(self):
        cleaned_data = super().clean()
        text = cleaned_data.get('text', '').strip()
        qtype = cleaned_data.get('qtype')
        
        if not text:
            raise ValidationError("Question text cannot be empty.")
        
        # For MCQ and True/False, require at least 2 choices
        if qtype in ('mcq', 'tf'):
            if self.instance.pk:
                choice_count = self.instance.choices.count()
                qtype_name = dict(Question.TYPE_CHOICES).get(qtype, qtype)
                if choice_count < 2:
                    raise ValidationError(
                        f"{qtype_name} questions require at least 2 answer options. "
                        f"Currently has {choice_count}. Add more options below."
                    )
        
        return cleaned_data


class QuestionInline(admin.StackedInline):
    model = Question
    form = QuestionForm
    extra = 1
    fields = ('text', 'qtype', 'order')
    inlines = []  # Nested inlines not supported; use QuestionAdmin instead


@admin.register(Quiz)
class QuizAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'question_count')
    search_fields = ('title',)
    inlines = [QuestionInline]
    
    def question_count(self, obj):
        return obj.questions.count()
    question_count.short_description = "# Questions"


@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    list_display = ('id', 'quiz', 'text_preview', 'qtype', 'order', 'choice_count')
    list_filter = ('qtype', 'quiz')
    search_fields = ('text', 'quiz__title')
    ordering = ('quiz', 'order')
    inlines = [ChoiceInline]
    
    fieldsets = (
        ('Question Details', {
            'fields': ('quiz', 'text', 'qtype', 'order'),
            'description': 'Define the question and select its type. MCQ and True/False questions require answer options below.'
        }),
    )
    
    def text_preview(self, obj):
        text = obj.text[:60]
        return text + '...' if len(obj.text) > 60 else text
    text_preview.short_description = "Question"
    
    def choice_count(self, obj):
        count = obj.choices.count()
        qtype_name = dict(obj.TYPE_CHOICES).get(obj.qtype, obj.qtype)
        status = "✓" if (obj.qtype == 'text' or count >= 2) else "⚠"
        return f"{status} {count} options"
    choice_count.short_description = "Answer Options"


@admin.register(Choice)
class ChoiceAdmin(admin.ModelAdmin):
    list_display = ('id', 'question_text', 'text', 'is_correct_badge', 'quiz_title')
    list_filter = ('is_correct', 'question__qtype', 'question__quiz')
    search_fields = ('text', 'question__text', 'question__quiz__title')
    ordering = ('question', 'id')
    readonly_fields = ('question',)
    
    fieldsets = (
        ('Choice Details', {
            'fields': ('question', 'text', 'is_correct')
        }),
    )
    
    def question_text(self, obj):
        text = obj.question.text[:40]
        return text + '...' if len(obj.question.text) > 40 else text
    question_text.short_description = "Question"
    
    def quiz_title(self, obj):
        return obj.question.quiz.title
    quiz_title.short_description = "Quiz"
    
    def is_correct_badge(self, obj):
        if obj.is_correct:
            return "✓ Correct"
        return "✗ Incorrect"
    is_correct_badge.short_description = "Status"
