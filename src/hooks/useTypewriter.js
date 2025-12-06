import { useState, useEffect } from 'react';

export const useTypewriter = (text, speed = 30, replay = 0) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    if (!text) {
      setDisplayedText('');
      return;
    }

    let i = 0;
    setDisplayedText(''); // Reset immediately

    // Show first character immediately to avoid jump
    // But for a smooth type effect we start at 0

    const intervalId = setInterval(() => {
      i++;
      setDisplayedText(text.slice(0, i));

      if (i > text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, replay]);

  return displayedText;
};
