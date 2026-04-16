import React, { useState } from 'react';
import '../styles/MainMenu.css';
import { useGameAudio } from '../logic/useGameAudio';

function MainMenu({ onStart }) {
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { playPenguin } = useGameAudio();

  const handleStartGame = () => {
    if (onStart) {
      onStart();
    }
  };

  const handleHelpClick = () => {
    playPenguin();
    setIsHelpOpen(true);
  };

  return (
    <div className="main-menu">
      <div className="menu-screen">
        <button
          className="help-trigger"
          type="button"
          aria-label="How to play"
          onClick={handleHelpClick}
        >
          ?
        </button>

        <div className="menu-container">
          <h1 className="game-title">Ice to Meet You</h1>

          <div className="menu-buttons">
            <button className="menu-btn start-btn" onClick={handleStartGame}>
              Save the World
            </button>
          </div>
        </div>

        {isHelpOpen && (
          <div className="help-overlay" onClick={() => setIsHelpOpen(false)}>
            <div className="help-modal" onClick={(event) => event.stopPropagation()}>
              <button
                className="help-close-btn"
                type="button"
                aria-label="Close help"
                onClick={() => setIsHelpOpen(false)}
              >
                X
              </button>
              <h2 className="help-title">How To Play</h2>
              <p className="game-description-text">
                Hey there, ice to meet you! In this game, the ice caps are melting as result of the
                warming climate. So, it's up to you to save the world before the floods take away
                our poor penguin! After clicking the start game button, you will see many ice caps
                in front of you. When one starts to melt, click on it to re-freeze it. Beware, the
                melting gets faster as time goes on.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MainMenu;
