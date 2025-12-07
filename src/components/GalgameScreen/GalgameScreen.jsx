import React, { forwardRef, useState, useEffect } from 'react';
import DialogBox from '../DialogBox/DialogBox';
import styles from './GalgameScreen.module.css';

const GalgameScreen = forwardRef(({
    backgroundImage,
    name,
    text,
    typewriterSpeed,
    replayCounter,
    onConfig,
    onEdit,
    onCapture,
    onReplay,
    onToggleCRT,
    onShowLog,
    onLoadImage,
    onToggleMute,
    isMuted,
    onShowAchievements,
    // 多场景相关
    mode,
    currentSceneIndex,
    totalScenes,
    onNextScene
}, ref) => {
    // 视差效果状态
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    useEffect(() => {
        const handleMouseMove = (e) => {
            // 计算鼠标位置相对于屏幕中心的偏移（-1 到 1）
            const x = (e.clientX / window.innerWidth - 0.5) * 2;
            const y = (e.clientY / window.innerHeight - 0.5) * 2;
            setMousePosition({ x, y });
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // 计算视差偏移（反向移动，放大倍数为20px）
    const parallaxX = -mousePosition.x * 20;
    const parallaxY = -mousePosition.y * 20;

    // 点击屏幕切换场景（仅在多场景模式下）
    const handleScreenClick = (e) => {
        // 如果是多场景模式且有切换函数
        if (mode === 'advanced' && onNextScene) {
            // 排除点击 DialogBox 内的按钮
            const isActionButton = e.target.closest('button');
            if (!isActionButton) {
                onNextScene();
            }
        }
    };

    return (
        <div
            className={styles.screenWrapper}
            ref={ref}
            onClick={handleScreenClick}
            style={{ cursor: mode === 'advanced' ? 'pointer' : 'default' }}
        >
            <div
                className={styles.backgroundLayer}
                style={backgroundImage ? {
                    backgroundImage: `url(${backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    transform: `translate(${parallaxX}px, ${parallaxY}px) scale(1.05)`,
                    transition: 'transform 0.3s ease-out'
                } : {}}
            />

            <DialogBox
                name={name}
                text={text}
                typewriterSpeed={typewriterSpeed}
                replayCounter={replayCounter}
                onConfig={onConfig}
                onEdit={onEdit}
                onCapture={onCapture}
                onReplay={onReplay}
                onToggleCRT={onToggleCRT}
                onShowLog={onShowLog}
                onLoadImage={onLoadImage}
                onToggleMute={onToggleMute}
                isMuted={isMuted}
                onShowAchievements={onShowAchievements}
                mode={mode}
                currentSceneIndex={currentSceneIndex}
                totalScenes={totalScenes}
            />
        </div>
    );
});

export default GalgameScreen;
