import React, { useState } from 'react'
import './styles/App.css'
import QuizList from './components/QuizList'
import QuizTaker from './components/QuizTaker'
import Results from './components/Results'

export default function App() {
  const [screen, setScreen] = useState('list') // 'list', 'quiz', 'results'
  const [selectedQuizId, setSelectedQuizId] = useState(null)
  const [results, setResults] = useState(null)

  const handleStartQuiz = (quizId) => {
    setSelectedQuizId(quizId)
    setScreen('quiz')
  }

  const handleSubmitQuiz = (resultsData) => {
    setResults(resultsData)
    setScreen('results')
  }

  const handleRetake = () => {
    setScreen('quiz')
    setResults(null)
  }

  const handleBackToList = () => {
    setScreen('list')
    setSelectedQuizId(null)
    setResults(null)
  }

  return (
    <div className='app'>
      <header className='app-header'>
        <h1>🎯 Tacnique Quiz</h1>
      </header>
      <main className='app-main'>
        {screen === 'list' && <QuizList onStartQuiz={handleStartQuiz} />}
        {screen === 'quiz' && (
          <QuizTaker quizId={selectedQuizId} onSubmit={handleSubmitQuiz} onBack={handleBackToList} />
        )}
        {screen === 'results' && (
          <Results results={results} onRetake={handleRetake} onBackToList={handleBackToList} />
        )}
      </main>
    </div>
  )
}
