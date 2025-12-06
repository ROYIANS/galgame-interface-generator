import React, { useState, useRef, useEffect } from 'react';
import GalgameScreen from './components/GalgameScreen/GalgameScreen';
import Controls from './components/Controls/Controls';
import Settings from './components/Settings/Settings';
import CropModal from './components/CropModal/CropModal';
import LogModal from './components/LogModal/LogModal';
import ActionBar from './components/ActionBar/ActionBar';
import { useAI } from './hooks/useAI';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import html2canvas from 'html2canvas';

function App() {
  const [name, setName] = useState('主角');
  const [text, setText] = useState('在期待某件事情的发生吗？');
  const [backgroundImage, setBackgroundImage] = useState('');
  const [replayCounter, setReplayCounter] = useState(0);
  const [showCRT, setShowCRT] = useState(true);
  const [typewriterSpeed, setTypewriterSpeed] = useState(65);
  const [screenshots, setScreenshots] = useState(() => {
    const saved = localStorage.getItem('galgame_screenshots');
    return saved ? JSON.parse(saved) : [];
  });

  // Modals
  const [showSettings, setShowSettings] = useState(false);
  const [showControls, setShowControls] = useState(false); // Controls hidden by default
  const [showCropper, setShowCropper] = useState(false);
  const [showLog, setShowLog] = useState(false);

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

  // Flash effect state
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    localStorage.setItem('galgame_config', JSON.stringify(config));
  }, [config]);

  useEffect(() => {
    localStorage.setItem('galgame_screenshots', JSON.stringify(screenshots));
  }, [screenshots]);

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
    setBackgroundImage(croppedUrl);
    setTempImage(null);
  };

  const handleAiText = async () => {
    const newText = await generateText(text, config);
    if (newText) setText(newText);
  };

  const handleAiImage = async () => {
    const url = await generateImage(text, config);
    if (url) setBackgroundImage(url);
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

        canvas.toBlob((blob) => {
          if (blob) {
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `galgame_${Date.now()}.png`;
            link.click();

            // Save to screenshots log
            const newScreenshot = {
              id: Date.now(),
              url: url,
              timestamp: Date.now()
            };
            setScreenshots(prev => [newScreenshot, ...prev]);
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

  const handleDeleteScreenshot = (id) => {
    setScreenshots(prev => {
      const updated = prev.filter(s => s.id !== id);
      const toDelete = prev.find(s => s.id === id);
      if (toDelete) {
        URL.revokeObjectURL(toDelete.url);
      }
      return updated;
    });
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

      {/* Global CRT Overlay - 覆盖整个屏幕，包括移动端ActionBar */}
      {showCRT && (
        <div className="crt-overlay" style={{
          pointerEvents: 'none',
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: 99999
        }}></div>
      )}

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
        <GalgameScreen
          name={name}
          text={text}
          typewriterSpeed={typewriterSpeed}
          backgroundImage={backgroundImage}
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
        />
      </div>

      {/* Editor Modal (Controls) */}
      {showControls && (
        <div style={{
          position: 'fixed',
          top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.4)',
          zIndex: 1100,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{ position: 'relative', width: '90%', maxWidth: '800px' }}>
            <button
              onClick={() => setShowControls(false)}
              style={{
                position: 'absolute',
                top: '-15px',
                right: '-10px',
                background: '#e74c3c',
                color: 'white',
                border: '2px solid #fff',
                zIndex: 201,
                cursor: 'pointer',
                padding: '5px 10px',
                borderRadius: '50%'
              }}
            >
              ✕
            </button>
            <Controls
              name={name}
              setName={setName}
              text={text}
              setText={setText}
              typewriterSpeed={typewriterSpeed}
              setTypewriterSpeed={setTypewriterSpeed}
              onImageUpload={handleImageUpload}
              isGenerating={loading}
              onAiText={handleAiText}
              onAiImage={handleAiImage}
            />
          </div>
        </div>
      )}

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
    </div>
  );
}

export default App;
