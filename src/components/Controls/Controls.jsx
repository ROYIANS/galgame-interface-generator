import React from 'react';
import { Sparkles, Palette, Lock, Save, List, X } from 'lucide-react';
import CharacterLibrary from '../CharacterLibrary/CharacterLibrary';
import SceneList from '../SceneList/SceneList';
import styles from './Controls.module.css';

const Controls = ({
    isOpen,
    onClose,
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
    if (!isOpen) return null;

    const isAdvancedMode = mode === 'advanced';

    return (
        <div className={styles.overlay}>
            <div className={styles.wrapper}>
                <button
                    onClick={onClose}
                    className={styles.closeBtn}
                    title="Close"
                >
                    <X size={20} />
                </button>

                <div className={styles.header}>
                    <h2>Scenario Editor</h2>
                </div>

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
                            <div className={styles.labelRow}>
                                <span className={styles.labelText}>Character Name</span>
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
                            </div>
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
                            <div className={styles.labelRow}>
                                <span className={styles.labelText}>Speed</span>
                            </div>
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
                        <div className={styles.labelRow}>
                            <span className={styles.labelText}>Dialogue</span>
                            <button
                                className={styles.aiBtn}
                                onClick={onAiText}
                                disabled={isGenerating}
                                title={isAdvancedMode ? "AI根据多场景上下文生成" : "AI Rewrite"}
                            >
                                <Sparkles size={14} />
                                AI Rewrite
                            </button>
                        </div>
                        <textarea
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            placeholder="Enter what you want to say..."
                            rows={3}
                        />
                    </div>

                    <div className={styles.inputGroup}>
                        <div className={styles.labelRow}>
                            <div className={styles.leftLabelGroup}>
                                <span className={styles.labelText}>Background</span>
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
                            </div>
                            <div className={styles.rightBtnGroup}>
                                <button
                                    className={styles.aiBtn}
                                    onClick={onAiImage}
                                    disabled={isGenerating || (isAdvancedMode && inheritBackground)}
                                    title="Generate AI Background"
                                >
                                    <Palette size={14} />
                                    Generate
                                </button>
                                <button
                                    className={styles.aiBtn}
                                    onClick={onClearBackground}
                                    disabled={isAdvancedMode && inheritBackground}
                                    title="Clear Background (Black Screen)"
                                    style={{ background: '#6c757d' }}
                                >
                                    <X size={14} />
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div
                            className={`${styles.dropZone} ${isAdvancedMode && inheritBackground ? styles.disabled : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.add(styles.dragActive);
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove(styles.dragActive);
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                e.currentTarget.classList.remove(styles.dragActive);
                                if (isAdvancedMode && inheritBackground) return;

                                const file = e.dataTransfer.files[0];
                                if (file && file.type.startsWith('image/')) {
                                    // Manually create a mock event for onImageUpload if it expects an event object
                                    const mockEvent = { target: { files: [file] } };
                                    onImageUpload(mockEvent);
                                }
                            }}
                            onClick={() => {
                                if (isAdvancedMode && inheritBackground) return;
                                document.getElementById('background-upload').click();
                            }}
                        >
                            <input
                                id="background-upload"
                                type="file"
                                accept="image/*"
                                onChange={onImageUpload}
                                className={styles.fileInput}
                                disabled={isAdvancedMode && inheritBackground}
                                style={{ display: 'none' }}
                            />
                            <div className={styles.dropContent}>
                                <div className={styles.uploadIcon}>
                                    <Palette size={24} />
                                </div>
                                <p>Click to Upload or Drag Image Here</p>
                                <small>Supported: JPG, PNG, WebP</small>
                            </div>
                        </div>
                        <small className={styles.helpText}>Pictures are saved locally in browser.</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Controls;
