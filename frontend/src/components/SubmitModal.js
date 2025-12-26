import React from 'react'
import '../styles/SubmitModal.css'

export default function SubmitModal({ answeredCount, totalCount, onConfirm, onCancel, isSubmitting }) {
  const allAnswered = answeredCount === totalCount

  return (
    <div className='modal-overlay'>
      <div className='modal-content'>
        <h3>Submit Quiz?</h3>
        <p>
          You have answered <strong>{answeredCount}</strong> out of <strong>{totalCount}</strong> questions.
        </p>
        {!allAnswered && (
          <div className='warning-box'>
            <p>⚠️ You have not answered all questions. They will be marked as incorrect.</p>
          </div>
        )}
        <div className='modal-actions'>
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className='btn btn-secondary'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className='btn btn-success'
          >
            {isSubmitting ? 'Submitting...' : 'Confirm Submit'}
          </button>
        </div>
      </div>
    </div>
  )
}
