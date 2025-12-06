import React, { useState, useRef, useEffect } from 'react';
import GalgameScreen from './components/GalgameScreen/GalgameScreen';
import Controls from './components/Controls/Controls';
import Settings from './components/Settings/Settings';
import CropModal from './components/CropModal/CropModal';
import LogModal from './components/LogModal/LogModal';
import { useAI } from './hooks/useAI';
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
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1200, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);

    gain.gain.setValueAtTime(0.5, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);

    osc.start();
    osc.stop(ctx.currentTime + 0.15);
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

      {/* Global CRT Overlay - NOT included in screenshot */}

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
        {/* CRT Overlay inside screenshot area */}
        {showCRT && (
          <div className="crt-overlay" style={{ pointerEvents: 'none', position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 999 }}></div>
        )}

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
