import { useCallback, useEffect, useRef } from 'react';
import gameMusic from '../Music/IceToMeetYou.mp3';
import shatterSfx from '../SFX/shatter.mp3';
import whooshSfx from '../SFX/whoosh.mp3';

export function useGameAudio() {
  const musicRef = useRef(null);
  const shatterRef = useRef(null);
  const whooshRef = useRef(null);

  useEffect(() => {
    const audio = new Audio(gameMusic);
    audio.preload = 'auto';
    musicRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(shatterSfx);
    audio.preload = 'auto';
    shatterRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  useEffect(() => {
    const audio = new Audio(whooshSfx);
    audio.preload = 'auto';
    whooshRef.current = audio;

    return () => {
      audio.pause();
      audio.currentTime = 0;
    };
  }, []);

  const playRoundMusic = useCallback(() => {
    if (!musicRef.current) {
      return;
    }

    musicRef.current.pause();
    musicRef.current.currentTime = 0;
    musicRef.current.play().catch(() => {});
  }, []);

  const playShatter = useCallback(() => {
    if (!shatterRef.current) {
      return;
    }

    const sfxInstance = shatterRef.current.cloneNode();
    sfxInstance.play().catch(() => {});
  }, []);

  const playNonVictoryEndAudio = useCallback(() => {
    if (musicRef.current) {
      musicRef.current.pause();
      musicRef.current.currentTime = 0;
    }

    if (whooshRef.current) {
      whooshRef.current.currentTime = 0;
      whooshRef.current.play().catch(() => {});
    }
  }, []);

  return {
    playRoundMusic,
    playShatter,
    playNonVictoryEndAudio,
  };
}
