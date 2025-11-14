
import { useState, useEffect, useCallback } from 'react';
import type { KeysState } from '../types';

export const useKeyboardControls = () => {
  const [keys, setKeys] = useState<KeysState>({
    left: false,
    right: false,
    up: false,
  });

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        setKeys((k) => ({ ...k, left: true }));
        break;
      case 'ArrowRight':
      case 'd':
        setKeys((k) => ({ ...k, right: true }));
        break;
      case 'ArrowUp':
      case 'w':
      case ' ':
        setKeys((k) => ({ ...k, up: true }));
        break;
      default:
        break;
    }
  }, []);

  const handleKeyUp = useCallback((e: KeyboardEvent) => {
    e.preventDefault();
    switch (e.key) {
      case 'ArrowLeft':
      case 'a':
        setKeys((k) => ({ ...k, left: false }));
        break;
      case 'ArrowRight':
      case 'd':
        setKeys((k) => ({ ...k, right: false }));
        break;
      case 'ArrowUp':
      case 'w':
      case ' ':
        setKeys((k) => ({ ...k, up: false }));
        break;
      default:
        break;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [handleKeyDown, handleKeyUp]);

  return keys;
};
