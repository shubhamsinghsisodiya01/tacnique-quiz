import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/QuizTaker.css'
import SubmitModal from './SubmitModal'
import { API_BASE_URL } from '../config'

export default function QuizTaker({ quizId, onSubmit, onBack }) {
  const [quiz, setQuiz] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState({})
  const [showSubmitModal, setShowSubmitModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchQuiz()
  }, [quizId])

  const fetchQuiz = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/quizzes/${quizId}/public/`)
      setQuiz(response.data)
      setCurrentQuestion(0)
      setAnswers({})
    } catch (err) {
      setError('Failed to load quiz. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }))
  }

  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1)
    }
  }

  const handlePrev = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1)
    }
  }

  const handleSubmitClick = () => {
    setShowSubmitModal(true)
  }

  const handleConfirmSubmit = async () => {
    setSubmitting(true)
    try {
      const payload = {
        answers: quiz.questions.map(q => ({
          question: q.id,
          choice: answers[q.id] ? parseInt(answers[q.id]) : null,
          text: ''
        }))
      }
      const response = await axios.post(`${API_BASE_URL}/api/quizzes/${quizId}/submit/`, payload)
      onSubmit(response.data)
    } catch (err) {
      alert('Error submitting quiz. Please try again.')
      console.error(err)
    } finally {
      setSubmitting(false)
      setShowSubmitModal(false)
    }
  }

  if (loading) {
    return (
      <div className='quiz-taker'>
        <div className='spinner'>Loading quiz...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='quiz-taker'>
        <div className='error-message'>{error}</div>
        <button onClick={onBack} className='btn btn-secondary'>Back to Quizzes</button>
      </div>
    )
  }

  if (!quiz || quiz.questions.length === 0) {
    return (
      <div className='quiz-taker'>
        <p>No questions in this quiz.</p>
        <button onClick={onBack} className='btn btn-secondary'>Back</button>
      </div>
    )
  }

  const question = quiz.questions[currentQuestion]
  const isAnswered = answers[question.id] !== undefined && answers[question.id] !== ''
  const answeredCount = Object.keys(answers).filter(k => answers[k]).length

  return (
    <div className='quiz-taker'>
      <div className='quiz-header'>
        <button onClick={onBack} className='btn-back'>← Back</button>
        <h2>{quiz.title}</h2>
        <div className='progress-info'>
          Question {currentQuestion + 1} of {quiz.questions.length}
        </div>
      </div>

      <div className='progress-bar'>
        <div
          className='progress-fill'
          style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
        ></div>
      </div>

      <div className='question-container'>
        <h3 className='question-text'>{question.text}</h3>

        {question.qtype === 'text' ? (
          <input
            type='text'
            className='text-input'
            value={answers[question.id] || ''}
            onChange={e => handleAnswerChange(question.id, e.target.value)}
            placeholder='Enter your answer...'
          />
        ) : (
          <div className='choices-container'>
            {question.choices.map(choice => (
              <label key={choice.id} className='choice-label'>
                <input
                  type='radio'
                  name={`question-${question.id}`}
                  value={choice.id}
                  checked={answers[question.id] === choice.id}
                  onChange={() => handleAnswerChange(question.id, choice.id)}
                />
                <span className='choice-text'>{choice.text}</span>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className='navigation-controls'>
        <button
          onClick={handlePrev}
          disabled={currentQuestion === 0}
          className='btn btn-secondary'
        >
          ← Previous
        </button>

        <div className='answer-status'>
          Answered: {answeredCount}/{quiz.questions.length}
        </div>

        {currentQuestion === quiz.questions.length - 1 ? (
          <button
            onClick={handleSubmitClick}
            className='btn btn-success'
          >
            Submit Quiz
          </button>
        ) : (
          <button
            onClick={handleNext}
            className='btn btn-primary'
          >
            Next →
          </button>
        )}
      </div>

      {showSubmitModal && (
        <SubmitModal
          answeredCount={answeredCount}
          totalCount={quiz.questions.length}
          onConfirm={handleConfirmSubmit}
          onCancel={() => setShowSubmitModal(false)}
          isSubmitting={submitting}
        />
      )}
    </div>
  )
}
