import { useState, useEffect } from 'react';
import { getImage } from '../utils/indexedDB';

/**
 * Hook to resolve scene background images from IndexedDB
 * @param {Object} scene - The scene object
 * @returns {Object} Scene with resolved background
 */
export const useResolvedBackground = (scene) => {
  const [resolvedBackground, setResolvedBackground] = useState(scene?.background);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const loadBackground = async () => {
      if (!scene?.background) {
        setResolvedBackground(null);
        return;
      }

      // 如果是 IndexedDB 引用
      if (scene.background.startsWith('idb://')) {
        setLoading(true);
        const imageId = scene.background.replace('idb://', '');
        try {
          const imageData = await getImage(imageId);
          setResolvedBackground(imageData || scene.background);
        } catch (error) {
          console.error('Failed to load image from IndexedDB:', error);
          setResolvedBackground(scene.background);
        } finally {
          setLoading(false);
        }
      } else {
        setResolvedBackground(scene.background);
      }
    };

    loadBackground();
  }, [scene?.background]);

  return { background: resolvedBackground, loading };
};
