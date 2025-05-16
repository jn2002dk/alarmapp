import { useState, useEffect } from 'react'; // Added useEffect
import './App.css';
import appLogo from './assets/logo.png';

function App() {
  const imageUrl = appLogo;
  const [userId, setUserId] = useState(null);
  const [userName, setUserName] = useState(null);

  useEffect(() => {
    let storedUserId = localStorage.getItem('appUserId');
    let storedUserName = localStorage.getItem('appUserName');

    if (!storedUserId) {
      storedUserId = crypto.randomUUID();
      localStorage.setItem('appUserId', storedUserId);
      
      if (!storedUserName) {
        const name = window.prompt('Welcome! Please enter your name:');
        if (name) {
          storedUserName = name;
          localStorage.setItem('appUserName', storedUserName);
        } else {
          storedUserName = 'Anonymous';
          localStorage.setItem('appUserName', storedUserName);
        }
      }
    }

    if (!storedUserName) {
      storedUserName = localStorage.getItem('appUserName');
      if (!storedUserName) {
        const name = window.prompt('Welcome! Please enter your name:');
        if (name) {
          storedUserName = name;
          localStorage.setItem('appUserName', storedUserName);
        } else {
          storedUserName = 'Anonymous';
          localStorage.setItem('appUserName', storedUserName);
        }
      }
    }

    setUserId(storedUserId);
    setUserName(storedUserName);

    console.log(`User Initialized: ID - ${storedUserId}, Name - ${storedUserName}`);
  }, []);

  const buttons = [
    { id: 1, label: 'Button 1' },
    { id: 2, label: 'Button 2' },
    { id: 3, label: 'Button 3' },
    { id: 4, label: 'Button 4' },
    { id: 5, label: 'Button 5' },
    { id: 6, label: 'Button 6' },
  ];

  const handleButtonClick = async (buttonLabel) => {
    if (userId && userName) {
      const eventData = {
        userId,
        userName,
        button: buttonLabel,
        timestamp: new Date().toISOString(),
      };
      console.log(`Button Clicked: ${buttonLabel}, User ID: ${userId}, User Name: ${userName}`);

      try {
        const response = await fetch('/api/trackEvent', { // Vercel will route this to your function
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
      console.log('User ID or Name not available yet for tracking.');
    }
  };

  return (
    <div className="app-container">
      <img src={imageUrl} alt="App Header" className="app-header-image" />
      {userName && <p className="welcome-message">Welcome, {userName} (ID: {userId})</p>}
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
