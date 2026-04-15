import React from 'react';
import '../styles/Win.css';

function Win({ score = 20, onRestart }) {
  return (
    <div className="win-screen">
      <div className="win-container">
        <h1 className="win-title">You Won!</h1>
        <p className="win-message">Congratulations! You saved the glaciers!</p>
        
        <div className="score-display">
          <span className="final-score">{score}/20</span>
        </div>
        
        <button className="win-button" onClick={onRestart}>
          Main Menu
        </button>
      </div>
    </div>
  );
}

export default Win;
