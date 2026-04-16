import React from 'react';
import '../styles/Win.css';

function Win({ score = 20, onRestart, onMainMenu }) {
  return (
    <div className="win-screen">
      <div className="win-container">
        <h1 className="win-title">You Won!</h1>
        <p className="win-message">Congratulations! You saved the penguin!</p>
        
        <div className="score-display">
          <span className="final-score">{score}/20</span>
        </div>
        
        <div className="button-group">
          <button className="win-button" onClick={onRestart}>
            Play Again
          </button>
          <button className="win-button secondary" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default Win;
