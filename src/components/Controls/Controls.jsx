import React from 'react';
import { Sparkles, Palette, Lock, Save, List, X } from 'lucide-react';
import CharacterLibrary from '../CharacterLibrary/CharacterLibrary';
import SceneList from '../SceneList/SceneList';
import styles from './Controls.module.css';

const Controls = ({
    name,
    setName,
    text,
    setText,
    typewriterSpeed,
    setTypewriterSpeed,
    onImageUpload,
    onClearBackground,
    isGenerating,
    onAiText,
    onAiImage,
    // 角色库相关
    characters,
    onSaveCharacter,
    onSelectCharacter,
    onDeleteCharacter,
    // 多场景相关
    mode,
    scenes,
    currentSceneIndex,
    onModeToggle,
    onSelectScene,
    onAddScene,
    onDeleteScene,
    onMoveScene,
    getResolvedScene,
    inheritCharacter,
    inheritBackground,
    onToggleInheritCharacter,
    onToggleInheritBackground
}) => {
    const isAdvancedMode = mode === 'advanced';

    return (
        <div className={styles.controlsContainer}>
            {/* 隐私提示 */}
            <div className={styles.privacyNotice}>
                <Lock size={16} />
                <p>所有数据保存在浏览器本地，不会上传到服务器</p>
            </div>

            {/* 模式切换按钮 */}
            <div className={styles.modeToggle}>
                <button
                    onClick={onModeToggle}
                    className={`${styles.modeBtn} ${isAdvancedMode ? styles.activeMode : ''}`}
                    title={isAdvancedMode ? "切换到简单模式" : "切换到多轮对话模式"}
                >
                    <List size={16} />
                    {isAdvancedMode ? '多轮对话模式' : '单条对话模式'}
                </button>
                <span className={styles.modeHint}>
                    {isAdvancedMode ? '可编辑多个连续场景' : '点击切换到多轮对话'}
                </span>
            </div>

            {/* 高级模式：场景列表 */}
            {isAdvancedMode && scenes && (
                <SceneList
                    scenes={scenes}
                    currentSceneIndex={currentSceneIndex}
                    onSelectScene={onSelectScene}
                    onAddScene={onAddScene}
                    onDeleteScene={onDeleteScene}
                    onMoveScene={onMoveScene}
                    getResolvedScene={getResolvedScene}
                />
            )}

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
                    <label>
                        Character Name
                        {isAdvancedMode && currentSceneIndex > 0 && (
                            <label className={styles.inheritCheckbox}>
                                <input
                                    type="checkbox"
                                    checked={inheritCharacter}
                                    onChange={(e) => onToggleInheritCharacter(e.target.checked)}
                                />
                                继承上一场景
                            </label>
                        )}
                    </label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Protagonist"
                        disabled={isAdvancedMode && inheritCharacter}
                    />
                </div>
                <div className={styles.saveCharacterBtn}>
                    <button
                        onClick={() => onSaveCharacter && onSaveCharacter(name)}
                        disabled={!name || !name.trim() || (isAdvancedMode && inheritCharacter)}
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
                        title={isAdvancedMode ? "AI根据多场景上下文生成" : "AI Rewrite"}
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
                    {isAdvancedMode && currentSceneIndex > 0 && (
                        <label className={styles.inheritCheckbox}>
                            <input
                                type="checkbox"
                                checked={inheritBackground}
                                onChange={(e) => onToggleInheritBackground(e.target.checked)}
                            />
                            继承上一场景
                        </label>
                    )}
                    <button
                        className={styles.aiBtn}
                        onClick={onAiImage}
                        disabled={isGenerating || (isAdvancedMode && inheritBackground)}
                        title="Generate AI Background"
                    >
                        <Palette size={14} />
                        AI Generate
                    </button>
                    <button
                        className={styles.aiBtn}
                        onClick={onClearBackground}
                        disabled={isAdvancedMode && inheritBackground}
                        title="Clear Background (Black Screen)"
                        style={{ marginLeft: '5px', background: '#6c757d' }}
                    >
                        <X size={14} />
                        清空
                    </button>
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={onImageUpload}
                    className={styles.fileInput}
                    disabled={isAdvancedMode && inheritBackground}
                />
                <small className={styles.helpText}>图片仅保存在浏览器本地。</small>
            </div>
        </div>
    );
};

export default Controls;
