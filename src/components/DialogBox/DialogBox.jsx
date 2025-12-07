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
    onShowAchievements
}) => {
    const displayedText = useTypewriter(text, typewriterSpeed, replayCounter);
    const textBoxRef = useRef(null);

    // 打字机效果时自动滚动到底部
    useEffect(() => {
        if (textBoxRef.current) {
            textBoxRef.current.scrollTop = textBoxRef.current.scrollHeight;
        }
    }, [displayedText]);

    return (
        <div className={styles.wrapper}>
            <div className={styles.dialogContainer}>
                {/* Name tag on the left */}
                {name && (
                    <div className={styles.nameTag}>
                        {name}
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
