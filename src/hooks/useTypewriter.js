import { useState, useEffect, useRef } from 'react';
import { useDialogSound } from './useDialogSound';

export const useTypewriter = (text, speed = 30, replay = 0) => {
  const [displayedText, setDisplayedText] = useState('');
  const { playCharSound } = useDialogSound();
  const soundEnabledRef = useRef(true);

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
      const newText = text.slice(0, i);
      setDisplayedText(newText);

      // 播放音效（跳过空格和标点符号）
      const currentChar = text[i - 1];
      if (currentChar && soundEnabledRef.current) {
        const isNonSoundChar = /[\s.,!?;:，。！？；：、\n\r]/.test(currentChar);
        if (!isNonSoundChar) {
          // 根据字符位置计算音高变化，创造更自然的对话感
          const pitch = (i / text.length) * 0.3 + 0.35; // 0.35-0.65 范围
          playCharSound(pitch);
        }
      }

      if (i > text.length) {
        clearInterval(intervalId);
      }
    }, speed);

    return () => clearInterval(intervalId);
  }, [text, speed, replay, playCharSound]);

  return displayedText;
};
