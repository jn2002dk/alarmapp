import React, { useState } from 'react';
import './App.css'; // We'll add modal styles here for simplicity

const EMAIL_REGEX = /\S+@\S+\.\S+/;

function EmailPromptModal({ isOpen, onSubmit, onCancel }) { // Changed onClose to onCancel for clarity
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    if (email.trim() === '') {
      setError('Email address cannot be empty.');
      return;
    }
    if (!EMAIL_REGEX.test(email)) {
      setError('Invalid email format. Please enter a valid email (e.g., user@example.com).');
      return;
    }
    setError('');
    onSubmit(email);
  };

  // Use onCancel when the cancel button is clicked or if needed for an escape key, etc.
  const handleCancel = () => {
    setEmail(''); 
    setError('');   
    onCancel(); // Call the onCancel prop (passed from App.jsx)
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h2>Welcome!</h2>
        <p>To use this application, please enter your email address:</p>
        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="your@email.com"
            className="modal-input"
            autoFocus
          />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="submit" className="modal-button submit">Submit</button>
            {/* Changed onClick to call handleCancel which calls onCancel prop */} 
            <button type="button" className="modal-button cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EmailPromptModal;
