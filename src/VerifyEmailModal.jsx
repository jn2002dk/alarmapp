import React, { useState } from 'react';
import './App.css';

function VerifyEmailModal({ isOpen, userId, onVerified, onCancel }) {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter the verification code');
      return;
    }
    setError('');
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/verifyEmail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, code: code.trim() }),
      });
      if (res.ok) {
        const body = await res.json();
        if (body && body.deviceToken) {
          localStorage.setItem('appDeviceToken', body.deviceToken);
          onVerified(body.deviceToken);
        } else {
          onVerified(null);
        }
      } else {
        const txt = await res.text();
        setError(`Verification failed: ${res.status} ${txt}`);
      }
    } catch (err) {
      setError('Network error verifying code');
    }
    setIsSubmitting(false);
  };

  const handleResend = async () => {
    try {
      await fetch('/api/sendVerification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, userEmail: localStorage.getItem('appUserEmail') }),
      });
      setError('Verification code resent (check server logs during dev).');
    } catch (err) {
      setError('Failed to resend verification code');
    }
  };

  const handleCancel = () => {
    setCode('');
    setError('');
    onCancel();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Enter verification code</h3>
        <p>We sent a verification code to your email. Enter it here to complete registration.</p>
        <form onSubmit={handleSubmit}>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="123456"
            className="modal-input"
            autoFocus
          />
          {error && <p className="modal-error">{error}</p>}
          <div className="modal-actions">
            <button type="submit" disabled={isSubmitting} className="modal-button submit">Verify</button>
            <button type="button" className="modal-button" onClick={handleResend}>Resend</button>
            <button type="button" className="modal-button cancel" onClick={handleCancel}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VerifyEmailModal;
