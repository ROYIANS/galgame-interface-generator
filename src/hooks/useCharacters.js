import { useState, useEffect } from 'react';

const STORAGE_KEY = 'galgame_characters';

export const useCharacters = () => {
  const [characters, setCharacters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  // 保存到 localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
  }, [characters]);

  // 添加新角色
  const addCharacter = (name, avatar = null, color = null) => {
    if (!name || !name.trim()) return null;

    // 检查是否已存在
    const existing = characters.find(c => c.name === name.trim());
    if (existing) {
      // 如果已存在，更新头像（如果提供了新头像）并增加使用次数
      const updates = {
        usageCount: (existing.usageCount || 0) + 1
      };

      // 如果提供了新头像，更新头像
      if (avatar !== null && avatar !== undefined) {
        updates.avatar = avatar;
      }

      updateCharacter(existing.id, updates);
      return { ...existing, ...updates };
    }

    const newCharacter = {
      id: `char_${Date.now()}`,
      name: name.trim(),
      avatar: avatar,
      color: color || generateRandomColor(),
      createdAt: Date.now(),
      usageCount: 1
    };

    setCharacters(prev => [...prev, newCharacter]);
    return newCharacter;
  };

  // 删除角色
  const deleteCharacter = (id) => {
    setCharacters(prev => prev.filter(c => c.id !== id));
  };

  // 更新角色
  const updateCharacter = (id, updates) => {
    setCharacters(prev =>
      prev.map(c => c.id === id ? { ...c, ...updates } : c)
    );
  };

  // 增加使用次数
  const updateCharacterUsage = (id) => {
    setCharacters(prev =>
      prev.map(c => c.id === id ? { ...c, usageCount: (c.usageCount || 0) + 1 } : c)
    );
  };

  // 根据使用频率排序
  const getSortedCharacters = () => {
    return [...characters].sort((a, b) => {
      // 按使用次数降序
      return (b.usageCount || 0) - (a.usageCount || 0);
    });
  };

  return {
    characters,
    addCharacter,
    deleteCharacter,
    updateCharacter,
    updateCharacterUsage,
    getSortedCharacters
  };
};

// 生成随机颜色（温暖的动漫风格色调）
const generateRandomColor = () => {
  const colors = [
    '#ff6b9d', // 粉红
    '#c77dff', // 紫色
    '#4cc9f0', // 青色
    '#ffd60a', // 金黄
    '#ff9770', // 橙色
    '#6a994e', // 绿色
    '#ff5a5f', // 珊瑚红
    '#a663cc'  // 薰衣草紫
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};
