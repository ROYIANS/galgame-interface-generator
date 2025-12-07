/**
 * IndexedDB 工具函数
 * 用于存储大型二进制文件（如图片Blob）
 */

const DB_NAME = 'GalgameDB';
const DB_VERSION = 1;
const STORE_IMAGES = 'images';
const STORE_SCREENSHOTS = 'screenshots';

/**
 * 打开 IndexedDB 数据库
 */
const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      // 创建图片存储（用于场景背景）
      if (!db.objectStoreNames.contains(STORE_IMAGES)) {
        db.createObjectStore(STORE_IMAGES, { keyPath: 'id' });
      }

      // 创建截图存储
      if (!db.objectStoreNames.contains(STORE_SCREENSHOTS)) {
        db.createObjectStore(STORE_SCREENSHOTS, { keyPath: 'id' });
      }
    };
  });
};

/**
 * 将 Data URL 转换为 Blob
 */
const dataURLToBlob = (dataURL) => {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)[1];
  const bstr = atob(parts[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
};

/**
 * 将 Blob 转换为 Data URL
 */
const blobToDataURL = (blob) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

/**
 * 保存图片到 IndexedDB
 * @param {string} id - 图片唯一标识
 * @param {string} dataURL - base64编码的图片或blob URL
 * @returns {Promise<string>} 返回图片ID
 */
export const saveImage = async (id, dataURL) => {
  const db = await openDB();

  // 如果是 data URL，转换为 Blob
  let blob;
  if (dataURL.startsWith('data:')) {
    blob = dataURLToBlob(dataURL);
  } else if (dataURL.startsWith('blob:')) {
    // 如果是 blob URL，先获取 blob
    const response = await fetch(dataURL);
    blob = await response.blob();
  } else {
    // 如果是普通 URL，直接存储 URL
    const transaction = db.transaction([STORE_IMAGES], 'readwrite');
    const store = transaction.objectStore(STORE_IMAGES);
    await store.put({ id, url: dataURL, type: 'url' });
    return id;
  }

  const transaction = db.transaction([STORE_IMAGES], 'readwrite');
  const store = transaction.objectStore(STORE_IMAGES);

  await store.put({
    id,
    blob,
    type: 'blob',
    timestamp: Date.now()
  });

  return id;
};

/**
 * 获取图片从 IndexedDB
 * @param {string} id - 图片ID
 * @returns {Promise<string|null>} 返回 data URL 或 null
 */
export const getImage = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_IMAGES], 'readonly');
  const store = transaction.objectStore(STORE_IMAGES);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = async () => {
      const result = request.result;
      if (!result) {
        resolve(null);
        return;
      }

      if (result.type === 'url') {
        resolve(result.url);
      } else if (result.type === 'blob') {
        const dataURL = await blobToDataURL(result.blob);
        resolve(dataURL);
      } else {
        resolve(null);
      }
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * 删除图片从 IndexedDB
 */
export const deleteImage = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_IMAGES], 'readwrite');
  const store = transaction.objectStore(STORE_IMAGES);
  await store.delete(id);
};

/**
 * 保存截图到 IndexedDB
 */
export const saveScreenshot = async (id, blob) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_SCREENSHOTS], 'readwrite');
  const store = transaction.objectStore(STORE_SCREENSHOTS);

  await store.put({
    id,
    blob,
    timestamp: Date.now()
  });

  return id;
};

/**
 * 获取截图从 IndexedDB
 */
export const getScreenshot = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_SCREENSHOTS], 'readonly');
  const store = transaction.objectStore(STORE_SCREENSHOTS);

  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = async () => {
      const result = request.result;
      if (!result || !result.blob) {
        resolve(null);
        return;
      }
      const dataURL = await blobToDataURL(result.blob);
      resolve(dataURL);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * 获取所有截图
 */
export const getAllScreenshots = async () => {
  const db = await openDB();
  const transaction = db.transaction([STORE_SCREENSHOTS], 'readonly');
  const store = transaction.objectStore(STORE_SCREENSHOTS);

  return new Promise((resolve, reject) => {
    const request = store.getAll();
    request.onsuccess = async () => {
      const results = request.result;
      const screenshots = await Promise.all(
        results.map(async (item) => ({
          id: item.id,
          url: await blobToDataURL(item.blob),
          timestamp: item.timestamp
        }))
      );
      resolve(screenshots);
    };
    request.onerror = () => reject(request.error);
  });
};

/**
 * 删除截图
 */
export const deleteScreenshot = async (id) => {
  const db = await openDB();
  const transaction = db.transaction([STORE_SCREENSHOTS], 'readwrite');
  const store = transaction.objectStore(STORE_SCREENSHOTS);
  await store.delete(id);
};

/**
 * 清空所有数据（用于调试）
 */
export const clearAllData = async () => {
  const db = await openDB();

  const imageTransaction = db.transaction([STORE_IMAGES], 'readwrite');
  await imageTransaction.objectStore(STORE_IMAGES).clear();

  const screenshotTransaction = db.transaction([STORE_SCREENSHOTS], 'readwrite');
  await screenshotTransaction.objectStore(STORE_SCREENSHOTS).clear();
};
