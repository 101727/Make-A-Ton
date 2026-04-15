import React, { useEffect, useState } from 'react';
import '../styles/Score.css';

function Score({ initialScore = 0 }) {
  const [score, setScore] = useState(initialScore);
  const maxScore = 20;

  useEffect(() => {
    setScore(initialScore);
  }, [initialScore]);

  return (
    <div className="score-container">
      <span className="score-text">Score:</span>
      <span className="score-value">{score}/{maxScore}</span>
    </div>
  );
}

export default Score;
