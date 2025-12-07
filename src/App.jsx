import React, { useState, useRef, useEffect } from 'react';
import GalgameScreen from './components/GalgameScreen/GalgameScreen';
import Controls from './components/Controls/Controls';
import Settings from './components/Settings/Settings';
import CropModal from './components/CropModal/CropModal';
import LogModal from './components/LogModal/LogModal';
import ActionBar from './components/ActionBar/ActionBar';
import AchievementPanel from './components/AchievementPanel/AchievementPanel';
import AchievementToast from './components/AchievementToast/AchievementToast';
import { useAI } from './hooks/useAI';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { useCharacters } from './hooks/useCharacters';
import { useAchievements } from './hooks/useAchievements';
import { useScenes } from './hooks/useScenes';
import { compressBase64Image } from './utils/imageCompression';
import { getAllScreenshots, saveScreenshot, deleteScreenshot } from './utils/indexedDB';
import html2canvas from 'html2canvas';

function App() {
  // 场景管理
  const {
    scenes,
    currentSceneIndex,
    mode,
    getCurrentScene,
    getCurrentResolvedScene,
    getResolvedScene,
    setMode,
    addScene,
    deleteScene,
    updateCurrentScene,
    setCurrentSceneIndex,
    moveScene,
    getAllScenesContext
  } = useScenes();

  // 从当前场景获取数据
  const currentScene = getCurrentScene();
  const resolvedScene = getCurrentResolvedScene();

  const [replayCounter, setReplayCounter] = useState(0);
  const [showCRT, setShowCRT] = useState(true);
  const [typewriterSpeed, setTypewriterSpeed] = useState(65);
  const [screenshots, setScreenshots] = useState([]);

  // 从 IndexedDB 加载截图
  useEffect(() => {
    const loadScreenshots = async () => {
      try {
        const savedScreenshots = await getAllScreenshots();
        setScreenshots(savedScreenshots);
      } catch (error) {
        console.error('Failed to load screenshots:', error);
      }
    };
    loadScreenshots();
  }, []);

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false); // Controls hidden by default
  const [showCropper, setShowCropper] = useState(false);
  const [showLog, setShowLog] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);

  // Cropping
  const [tempImage, setTempImage] = useState(null);

  const [config, setConfig] = useState(() => {
    const saved = localStorage.getItem('galgame_config');
    return saved ? JSON.parse(saved) : { apiKey: '', baseUrl: '', textModel: '', imageModel: '' };
  });

  const screenRef = useRef(null);
  const { generateText, generateImage, loading, error } = useAI();

  // Background music - 使用 public 目录下的文件
  const { isMuted, toggleMute } = useBackgroundMusic('/bgm.mp3');

  // 角色管理
  const {
    characters,
    addCharacter,
    deleteCharacter,
    updateCharacterUsage,
    getSortedCharacters
  } = useCharacters();

  // 成就系统
  const {
    stats,
    unlocked,
    newlyUnlocked,
    updateStats,
    checkAchievements,
    clearNewlyUnlocked,
    getAchievementProgress
  } = useAchievements();

  // Flash effect state
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    localStorage.setItem('galgame_config', JSON.stringify(config));
  }, [config]);

  // 当文本改变时，追踪最长文本
  useEffect(() => {
    const text = resolvedScene?.text || '';
    if (text && text.length > stats.longestText) {
      updateStats({ longestText: text.length });
    }
  }, [resolvedScene?.text, stats.longestText, updateStats]);

  // 追踪场景总数
  useEffect(() => {
    updateStats({ totalScenes: scenes.length });
  }, [scenes.length, updateStats]);

  // 追踪角色创建数
  useEffect(() => {
    updateStats({ charactersCreated: characters.length });
  }, [characters.length, updateStats]);

  // 检查成就解锁
  useEffect(() => {
    checkAchievements();
  }, [stats, checkAchievements]);

  const resizeImage = (url) => {
    // Optional: could enforce max size here if needed
    return url;
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setTempImage(url);
      setShowCropper(true);
    }
  };

  const handleLoadImageFromButton = () => {
    // Create a hidden file input and trigger click
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = (e) => handleImageUpload(e);
    input.click();
  };

  const handleCropComplete = (croppedUrl) => {
    updateCurrentScene({ background: croppedUrl, inheritBackground: false });
    setTempImage(null);
  };

  const handleClearBackground = () => {
    updateCurrentScene({ background: null, inheritBackground: false });
  };

  const handleAiText = async () => {
    // 只重写当前场景的文本
    const currentText = resolvedScene?.text || '';
    const newText = await generateText(currentText, config);
    if (newText) {
      updateCurrentScene({ text: newText, inheritText: false });
      // 追踪 AI 使用
      updateStats({ aiGenerations: stats.aiGenerations + 1 });
    }
  };

  const handleAiImage = async () => {
    // 只基于当前场景的文本生成图片
    const currentText = resolvedScene?.text || '';
    const url = await generateImage(currentText, config);
    if (url) {
      // 如果是base64图片（data:开头），压缩它
      let finalUrl = url;
      if (url.startsWith('data:')) {
        try {
          finalUrl = await compressBase64Image(url, 1024, 0.7);
          console.log('Image compressed. Original size:', url.length, 'Compressed size:', finalUrl.length);
        } catch (error) {
          console.error('Failed to compress image:', error);
          // 如果压缩失败，使用原图
        }
      }
      updateCurrentScene({ background: finalUrl, inheritBackground: false });
      // 追踪 AI 使用
      updateStats({ aiGenerations: stats.aiGenerations + 1 });
    }
  };

  const playShutterSound = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    const ctx = new AudioContext();

    // 模拟相机快门的多层声音效果
    // 第一部分：快门开启的"咔"声（高频噪音）
    const createNoiseBuffer = (duration) => {
      const bufferSize = ctx.sampleRate * duration;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      return buffer;
    };

    // 噪音1：快门打开（短促高频）
    const noise1 = ctx.createBufferSource();
    noise1.buffer = createNoiseBuffer(0.02);
    const noiseFilter1 = ctx.createBiquadFilter();
    noiseFilter1.type = 'highpass';
    noiseFilter1.frequency.setValueAtTime(2000, ctx.currentTime);
    const noiseGain1 = ctx.createGain();
    noiseGain1.gain.setValueAtTime(0.3, ctx.currentTime);
    noiseGain1.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.02);

    noise1.connect(noiseFilter1);
    noiseFilter1.connect(noiseGain1);
    noiseGain1.connect(ctx.destination);

    // 第二部分：机械"咔嚓"声（中频脉冲）
    const clickOsc = ctx.createOscillator();
    const clickGain = ctx.createGain();
    clickOsc.type = 'square';
    clickOsc.frequency.setValueAtTime(150, ctx.currentTime + 0.02);
    clickGain.gain.setValueAtTime(0, ctx.currentTime + 0.02);
    clickGain.gain.linearRampToValueAtTime(0.4, ctx.currentTime + 0.03);
    clickGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);

    clickOsc.connect(clickGain);
    clickGain.connect(ctx.destination);

    // 噪音2：快门关闭（更短的噪音）
    const noise2 = ctx.createBufferSource();
    noise2.buffer = createNoiseBuffer(0.015);
    const noiseFilter2 = ctx.createBiquadFilter();
    noiseFilter2.type = 'highpass';
    noiseFilter2.frequency.setValueAtTime(2500, ctx.currentTime + 0.08);
    const noiseGain2 = ctx.createGain();
    noiseGain2.gain.setValueAtTime(0.25, ctx.currentTime + 0.08);
    noiseGain2.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.095);

    noise2.connect(noiseFilter2);
    noiseFilter2.connect(noiseGain2);
    noiseGain2.connect(ctx.destination);

    // 第三部分：机械回弹的低频"咚"声
    const thumpOsc = ctx.createOscillator();
    const thumpGain = ctx.createGain();
    thumpOsc.type = 'sine';
    thumpOsc.frequency.setValueAtTime(80, ctx.currentTime + 0.1);
    thumpOsc.frequency.exponentialRampToValueAtTime(40, ctx.currentTime + 0.2);
    thumpGain.gain.setValueAtTime(0, ctx.currentTime + 0.1);
    thumpGain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + 0.11);
    thumpGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);

    thumpOsc.connect(thumpGain);
    thumpGain.connect(ctx.destination);

    // 播放所有音效
    const now = ctx.currentTime;
    noise1.start(now);
    noise1.stop(now + 0.02);

    clickOsc.start(now + 0.02);
    clickOsc.stop(now + 0.08);

    noise2.start(now + 0.08);
    noise2.stop(now + 0.095);

    thumpOsc.start(now + 0.1);
    thumpOsc.stop(now + 0.25);
  };

  const handleSave = async () => {
    // Trigger Effects
    setFlash(true);
    playShutterSound();
    setTimeout(() => setFlash(false), 200);

    if (screenRef.current) {
      try {
        const canvas = await html2canvas(screenRef.current, {
          useCORS: true,
          allowTaint: true,
          backgroundColor: null,
          scale: 2 // Higher resolution
        });

        canvas.toBlob(async (blob) => {
          if (blob) {
            // 下载到本地
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `galgame_${Date.now()}.png`;
            link.click();

            // 保存到 IndexedDB
            const screenshotId = Date.now();
            try {
              await saveScreenshot(screenshotId, blob);

              // 更新状态（添加临时 URL 用于立即显示）
              const newScreenshot = {
                id: screenshotId,
                url: url,
                timestamp: screenshotId
              };
              setScreenshots(prev => [newScreenshot, ...prev]);

              // 追踪截图数量
              updateStats({ totalScreenshots: screenshots.length + 1 });
            } catch (error) {
              console.error('Failed to save screenshot to IndexedDB:', error);
              alert('保存截图失败！');
            }
          }
        });
      } catch (err) {
        console.error("Screenshot failed", err);
        alert("Could not save image (CORS issues possible with AI images).");
      }
    }
  };

  const handleReplay = () => {
    setReplayCounter(prev => prev + 1);
  };

  const handleToggleCRT = () => {
    setShowCRT(prev => !prev);
  };

  const handleDeleteScreenshot = async (id) => {
    try {
      // 从 IndexedDB 删除
      await deleteScreenshot(id);

      // 更新状态
      setScreenshots(prev => {
        const updated = prev.filter(s => s.id !== id);
        const toDelete = prev.find(s => s.id === id);
        if (toDelete && toDelete.url.startsWith('blob:')) {
          URL.revokeObjectURL(toDelete.url);
        }
        return updated;
      });
    } catch (error) {
      console.error('Failed to delete screenshot:', error);
      alert('删除截图失败！');
    }
  };

  // 角色相关处理
  const handleSaveCharacter = (characterName) => {
    if (characterName && characterName.trim()) {
      addCharacter(characterName.trim());
    }
  };

  const handleSelectCharacter = (character) => {
    updateCurrentScene({ character: character.name, inheritCharacter: false });
    updateCharacterUsage(character.id);
  };

  const handleDeleteCharacter = (characterId) => {
    deleteCharacter(characterId);
  };

  // 场景数据更新处理
  const handleNameChange = (newName) => {
    updateCurrentScene({ character: newName, inheritCharacter: false });
  };

  const handleTextChange = (newText) => {
    updateCurrentScene({ text: newText, inheritText: false });
  };

  const handleModeToggle = () => {
    setMode(mode === 'simple' ? 'advanced' : 'simple');
  };

  const handleToggleInheritCharacter = (inherit) => {
    if (inherit) {
      updateCurrentScene({ character: null, inheritCharacter: true });
    } else {
      const previousScene = getResolvedScene(currentSceneIndex - 1);
      updateCurrentScene({
        character: previousScene?.character || '主角',
        inheritCharacter: false
      });
    }
  };

  const handleToggleInheritBackground = (inherit) => {
    if (inherit) {
      updateCurrentScene({ background: null, inheritBackground: true });
    } else {
      const previousScene = getResolvedScene(currentSceneIndex - 1);
      updateCurrentScene({
        background: previousScene?.background || null,
        inheritBackground: false
      });
    }
  };

  // 切换到下一个场景（循环）
  const handleNextScene = () => {
    if (mode === 'advanced' && scenes.length > 1) {
      const nextIndex = (currentSceneIndex + 1) % scenes.length;
      setCurrentSceneIndex(nextIndex);
      // 重放打字机效果
      setReplayCounter(prev => prev + 1);
    }
  };

  return (
    <div style={{
      height: '100vh',
      width: '100vw',
      background: '#000',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      overflow: 'hidden',
      position: 'relative'
    }}>

      {/* Mobile-only ActionBar - 固定在屏幕右上角 */}
      <div className="mobile-action-bar">
        <ActionBar
          onConfig={() => setShowSettings(true)}
          onEdit={() => setShowControls(true)}
          onCapture={handleSave}
          onReplay={handleReplay}
          onToggleCRT={handleToggleCRT}
          onShowLog={() => setShowLog(true)}
          onLoadImage={handleLoadImageFromButton}
          onToggleMute={toggleMute}
          isMuted={isMuted}
          onShowAchievements={() => setShowAchievements(true)}
        />
      </div>

      {/* Flash Overlay */}
      <div style={{
        position: 'absolute',
        top: 0, left: 0, width: '100%', height: '100%',
        backgroundColor: '#fff',
        opacity: flash ? 0.8 : 0,
        pointerEvents: 'none',
        zIndex: 1000,
        transition: 'opacity 0.2s ease-out'
      }}></div>

      {/* Main Game Screen - Fullscreen Concept */}
      <div
        ref={screenRef}
        style={{
          width: '100%',
          height: '100%',
          maxWidth: '100%',
          maxHeight: '100%',
          aspectRatio: '16/9',
          position: 'relative',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }}>
        {/* CRT Overlay inside screenshot area - 会被截图捕获 */}
        {showCRT && (
          <div className="crt-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999 }}></div>
        )}

        <GalgameScreen
          name={resolvedScene?.character || '主角'}
          text={resolvedScene?.text || ''}
          typewriterSpeed={typewriterSpeed}
          backgroundImage={resolvedScene?.background || ''}
          replayCounter={replayCounter}
          onConfig={() => setShowSettings(true)}
          onEdit={() => setShowControls(true)}
          onCapture={handleSave}
          onReplay={handleReplay}
          onToggleCRT={handleToggleCRT}
          onShowLog={() => setShowLog(true)}
          onLoadImage={handleLoadImageFromButton}
          onToggleMute={toggleMute}
          isMuted={isMuted}
          onShowAchievements={() => setShowAchievements(true)}
          mode={mode}
          currentSceneIndex={currentSceneIndex}
          totalScenes={scenes.length}
          onNextScene={handleNextScene}
        />
      </div>

      {/* Editor Modal (Controls) */}
      <Controls
        isOpen={showControls}
        onClose={() => setShowControls(false)}
        name={currentScene?.inheritCharacter ? '' : (currentScene?.character || '')}
        setName={handleNameChange}
        text={currentScene?.inheritText ? '' : (currentScene?.text || '')}
        setText={handleTextChange}
        typewriterSpeed={typewriterSpeed}
        setTypewriterSpeed={setTypewriterSpeed}
        onImageUpload={handleImageUpload}
        onClearBackground={handleClearBackground}
        isGenerating={loading}
        onAiText={handleAiText}
        onAiImage={handleAiImage}
        characters={getSortedCharacters()}
        onSaveCharacter={handleSaveCharacter}
        onSelectCharacter={handleSelectCharacter}
        onDeleteCharacter={handleDeleteCharacter}
        mode={mode}
        scenes={scenes}
        currentSceneIndex={currentSceneIndex}
        onModeToggle={handleModeToggle}
        onSelectScene={setCurrentSceneIndex}
        onAddScene={addScene}
        onDeleteScene={deleteScene}
        onMoveScene={moveScene}
        getResolvedScene={getResolvedScene}
        inheritCharacter={currentScene?.inheritCharacter || false}
        inheritBackground={currentScene?.inheritBackground || false}
        onToggleInheritCharacter={handleToggleInheritCharacter}
        onToggleInheritBackground={handleToggleInheritBackground}
      />

      {error && <div style={{
        position: 'fixed', top: 10, left: 10,
        color: 'red', background: 'rgba(0,0,0,0.8)', padding: '10px', zIndex: 300
      }}>Error: {error}</div>}

      <Settings
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        config={config}
        setConfig={setConfig}
      />

      <CropModal
        isOpen={showCropper}
        imageSrc={tempImage}
        onClose={() => setShowCropper(false)}
        onCropComplete={handleCropComplete}
      />

      <LogModal
        isOpen={showLog}
        onClose={() => setShowLog(false)}
        screenshots={screenshots}
        onDelete={handleDeleteScreenshot}
      />

      <AchievementPanel
        isOpen={showAchievements}
        onClose={() => setShowAchievements(false)}
        unlocked={unlocked}
        stats={stats}
        getProgress={getAchievementProgress}
      />

      {newlyUnlocked && newlyUnlocked.length > 0 && (
        <AchievementToast
          achievements={newlyUnlocked}
          onDismiss={clearNewlyUnlocked}
        />
      )}
    </div>
  );
}

export default App;
