import React from 'react';
import {
    Play,
    FastForward,
    FileText,
    FolderOpen,
    Save,
    Settings,
    Edit,
    Volume2,
    VolumeX,
    Trophy
} from 'lucide-react';
import { useUISound } from '../../hooks/useUISound';
import styles from './ActionBar.module.css';

const ActionBar = ({ onConfig, onEdit, onCapture, onReplay, onToggleCRT, onShowLog, onLoadImage, onToggleMute, isMuted, onShowAchievements }) => {
    const iconSize = 18;
    const { playHoverSound } = useUISound();

    const actions = [
        { label: 'AUTO', icon: <Play size={iconSize} />, onClick: onReplay, title: 'Replay typewriter effect' },
        { label: 'SKIP', icon: <FastForward size={iconSize} />, onClick: onToggleCRT, title: 'Toggle CRT effect' },
        { label: 'LOG', icon: <FileText size={iconSize} />, onClick: onShowLog, title: 'View saved screenshots' },
        { label: 'LOAD', icon: <FolderOpen size={iconSize} />, onClick: onLoadImage, title: 'Load background image' },
        { label: 'SAVE', icon: <Save size={iconSize} />, onClick: onCapture, title: 'Save screenshot' },
    ];

    return (
        <div className={styles.actionBar}>
            {/* Game controls */}
            {actions.map((action) => (
                <button
                    key={action.label}
                    className={styles.actionBtn}
                    onClick={action.onClick}
                    onMouseEnter={playHoverSound}
                    title={action.title}
                >
                    <span className={styles.icon}>{action.icon}</span>
                    <span className={styles.label}>{action.label}</span>
                </button>
            ))}

            <div className={styles.divider}></div>

            {/* System controls */}
            <button
                className={styles.actionBtn}
                onClick={onEdit}
                onMouseEnter={playHoverSound}
                title="Edit content"
            >
                <span className={styles.icon}><Edit size={iconSize} /></span>
                <span className={styles.label}>EDIT</span>
            </button>

            <button
                className={styles.actionBtn}
                onClick={onConfig}
                onMouseEnter={playHoverSound}
                title="Configure AI settings"
            >
                <span className={styles.icon}><Settings size={iconSize} /></span>
                <span className={styles.label}>CONFIG</span>
            </button>

            <button
                className={styles.actionBtn}
                onClick={onToggleMute}
                onMouseEnter={playHoverSound}
                title={isMuted ? "Unmute background music" : "Mute background music"}
            >
                <span className={styles.icon}>
                    {isMuted ? <VolumeX size={iconSize} /> : <Volume2 size={iconSize} />}
                </span>
                <span className={styles.label}>{isMuted ? 'UNMUTE' : 'MUTE'}</span>
            </button>

            {onShowAchievements && (
                <button
                    className={`${styles.actionBtn} ${styles.achievementBtn}`}
                    onClick={onShowAchievements}
                    onMouseEnter={playHoverSound}
                    title="View achievements"
                >
                    <span className={styles.icon}><Trophy size={iconSize} /></span>
                    <span className={styles.label}>ACHIEVEMENTS</span>
                </button>
            )}
        </div>
    );
};

export default ActionBar;
