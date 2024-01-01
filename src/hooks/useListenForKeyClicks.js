import { useEffect } from 'preact/hooks';

function useListenForKeyClicks(callback) {
  useEffect(() => {
      const handleKeyDown = (event) => {
          if (event.metaKey && event.key === 'z') {
              if (event.shiftKey) {
                  // Command + Shift + Z
                  callback('redo');
              } else {
                  // Command + Z
                  callback('undo');
              }
          }
      };

      // Add the keydown event listener
      window.addEventListener('keydown', handleKeyDown);

      // Clean up the event listener
      return () => {
          window.removeEventListener('keydown', handleKeyDown);
      };
  }, [callback]);

  return null;
}

export default useListenForKeyClicks;
