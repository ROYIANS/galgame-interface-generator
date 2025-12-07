import React, { useRef, useEffect } from 'react';
import { useTypewriter } from '../../hooks/useTypewriter';
import ActionBar from '../ActionBar/ActionBar';
import styles from './DialogBox.module.css';

const DialogBox = ({
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
    mode,
    currentSceneIndex,
    totalScenes,
    characterAvatar // 新增：角色头像
}) => {
    const displayedText = useTypewriter(text, typewriterSpeed, replayCounter);
    const textBoxRef = useRef(null);

    // 打字机效果时自动滚动到底部
    useEffect(() => {
        if (textBoxRef.current) {
            textBoxRef.current.scrollTop = textBoxRef.current.scrollHeight;
        }
    }, [displayedText]);

    const isAdvancedMode = mode === 'advanced';
    const showSceneIndicator = isAdvancedMode && totalScenes > 1;

    return (
        <div className={styles.wrapper}>
            <div className={styles.dialogContainer}>
                {/* Avatar - 头像显示 */}
                {characterAvatar && (
                    <div className={styles.avatarContainer}>
                        <img src={characterAvatar} alt={name} className={styles.avatar} />
                    </div>
                )}

                {/* Name tag on the left */}
                {name && (
                    <div className={styles.nameTag}>
                        {name}
                    </div>
                )}

                {/* 场景指示器 */}
                {showSceneIndicator && (
                    <div className={styles.sceneIndicator}>
                        {currentSceneIndex + 1} / {totalScenes}
                    </div>
                )}

                {/* Action Bar on the right - PC端显示 */}
                <div className="desktop-action-bar">
                    <ActionBar
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
                    />
                </div>

                <div className={styles.textBox} ref={textBoxRef}>
                    <p className={styles.text}>{displayedText}</p>

                    {displayedText.length === text?.length && (
                        <div className={styles.nextCursor}>
                            <div className={styles.triangle}></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DialogBox;
