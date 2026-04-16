import React from 'react';
import '../styles/GameScreen.css';
import Timer from './Timer';
import Score from './Score';

function GameScreen({
  timeLeft,
  fullBoxes,
  totalBoxes,
  canvasRef,
  canvasWidth,
  canvasHeight,
  onCanvasClick,
  onStop,
}) {
  return (
    <div className="game-screen">
      <button className="game-button" onClick={onStop}>
        Stop
      </button>

      <div className="game-container">
        <h1 className="game-title">Ice To Meet You</h1>
        
        <div className="game-stats">
          <div className="stat-item">
            <Timer initialSeconds={Math.ceil(timeLeft)} />
          </div>
          <div className="stat-item">
            <Score initialScore={fullBoxes} />
          </div>
        </div>

        <canvas
          ref={canvasRef}
          className="game-canvas"
          width={canvasWidth}
          height={canvasHeight}
          onClick={onCanvasClick}
        />
      </div>
    </div>
  );
}

export default GameScreen;
