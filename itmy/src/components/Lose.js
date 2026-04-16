import React from 'react';
import '../styles/Lose.css';

function Lose({ onRestart, onMainMenu }) {
  return (
    <div className="lose-screen">
      <div className="lose-container">
        <h1 className="lose-title">Game Over</h1>
        <p className="lose-message">The glaciers melted. Try again!</p>

        <div className="button-group">
          <button className="lose-button" onClick={onRestart}>
            Play Again
          </button>
          <button className="lose-button secondary" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default Lose;
