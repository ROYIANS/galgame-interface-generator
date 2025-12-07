import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'galgame_achievements';

// 成就定义
export const ACHIEVEMENTS = [
  {
    id: 'first_scene',
    title: '初次相遇',
    description: '创建第一个场景',
    iconName: 'Sparkles',
    condition: stats => stats.totalScenes >= 1
  },
  {
    id: 'save_5',
    title: '记录新手',
    description: '保存5张截图',
    iconName: 'Camera',
    condition: stats => stats.totalScreenshots >= 5
  },
  {
    id: 'save_10',
    title: '记录者',
    description: '保存10张截图',
    iconName: 'Camera',
    condition: stats => stats.totalScreenshots >= 10
  },
  {
    id: 'save_50',
    title: '截图大师',
    description: '保存50张截图',
    iconName: 'Video',
    condition: stats => stats.totalScreenshots >= 50
  },
  {
    id: 'use_ai',
    title: 'AI创作者',
    description: '首次使用AI生成',
    iconName: 'Bot',
    condition: stats => stats.aiGenerations >= 1
  },
  {
    id: 'ai_master',
    title: 'AI大师',
    description: '使用AI生成50次',
    iconName: 'Brain',
    condition: stats => stats.aiGenerations >= 50
  },
  {
    id: 'wordsmith',
    title: '话痨',
    description: '单段对话超过500字',
    iconName: 'MessageSquare',
    condition: stats => stats.longestText >= 500
  },
  {
    id: 'novelist',
    title: '小说家',
    description: '单段对话超过1000字',
    iconName: 'BookOpen',
    condition: stats => stats.longestText >= 1000
  },
  {
    id: 'character_creator',
    title: '角色设计师',
    description: '创建3个角色',
    iconName: 'UserPlus',
    condition: stats => stats.charactersCreated >= 3
  },
  {
    id: 'character_master',
    title: '角色大师',
    description: '创建10个角色',
    iconName: 'Users',
    condition: stats => stats.charactersCreated >= 10
  },
  {
    id: 'daily_creator',
    title: '坚持创作',
    description: '连续3天创作',
    iconName: 'Flame',
    condition: stats => stats.consecutiveDays >= 3
  },
  {
    id: 'weekly_creator',
    title: '创作达人',
    description: '连续7天创作',
    iconName: 'Star',
    condition: stats => stats.consecutiveDays >= 7
  }
];

export const useAchievements = () => {
  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      unlocked: [],
      stats: {
        totalScenes: 0,
        totalScreenshots: 0,
        aiGenerations: 0,
        charactersCreated: 0,
        longestText: 0,
        consecutiveDays: 0
      },
      lastActiveDate: null,
      newlyUnlocked: [] // 新解锁的成就（用于显示通知）
    };
  });

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  // 更新统计数据
  const updateStats = useCallback((updates) => {
    setData(prev => {
      const newStats = { ...prev.stats, ...updates };

      // 更新连续天数
      const today = new Date().toDateString();
      if (prev.lastActiveDate !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const wasYesterday = prev.lastActiveDate === yesterday.toDateString();

        newStats.consecutiveDays = wasYesterday ? prev.stats.consecutiveDays + 1 : 1;
      }

      return {
        ...prev,
        stats: newStats,
        lastActiveDate: today
      };
    });
  }, []);

  // 检查并解锁成就
  const checkAchievements = useCallback(() => {
    setData(prev => {
      const newlyUnlocked = [];

      ACHIEVEMENTS.forEach(achievement => {
        if (!prev.unlocked.includes(achievement.id)) {
          if (achievement.condition(prev.stats)) {
            newlyUnlocked.push(achievement);
          }
        }
      });

      if (newlyUnlocked.length > 0) {
        return {
          ...prev,
          unlocked: [...prev.unlocked, ...newlyUnlocked.map(a => a.id)],
          newlyUnlocked: newlyUnlocked
        };
      }

      return prev;
    });
  }, []);

  // 清除新解锁通知
  const clearNewlyUnlocked = useCallback(() => {
    setData(prev => ({ ...prev, newlyUnlocked: [] }));
  }, []);

  // 获取成就进度
  const getAchievementProgress = useCallback((achievementId) => {
    const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
    if (!achievement) return 0;

    // 这是一个简化版本，可以根据具体成就类型返回更精确的进度
    if (data.unlocked.includes(achievementId)) {
      return 100;
    }

    // 根据成就类型计算进度
    if (achievementId.startsWith('save_')) {
      const target = parseInt(achievementId.split('_')[1]);
      return Math.min(100, (data.stats.totalScreenshots / target) * 100);
    }

    if (achievementId === 'character_creator') {
      return Math.min(100, (data.stats.charactersCreated / 3) * 100);
    }

    if (achievementId === 'character_master') {
      return Math.min(100, (data.stats.charactersCreated / 10) * 100);
    }

    if (achievementId === 'daily_creator') {
      return Math.min(100, (data.stats.consecutiveDays / 3) * 100);
    }

    if (achievementId === 'weekly_creator') {
      return Math.min(100, (data.stats.consecutiveDays / 7) * 100);
    }

    return 0;
  }, [data]);

  // 获取已解锁成就数量
  const getUnlockedCount = useCallback(() => {
    return data.unlocked.length;
  }, [data.unlocked]);

  // 获取总成就数量
  const getTotalCount = useCallback(() => {
    return ACHIEVEMENTS.length;
  }, []);

  return {
    stats: data.stats,
    unlocked: data.unlocked,
    newlyUnlocked: data.newlyUnlocked,
    updateStats,
    checkAchievements,
    clearNewlyUnlocked,
    getAchievementProgress,
    getUnlockedCount,
    getTotalCount
  };
};
