import { useRef, useCallback } from 'react';

/**
 * 8-bit游戏对话音效Hook
 * 模拟经典Galgame/RPG游戏中的对话打字音效
 */
export const useDialogSound = () => {
  const audioContextRef = useRef(null);
  const isMutedRef = useRef(false);

  // 初始化 AudioContext（延迟创建，避免自动播放策略问题）
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
   * 播放单个字符音效
   * @param {number} pitch - 音高变化（0-1），用于创造音调变化
   */
  const playCharSound = useCallback((pitch = 0.5) => {
    if (isMutedRef.current) return;

    const ctx = getAudioContext();
    if (!ctx) return;

    // 恢复 AudioContext（如果被挂起）
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    try {
      // 创建振荡器（音调发生器）
      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // 8-bit 音效特征：方波（square wave）
      oscillator.type = 'square';

      // 基础频率 + 随机变化，模拟说话的音调变化
      // 基础频率范围: 400-800Hz（人声范围）
      const baseFreq = 500;
      const randomVariation = (Math.random() - 0.5) * 100; // ±50Hz 随机变化
      const pitchVariation = pitch * 200; // 根据字符位置的音高变化
      oscillator.frequency.setValueAtTime(
        baseFreq + randomVariation + pitchVariation,
        ctx.currentTime
      );

      // 音量包络：快速淡入淡出，模拟短促的"哔"声
      const attackTime = 0.01; // 10ms 淡入
      const releaseTime = 0.03; // 30ms 淡出
      const duration = 0.05; // 总共 50ms

      gainNode.gain.setValueAtTime(0, ctx.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.15, ctx.currentTime + attackTime); // 音量15%
      gainNode.gain.linearRampToValueAtTime(0, ctx.currentTime + duration);

      // 播放音效
      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + duration + releaseTime);

      // 自动清理
      oscillator.onended = () => {
        oscillator.disconnect();
        gainNode.disconnect();
      };
    } catch (error) {
      console.error('播放对话音效失败:', error);
    }
  }, [getAudioContext]);

  /**
   * 设置静音状态
   */
  const setMuted = useCallback((muted) => {
    isMutedRef.current = muted;
  }, []);

  return { playCharSound, setMuted };
};
