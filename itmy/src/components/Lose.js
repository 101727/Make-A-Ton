import React from 'react';
import '../styles/Lose.css';

function Lose({ score = 0, onRestart }) {
  return (
    <div className="lose-screen">
      <div className="lose-container">
        <h1 className="lose-title">Game Over</h1>
        <p className="lose-message">The glaciers melted. Try again!</p>
        
        <div className="score-display">
          <span className="final-score">{score}/20</span>
        </div>
        
        <button className="lose-button" onClick={onRestart}>
          Retry
        </button>
      </div>
    </div>
  );
}

export default Lose;
