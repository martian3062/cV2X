import { useEffect } from 'react';
import { useStore } from '../store/useStore';

export const useKeyboard = () => {
  const setControls = useStore((state) => state.setControls);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls({ forward: true });
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls({ backward: true });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls({ left: true });
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls({ right: true });
          break;
        case 'Space':
          setControls({ brake: true });
          break;
        case 'KeyR':
          setControls({ reset: true });
          break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.code) {
        case 'KeyW':
        case 'ArrowUp':
          setControls({ forward: false });
          break;
        case 'KeyS':
        case 'ArrowDown':
          setControls({ backward: false });
          break;
        case 'KeyA':
        case 'ArrowLeft':
          setControls({ left: false });
          break;
        case 'KeyD':
        case 'ArrowRight':
          setControls({ right: false });
          break;
        case 'Space':
          setControls({ brake: false });
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [setControls]);
};
