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

          <div className="game-description-box">
            <p className="game-description-text">
              Hey there, ice to meet you! In this game, the ice caps are melting as result of the warming climate. So, it's up to you to save the world before the floods take away our poor penguin! After clicking the start game button, you will see many ice caps in front of you. When one starts to melt, click on it to re-freeze it. Beware, the melting gets faster as time goes on.
            </p>
          </div>

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
