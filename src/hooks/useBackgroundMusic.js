import { useEffect, useRef, useState } from 'react';

/**
 * 背景音乐播放Hook
 * @param {string} audioSrc - 音频文件路径
 * @returns {Object} - { isMuted, toggleMute }
 */
export const useBackgroundMusic = (audioSrc) => {
  const audioRef = useRef(null);
  const [isMuted, setIsMuted] = useState(() => {
    // 从localStorage读取静音状态，默认为 true（静音）
    const saved = localStorage.getItem('bgmMuted');
    return saved ? JSON.parse(saved) : true; // 改为默认静音
  });
  const [audioAvailable, setAudioAvailable] = useState(true);

  useEffect(() => {
    // 创建音频元素
    if (!audioRef.current) {
      audioRef.current = new Audio(audioSrc);
      audioRef.current.loop = true; // 无限循环
      audioRef.current.volume = 0.3; // 默认音量30%

      // 监听加载错误
      audioRef.current.addEventListener('error', (e) => {
        console.warn('背景音乐文件未找到或加载失败:', audioSrc);
        console.warn('应用将继续运行，但没有背景音乐。');
        console.warn('请在 src/assets/ 目录下放置 bgm.mp3 文件。');
        setAudioAvailable(false);
      });
    }

    // 尝试播放音乐
    const playAudio = async () => {
      if (!audioAvailable) return;

      try {
        if (!isMuted) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log('自动播放被阻止，等待用户交互:', error);
      }
    };

    playAudio();

    // 清理函数
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, [audioSrc, audioAvailable]);

  // 监听静音状态变化
  useEffect(() => {
    if (audioRef.current && audioAvailable) {
      if (isMuted) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(err => {
          console.log('播放失败:', err);
        });
      }
      // 保存到localStorage
      localStorage.setItem('bgmMuted', JSON.stringify(isMuted));
    }
  }, [isMuted, audioAvailable]);

  const toggleMute = () => {
    setIsMuted(prev => !prev);
  };

  return { isMuted, toggleMute };
};
