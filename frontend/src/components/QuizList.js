import React, { useEffect, useState } from 'react'
import axios from 'axios'
import '../styles/QuizList.css'
import { API_BASE_URL } from '../config'

export default function QuizList({ onStartQuiz }) {
  const [quizzes, setQuizzes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchQuizzes()
  }, [])

  const fetchQuizzes = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`${API_BASE_URL}/api/quizzes/`)
      setQuizzes(response.data)
    } catch (err) {
      setError('Failed to load quizzes. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='quiz-list-container'>
        <div className='spinner'>Loading quizzes...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className='quiz-list-container'>
        <div className='error-message'>{error}</div>
        <button onClick={fetchQuizzes} className='btn btn-primary'>Retry</button>
      </div>
    )
  }

  if (quizzes.length === 0) {
    return (
      <div className='quiz-list-container'>
        <p>No quizzes available at the moment.</p>
      </div>
    )
  }

  return (
    <div className='quiz-list-container'>
      <div className='quiz-list-header'>
        <h2>Available Quizzes</h2>
        <p className='subtitle'>Choose a quiz to get started</p>
      </div>
      <div className='quiz-grid'>
        {quizzes.map(quiz => (
          <div key={quiz.id} className='quiz-card'>
            <h3>{quiz.title}</h3>
            <div className='quiz-meta'>
              <span className='question-count'>
                📝 {quiz.question_count} question{quiz.question_count !== 1 ? 's' : ''}
              </span>
            </div>
            <button
              onClick={() => onStartQuiz(quiz.id)}
              className='btn btn-primary btn-block'
            >
              Start Quiz
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
