import { useState, useEffect } from 'react';
import './App.css';
import appLogo from './assets/logo.png';
import EmailPromptModal from './EmailPromptModal'; // Import the modal
import ConfirmationModal from './ConfirmationModal'; // Import the confirmation modal

// Simple email validation regex
const EMAIL_REGEX = /\S+@\S+\.\S+/;

function App() {
  const imageUrl = appLogo;
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false); // State for modal visibility
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false); // State for confirmation modal visibility
  const [confirmationModalMessage, setConfirmationModalMessage] = useState(''); // Message for confirmation modal
  const [currentButtonAction, setCurrentButtonAction] = useState(null); // Current button action for confirmation modal

  useEffect(() => {
    const initializeUser = () => {
      let storedUserId = localStorage.getItem('appUserId');
      let storedUserEmail = localStorage.getItem('appUserEmail');

      if (!storedUserId) {
        const newUserId = crypto.randomUUID();
        localStorage.setItem('appUserId', newUserId);
        setUserId(newUserId);
        // New user, so email must be prompted via modal
        setIsEmailModalOpen(true); 
        // Don't set isLoading to false yet, wait for modal interaction
      } else {
        setUserId(storedUserId);
        // User ID exists, check if email exists and is valid
        if (!storedUserEmail || storedUserEmail === 'Anonymous' || !EMAIL_REGEX.test(storedUserEmail)) {
          setIsEmailModalOpen(true);
          // Don't set isLoading to false yet
        } else {
          setUserEmail(storedUserEmail);
          setIsAccessDenied(false);
          setIsLoading(false);
          console.log(`User Initialized: ID - ${storedUserId}, Email - ${storedUserEmail}`);
        }
      }
    };

    initializeUser();
  }, []); // Empty dependency array ensures this runs only once on mount

  // Callback for when the modal submits an email
  const handleModalSubmit = (email) => {
    localStorage.setItem('appUserEmail', email);
    setUserEmail(email);
    setIsEmailModalOpen(false);
    setIsAccessDenied(false);
    setIsLoading(false);
    // Ensure userId is set if it was generated just before modal open
    if (!userId) {
        const currentUserId = localStorage.getItem('appUserId');
        setUserId(currentUserId);
        console.log(`User Initialized/Updated: ID - ${currentUserId}, Email - ${email}`);
    } else {
        console.log(`User Initialized/Updated: ID - ${userId}, Email - ${email}`);
    }
  };

  // Callback for when the modal is cancelled
  const handleModalCancel = () => {
    setIsEmailModalOpen(false);
    // Deny access only if no valid email was ever stored
    if (!localStorage.getItem('appUserEmail')) {
        setIsAccessDenied(true);
    }
    setIsLoading(false);
    console.log('Email prompt cancelled by user.');
  };

  const buttons = [
    { id: 1, label: 'Hovedbygning' },
    { id: 2, label: 'MEB' },
    { id: 3, label: 'GSB' },
    { id: 4, label: 'Anneks' },
    { id: 5, label: 'Musik' },
    { id: 6, label: 'New gym' },
  ];

  const handleButtonClick = (buttonLabel) => {
    if (!userId || !userEmail) {
      console.error('User ID or email not found.');
      return;
    }

    setConfirmationModalMessage(`Are you sure you want to activate ${buttonLabel}?`);
    setCurrentButtonAction(() => async () => {
      console.log(`Button ${buttonLabel} pressed. Sending data...`);
      const eventData = {
        userId,
        userEmail: userEmail,
        button: buttonLabel,
        timestamp: new Date().toISOString(),
      };

      // Only send to your backend, not directly to external URL
      try {
        const response = await fetch('/api/trackEvent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(eventData),
        });
        if (response.ok) {
          const result = await response.json();
          console.log('Tracking data sent successfully:', result);
        } else {
          console.error('Failed to send tracking data:', response.status, await response.text());
        }
      } catch (error) {
        console.error('Error sending tracking data:', error);
      }
      setIsConfirmationModalOpen(false);
    });
    setIsConfirmationModalOpen(true);
  };

  const handleConfirm = () => {
    if (currentButtonAction) {
      currentButtonAction();
    }
  };

  const handleCancel = () => {
    setIsConfirmationModalOpen(false);
    setCurrentButtonAction(null);
    console.log('Action cancelled.');
  };

  if (isLoading && !isEmailModalOpen) { // Show loading only if modal is not also trying to open
    return <div className="status-message">Loading...</div>;
  }

  // Render Modal if needed, it will overlay anything else or be the first thing shown
  if (isEmailModalOpen) {
    return (
      <EmailPromptModal 
        isOpen={isEmailModalOpen} 
        onSubmit={handleModalSubmit} 
        onCancel={handleModalCancel} 
      />
    );
  }

  if (isAccessDenied) {
    return (
      <div className="status-message">
        Access to the application requires a valid email address. 
        Please refresh the page and enter your email to continue.
      </div>
    );
  }

  return (
    <div className="app-container">
      <img src={imageUrl} alt="App Header" className="app-header-image" />
      {userEmail && <p className="welcome-message">Welcome, {userEmail} (ID: {userId})</p>}
      <div className="button-grid">
        {buttons.map(button => (
          <button 
            key={button.id} 
            className="grid-button" 
            onClick={() => handleButtonClick(button.label)}
          >
            {button.label}
          </button>
        ))}
      </div>
      <ConfirmationModal 
        isOpen={isConfirmationModalOpen}
        message={confirmationModalMessage}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </div>
  );
}

export default App;
