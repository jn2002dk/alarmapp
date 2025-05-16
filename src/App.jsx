import { useState, useEffect } from 'react';
import './App.css';
import appLogo from './assets/logo.png';

// Simple email validation regex
const EMAIL_REGEX = /\S+@\S+\.\S+/;

function App() {
  const imageUrl = appLogo;
  const [userId, setUserId] = useState(null);
  const [userEmail, setUserEmail] = useState(null); // Stores the validated email
  const [isLoading, setIsLoading] = useState(true);
  const [isAccessDenied, setIsAccessDenied] = useState(false);

  useEffect(() => {
    const initializeUser = () => {
      let storedUserId = localStorage.getItem('appUserId');
      let storedUserEmail = localStorage.getItem('appUserEmail');

      const promptForEmail = () => {
        let emailInput = null;
        let isValid = false;
        while (!isValid) {
          emailInput = window.prompt('Welcome! To use this application, please enter your email address:');
          if (emailInput === null) { // User pressed Cancel
            return null; // Indicate cancellation
          }
          if (emailInput.trim() === '') {
            alert('Email address cannot be empty. Please enter a valid email or press Cancel.');
          } else if (EMAIL_REGEX.test(emailInput)) {
            isValid = true;
          } else {
            alert('Invalid email format. Please enter a valid email address (e.g., user@example.com) or press Cancel.');
          }
        }
        return emailInput;
      };

      if (!storedUserId) {
        storedUserId = crypto.randomUUID();
        localStorage.setItem('appUserId', storedUserId);
        // New user, so email must be prompted
        storedUserEmail = promptForEmail();
        if (storedUserEmail === null) {
          setIsAccessDenied(true);
          setIsLoading(false);
          return; // Stop further processing
        }
        localStorage.setItem('appUserEmail', storedUserEmail);
      } else {
        // User ID exists, check if email exists and is valid
        // If storedUserEmail is null, empty, or "Anonymous" (from a previous version), re-prompt.
        if (!storedUserEmail || storedUserEmail === 'Anonymous' || !EMAIL_REGEX.test(storedUserEmail)) {
          storedUserEmail = promptForEmail();
          if (storedUserEmail === null) {
            setIsAccessDenied(true);
            setIsLoading(false);
            return; // Stop further processing
          }
          localStorage.setItem('appUserEmail', storedUserEmail);
        }
      }

      setUserId(storedUserId);
      setUserEmail(storedUserEmail);
      setIsAccessDenied(false); // Access granted
      setIsLoading(false);
      console.log(`User Initialized: ID - ${storedUserId}, Email - ${storedUserEmail}`);
    };

    initializeUser();
  }, []); // Empty dependency array ensures this runs only once on mount

  const buttons = [
    { id: 1, label: 'Button 1' },
    { id: 2, label: 'Button 2' },
    { id: 3, label: 'Button 3' },
    { id: 4, label: 'Button 4' },
    { id: 5, label: 'Button 5' },
    { id: 6, label: 'Button 6' },
  ];

  const handleButtonClick = async (buttonLabel) => {
    if (userId && userEmail && !isAccessDenied) {
      const eventData = {
        userId,
        userEmail: userEmail,
        button: buttonLabel,
        timestamp: new Date().toISOString(),
      };
      console.log(`Button Clicked: ${buttonLabel}, User ID: ${userId}, User Email: ${userEmail}`);

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
    } else {
      console.log('User ID, Email not available, or access denied. Cannot track event.');
    }
  };

  if (isLoading) {
    return <div className="status-message">Loading...</div>;
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
    </div>
  );
}

export default App;
