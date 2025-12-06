import React from 'react';
import { Sparkles, Palette } from 'lucide-react';
import styles from './Controls.module.css';

const Controls = ({
    name,
    setName,
    text,
    setText,
    typewriterSpeed,
    setTypewriterSpeed,
    onImageUpload,
    isGenerating,
    onAiText,
    onAiImage
}) => {
    return (
        <div className={styles.controlsContainer}>
            <div className={styles.row}>
                <div className={styles.inputGroup}>
                    <label>Character Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Protagonist"
                    />
                </div>

                <div className={styles.inputGroup}>
                    <label>Typewriter Speed (ms/char)</label>
                    <input
                        type="number"
                        value={typewriterSpeed}
                        onChange={(e) => setTypewriterSpeed(Number(e.target.value))}
                        min="10"
                        max="200"
                        step="5"
                    />
                </div>
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Dialogue
                    <button
                        className={styles.aiBtn}
                        onClick={onAiText}
                        disabled={isGenerating}
                        title="AI Rewrite (or generate random if empty)"
                    >
                        <Sparkles size={14} />
                        AI Rewrite
                    </button>
                </label>
                <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Enter what you want to say..."
                    rows={3}
                />
            </div>

            <div className={styles.inputGroup}>
                <label>
                    Background
                    <button
                        className={styles.aiBtn}
                        onClick={onAiImage}
                        disabled={isGenerating}
                        title="Generate AI Background"
                    >
                        <Palette size={14} />
                        AI Generate
                    </button>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className={styles.fileInput}
                />
            </div>
        </div>
    );
};

export default Controls;
