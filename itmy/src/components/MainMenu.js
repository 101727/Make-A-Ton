import React from 'react';
import '../styles/MainMenu.css';

function MainMenu({ onStart }) {
  const handleStartGame = () => {
    if (onStart) {
      onStart();
    }
  };

  return (
    <div className="main-menu">
      <div className="menu-screen">
        <div className="menu-container">
          <h1 className="game-title">Ice to Meet You</h1>
          <p className="game-subtitle">Save the World</p>
          
          <div className="menu-buttons">
            <button className="menu-btn start-btn" onClick={handleStartGame}>
              Start Game
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainMenu;
