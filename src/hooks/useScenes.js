import { useState, useEffect, useCallback, useRef } from 'react';
import { saveImage, getImage, deleteImage } from '../utils/indexedDB';

const STORAGE_KEY = 'galgame_scenes';

export const useScenes = () => {
  // 图片缓存：idb://id -> data URL
  const imageCache = useRef({});

  const [data, setData] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
    return {
      scenes: [
        {
          id: `scene_${Date.now()}`,
          order: 0,
          character: '？？？',
          text: '在期待某件事情的发生吗？',
          background: null,
          inheritCharacter: false,
          inheritText: false,
          inheritBackground: false
        }
      ],
      currentSceneIndex: 0,
      mode: 'simple' // 'simple' | 'advanced'
    };
  });

  // 保存到 localStorage（场景数据，不包含大图片）
  // 背景图片单独存储到 IndexedDB
  useEffect(() => {
    const saveData = async () => {
      try {
        // 复制数据，将背景图片替换为ID引用
        const dataToSave = {
          ...data,
          scenes: await Promise.all(data.scenes.map(async (scene) => {
            if (scene.background && (scene.background.startsWith('data:') || scene.background.startsWith('blob:'))) {
              // 保存图片到 IndexedDB
              const imageId = `scene_bg_${scene.id}`;
              await saveImage(imageId, scene.background);
              return { ...scene, background: `idb://${imageId}` };
            }
            return scene;
          }))
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
      } catch (error) {
        if (error.name === 'QuotaExceededError') {
          console.error('LocalStorage quota exceeded. Data is too large to save.');
          alert('存储空间不足！');
        } else {
          console.error('Failed to save to localStorage:', error);
        }
      }
    };

    saveData();
  }, [data]);

  // 预加载所有 IndexedDB 图片到缓存
  useEffect(() => {
    const preloadImages = async () => {
      for (const scene of data.scenes) {
        if (scene.background && scene.background.startsWith('idb://')) {
          const cacheKey = scene.background;
          if (!imageCache.current[cacheKey]) {
            const imageId = scene.background.replace('idb://', '');
            try {
              const imageData = await getImage(imageId);
              if (imageData) {
                imageCache.current[cacheKey] = imageData;
              }
            } catch (error) {
              console.error('Failed to preload image:', error);
            }
          }
        }
      }
    };

    preloadImages();
  }, [data.scenes]);

  // 获取当前场景
  const getCurrentScene = useCallback(() => {
    return data.scenes[data.currentSceneIndex] || data.scenes[0];
  }, [data.scenes, data.currentSceneIndex]);

  // 获取场景的实际值（考虑继承）并从缓存加载图片
  const getResolvedScene = useCallback((sceneIndex) => {
    const scene = data.scenes[sceneIndex];
    if (!scene) return null;

    let resolvedCharacter = scene.character;
    let resolvedText = scene.text;
    let resolvedBackground = scene.background;

    // 向前查找继承的值
    if (scene.inheritCharacter || scene.character === null) {
      for (let i = sceneIndex - 1; i >= 0; i--) {
        if (data.scenes[i].character !== null) {
          resolvedCharacter = data.scenes[i].character;
          break;
        }
      }
    }

    if (scene.inheritText || scene.text === null) {
      for (let i = sceneIndex - 1; i >= 0; i--) {
        if (data.scenes[i].text !== null) {
          resolvedText = data.scenes[i].text;
          break;
        }
      }
    }

    if (scene.inheritBackground || scene.background === null) {
      for (let i = sceneIndex - 1; i >= 0; i--) {
        if (data.scenes[i].background !== null) {
          resolvedBackground = data.scenes[i].background;
          break;
        }
      }
    }

    // 如果背景是 IndexedDB 引用，从缓存加载
    if (resolvedBackground && resolvedBackground.startsWith('idb://')) {
      const cached = imageCache.current[resolvedBackground];
      if (cached) {
        resolvedBackground = cached;
      }
    }

    return {
      ...scene,
      character: resolvedCharacter,
      text: resolvedText,
      background: resolvedBackground
    };
  }, [data.scenes]);

  // 获取当前解析后的场景
  const getCurrentResolvedScene = useCallback(() => {
    return getResolvedScene(data.currentSceneIndex);
  }, [data.currentSceneIndex, getResolvedScene]);

  // 切换模式
  const setMode = useCallback((mode) => {
    setData(prev => ({ ...prev, mode }));
  }, []);

  // 添加新场景
  const addScene = useCallback(() => {
    setData(prev => {
      const newScene = {
        id: `scene_${Date.now()}`,
        order: prev.scenes.length,
        character: null,          // 默认继承
        text: '',
        background: null,         // 默认继承
        inheritCharacter: true,
        inheritText: false,
        inheritBackground: true
      };

      return {
        ...prev,
        scenes: [...prev.scenes, newScene],
        currentSceneIndex: prev.scenes.length // 切换到新场景
      };
    });
  }, []);

  // 删除场景
  const deleteScene = useCallback((sceneId) => {
    setData(prev => {
      const newScenes = prev.scenes.filter(s => s.id !== sceneId);

      // 至少保留一个场景
      if (newScenes.length === 0) {
        return {
          ...prev,
          scenes: [
            {
              id: `scene_${Date.now()}`,
              order: 0,
              character: '',
              text: '',
              background: null,
              inheritCharacter: false,
              inheritText: false,
              inheritBackground: false
            }
          ],
          currentSceneIndex: 0
        };
      }

      // 重新排序
      newScenes.forEach((scene, index) => {
        scene.order = index;
      });

      // 调整当前索引
      let newIndex = prev.currentSceneIndex;
      if (newIndex >= newScenes.length) {
        newIndex = newScenes.length - 1;
      }

      return {
        ...prev,
        scenes: newScenes,
        currentSceneIndex: newIndex
      };
    });
  }, []);

  // 更新场景
  const updateScene = useCallback((sceneId, updates) => {
    setData(prev => ({
      ...prev,
      scenes: prev.scenes.map(scene =>
        scene.id === sceneId ? { ...scene, ...updates } : scene
      )
    }));
  }, []);

  // 更新当前场景
  const updateCurrentScene = useCallback((updates) => {
    const currentScene = getCurrentScene();
    if (currentScene) {
      updateScene(currentScene.id, updates);
    }
  }, [getCurrentScene, updateScene]);

  // 切换当前场景
  const setCurrentSceneIndex = useCallback((index) => {
    setData(prev => ({
      ...prev,
      currentSceneIndex: Math.max(0, Math.min(index, prev.scenes.length - 1))
    }));
  }, []);

  // 移动场景顺序
  const moveScene = useCallback((fromIndex, toIndex) => {
    setData(prev => {
      const newScenes = [...prev.scenes];
      const [movedScene] = newScenes.splice(fromIndex, 1);
      newScenes.splice(toIndex, 0, movedScene);

      // 重新排序
      newScenes.forEach((scene, index) => {
        scene.order = index;
      });

      return {
        ...prev,
        scenes: newScenes,
        currentSceneIndex: toIndex
      };
    });
  }, []);

  // 获取所有场景的上下文（用于AI生成）
  const getAllScenesContext = useCallback(() => {
    return data.scenes.map((scene, index) => {
      const resolved = getResolvedScene(index);
      return `[场景${index + 1}] ${resolved.character}: ${resolved.text}`;
    }).join('\n');
  }, [data.scenes, getResolvedScene]);

  return {
    scenes: data.scenes,
    currentSceneIndex: data.currentSceneIndex,
    mode: data.mode,
    getCurrentScene,
    getCurrentResolvedScene,
    getResolvedScene,
    setMode,
    addScene,
    deleteScene,
    updateScene,
    updateCurrentScene,
    setCurrentSceneIndex,
    moveScene,
    getAllScenesContext
  };
};
