import React from 'react';
import {
    Play,
    FastForward,
    FileText,
    FolderOpen,
    Save,
    Settings,
    Edit
} from 'lucide-react';
import styles from './ActionBar.module.css';

const ActionBar = ({ onConfig, onEdit, onCapture, onReplay, onToggleCRT, onShowLog, onLoadImage }) => {
    const iconSize = 18;

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
                    title={action.title}
                >
                    <span className={styles.icon}>{action.icon}</span>
                    <span className={styles.label}>{action.label}</span>
                </button>
            ))}

            <div className={styles.divider}></div>

            {/* System controls */}
            <button className={styles.actionBtn} onClick={onEdit} title="Edit content">
                <span className={styles.icon}><Edit size={iconSize} /></span>
                <span className={styles.label}>EDIT</span>
            </button>

            <button className={styles.actionBtn} onClick={onConfig} title="Configure AI settings">
                <span className={styles.icon}><Settings size={iconSize} /></span>
                <span className={styles.label}>CONFIG</span>
            </button>
        </div>
    );
};

export default ActionBar;
