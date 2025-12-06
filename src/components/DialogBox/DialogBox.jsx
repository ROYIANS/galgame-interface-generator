import React from 'react';
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
    onLoadImage
}) => {
    const displayedText = useTypewriter(text, typewriterSpeed, replayCounter);

    return (
        <div className={styles.wrapper}>
            <div className={styles.dialogContainer}>
                {/* Name tag on the left */}
                {name && (
                    <div className={styles.nameTag}>
                        {name}
                    </div>
                )}

                {/* Action Bar on the right */}
                <ActionBar
                    onConfig={onConfig}
                    onEdit={onEdit}
                    onCapture={onCapture}
                    onReplay={onReplay}
                    onToggleCRT={onToggleCRT}
                    onShowLog={onShowLog}
                    onLoadImage={onLoadImage}
                />

                <div className={styles.textBox}>
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
