import React from 'react';
import { X, Download, Trash2, Lock } from 'lucide-react';
import styles from './LogModal.module.css';

const LogModal = ({ isOpen, onClose, screenshots, onDelete }) => {
    if (!isOpen) return null;

    return (
        <div className={styles.overlay} onClick={onClose}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
                <div className={styles.header}>
                    <h2>Screenshot Log</h2>
                    <button className={styles.closeBtn} onClick={onClose}>
                        <X size={24} />
                    </button>
                </div>

                {/* 隐私提示 */}
                <div className={styles.privacyNotice}>
                    <Lock size={14} />
                    <p>截图保存在浏览器本地（localStorage），不会上传到服务器</p>
                </div>

                <div className={styles.content}>
                    {screenshots.length === 0 ? (
                        <div className={styles.empty}>
                            <p>No screenshots saved yet</p>
                            <p className={styles.hint}>Take a photo using the PHOTO button to save screenshots</p>
                        </div>
                    ) : (
                        <div className={styles.grid}>
                            {screenshots.map((screenshot, index) => (
                                <div key={screenshot.id} className={styles.item}>
                                    <img
                                        src={screenshot.url}
                                        alt={`Screenshot ${index + 1}`}
                                        className={styles.thumbnail}
                                    />
                                    <div className={styles.itemInfo}>
                                        <span className={styles.timestamp}>
                                            {new Date(screenshot.timestamp).toLocaleString()}
                                        </span>
                                        <div className={styles.actions}>
                                            <a
                                                href={screenshot.url}
                                                download={`galgame_${screenshot.timestamp}.png`}
                                                className={styles.actionBtn}
                                                title="Download"
                                            >
                                                <Download size={16} />
                                            </a>
                                            <button
                                                onClick={() => onDelete(screenshot.id)}
                                                className={styles.actionBtn}
                                                title="Delete"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default LogModal;
