import React from 'react';
import { Sparkles, Palette, Lock, Save } from 'lucide-react';
import CharacterLibrary from '../CharacterLibrary/CharacterLibrary';
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
    onAiImage,
    // 角色库相关
    characters,
    onSaveCharacter,
    onSelectCharacter,
    onDeleteCharacter
}) => {
    return (
        <div className={styles.controlsContainer}>
            {/* 隐私提示 */}
            <div className={styles.privacyNotice}>
                <Lock size={16} />
                <p>所有数据保存在浏览器本地，不会上传到服务器</p>
            </div>

            {/* 角色库 */}
            {characters && characters.length > 0 && (
                <CharacterLibrary
                    characters={characters}
                    onSelectCharacter={onSelectCharacter}
                    onDeleteCharacter={onDeleteCharacter}
                />
            )}

            <div className={styles.row}>
                <div className={styles.inputGroup} style={{ flex: 1 }}>
                    <label>Character Name</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Protagonist"
                    />
                </div>
                <div className={styles.saveCharacterBtn}>
                    <button
                        onClick={() => onSaveCharacter && onSaveCharacter(name)}
                        disabled={!name || !name.trim()}
                        title="保存为常用角色"
                        className={styles.iconBtn}
                    >
                        <Save size={16} />
                        保存角色
                    </button>
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
                <small className={styles.helpText}>图片仅保存在浏览器本地。</small>
            </div>
        </div>
    );
};

export default Controls;
