import React from 'react';
import './App.css'; // Assuming styles will be added to App.css

function ConfirmationModal({ isOpen, message, onConfirm, onCancel }) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <p>{message}</p>
        <div className="modal-actions">
          <button onClick={onConfirm} className="modal-button confirm">Confirm</button>
          <button onClick={onCancel} className="modal-button cancel">Cancel</button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
