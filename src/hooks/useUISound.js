import { useRef, useCallback } from 'react';

/**
 * UI交互音效Hook
 * 提供按钮hover、点击等UI音效
 */
export const useUISound = () => {
  const audioContextRef = useRef(null);
  const lastHoverTimeRef = useRef(0);

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        audioContextRef.current = new AudioContext();
      }
    }
    return audioContextRef.current;
  }, []);

  /**
   * 播放按钮悬停音效
   * 8-bit风格的短促提示音
   */
  const playHoverSound = useCallback(() => {
    // 防抖：避免快速移动时连续触发
    const now = Date.now();
    if (now - lastHoverTimeRef.current < 50) {
      return;
    }
    lastHoverTimeRef.current = now;

    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 8-bit风格：三角波，音色柔和但仍有电子感
      oscillator.type = 'triangle';

      // 快速上升的音调：600Hz -> 900Hz
      const startFreq = 600;
      const endFreq = 900;
      oscillator.frequency.setValueAtTime(startFreq, ctx.currentTime);
      oscillator.frequency.exponentialRampToValueAtTime(endFreq, ctx.currentTime + 0.05);

      // 音量包络：快速淡入淡出
      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.08, ctx.currentTime + 0.01); // 音量8%，很轻柔
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.06);

      const duration = 0.06; // 60ms，非常短促

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration);

      // 清理
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('播放hover音效失败:', error);
    }
  }, [getAudioContext]);

  /**
   * 播放按钮点击音效（可选，如果未来需要）
   */
  const playClickSound = useCallback(() => {
    const ctx = getAudioContext();
    if (!ctx) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      oscillator.type = 'square';
      oscillator.frequency.setValueAtTime(800, ctx.currentTime);

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.08);

      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('播放click音效失败:', error);
    }
  }, [getAudioContext]);

  return { playHoverSound, playClickSound };
};
