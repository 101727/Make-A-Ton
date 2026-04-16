import React from 'react';
import '../styles/Timer.css';

function Timer({ initialSeconds = 60 }) {
  const minutes = Math.floor(initialSeconds / 60);
  const seconds = Math.floor(initialSeconds % 60);
  const isWarning = initialSeconds < 30;

  return (
    <div className={`timer ${isWarning ? 'warning' : ''}`}>
      <span className="timer-text">
        {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
      </span>
    </div>
  );
}

export default Timer;
