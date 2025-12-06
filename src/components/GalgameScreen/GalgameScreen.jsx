import React, { forwardRef } from 'react';
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
    onLoadImage
}, ref) => {
    return (
        <div className={styles.screenWrapper} ref={ref}>
            <div
                className={styles.backgroundLayer}
                style={backgroundImage ? { backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
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
            />
        </div>
    );
});

export default GalgameScreen;
