import React, { useState } from 'react'
import '../styles/Results.css'

export default function Results({ results, onRetake, onBackToList }) {
  const [expandedQuestion, setExpandedQuestion] = useState(null)

  const accuracy = results.total > 0 ? ((results.correct / results.total) * 100).toFixed(1) : 0
  const scorePercentage = results.score !== null ? results.score.toFixed(1) : 0

  const toggleExpand = (index) => {
    setExpandedQuestion(expandedQuestion === index ? null : index)
  }

  return (
    <div className='results-container'>
      <div className='results-header'>
        <h2>Quiz Complete! 🎉</h2>
      </div>

      <div className='score-card'>
        <div className='score-main'>
          <div className='score-circle'>
            <span className='score-percentage'>{scorePercentage}%</span>
          </div>
          <div className='score-info'>
            <p className='score-title'>Your Score</p>
            <p className='score-details'>
              {results.correct} out of {results.total} correct
            </p>
            <p className='accuracy'>Accuracy: {accuracy}%</p>
          </div>
        </div>
      </div>

      <div className='review-section'>
        <h3>Question Review</h3>
        <div className='questions-list'>
          {results.results.map((result, index) => (
            <div key={index} className='result-card'>
              <button
                className='result-header'
                onClick={() => toggleExpand(index)}
              >
                <span className={`result-badge ${result.is_correct ? 'correct' : 'incorrect'}`}>
                  {result.is_correct ? '✓' : '✗'}
                </span>
                <span className='result-question'>{result.question_text}</span>
                <span className='expand-icon'>
                  {expandedQuestion === index ? '▼' : '▶'}
                </span>
              </button>

              {expandedQuestion === index && (
                <div className='result-details'>
                  <div className='detail-row'>
                    <span className='label'>Question Type:</span>
                    <span className='value'>{result.question_type === 'mcq' ? 'Multiple Choice' : result.question_type === 'tf' ? 'True/False' : 'Text'}</span>
                  </div>

                  <div className='detail-row'>
                    <span className='label'>Your Answer:</span>
                    <span className={`value ${result.is_correct ? 'correct-answer' : 'incorrect-answer'}`}>
                      {result.user_answer || '(No answer)'}
                    </span>
                  </div>

                  {result.correct_answer && result.user_answer !== result.correct_answer && (
                    <div className='detail-row'>
                      <span className='label'>Correct Answer:</span>
                      <span className='value correct-answer'>{result.correct_answer}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className='results-actions'>
        <button onClick={onRetake} className='btn btn-primary'>
          Retake Quiz
        </button>
        <button onClick={onBackToList} className='btn btn-secondary'>
          Back to Quizzes
        </button>
      </div>
    </div>
  )
}
