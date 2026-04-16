import React from 'react';
import '../styles/PauseMenu.css';

function PauseMenu({ onResume, onRestart, onMainMenu }) {
  return (
    <div className="pause-overlay">
      <div className="pause-container">
        <h1 className="pause-title">PAUSED</h1>
        
        <div className="pause-buttons">
          <button className="pause-button resume" onClick={onResume}>
            Resume
          </button>
          <button className="pause-button restart" onClick={onRestart}>
            Restart
          </button>
          <button className="pause-button menu" onClick={onMainMenu}>
            Main Menu
          </button>
        </div>
      </div>
    </div>
  );
}

export default PauseMenu;
