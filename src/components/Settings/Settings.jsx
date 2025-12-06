import React from 'react';
import { Settings as SettingsIcon, Lock } from 'lucide-react';
import styles from './Settings.module.css';

const Settings = ({
    isOpen,
    onClose,
    config,
    setConfig
}) => {
    if (!isOpen) return null;

    const handleChange = (e) => {
        const { name, value } = e.target;
        setConfig(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <SettingsIcon size={24} className={styles.icon} />
                    <h2>Configuration</h2>
                </div>

                {/* 隐私提示 */}
                <div className={styles.privacyNotice}>
                    <Lock size={14} />
                    <p>API配置保存在浏览器本地（localStorage），不会上传到服务器</p>
                </div>

                <div className={styles.field}>
                    <label>API Base URL</label>
                    <input
                        type="text"
                        name="baseUrl"
                        value={config.baseUrl}
                        onChange={handleChange}
                        placeholder="https://api.openai.com/v1"
                    />
                    <small>Optional. Defaults to OpenAI.</small>
                </div>

                <div className={styles.field}>
                    <label>API Key</label>
                    <input
                        type="password"
                        name="apiKey"
                        value={config.apiKey}
                        onChange={handleChange}
                        placeholder="sk-..."
                    />
                </div>

                <div className={styles.field}>
                    <label>Text Model</label>
                    <input
                        type="text"
                        name="textModel"
                        value={config.textModel}
                        onChange={handleChange}
                        placeholder="gpt-3.5-turbo"
                    />
                </div>

                <div className={styles.field}>
                    <label>Image Model</label>
                    <input
                        type="text"
                        name="imageModel"
                        value={config.imageModel}
                        onChange={handleChange}
                        placeholder="dall-e-3"
                    />
                </div>

                <div className={styles.actions}>
                    <button onClick={onClose}>Close</button>
                </div>
            </div>
        </div>
    );
};

export default Settings;
