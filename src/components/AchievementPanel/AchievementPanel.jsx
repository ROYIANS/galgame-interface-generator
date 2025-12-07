import React from 'react';
import { ACHIEVEMENTS } from '../../hooks/useAchievements';
import styles from './AchievementPanel.module.css';
import {
  Trophy,
  X,
  Lock,
  Sparkles,
  Camera,
  Video,
  Bot,
  Brain,
  MessageSquare,
  BookOpen,
  UserPlus,
  Users,
  Flame,
  Star
} from 'lucide-react';

const iconMap = {
  Sparkles,
  Camera,
  Video,
  Bot,
  Brain,
  MessageSquare,
  BookOpen,
  UserPlus,
  Users,
  Flame,
  Star
};

const AchievementPanel = ({ isOpen, onClose, unlocked, stats, getProgress }) => {
  if (!isOpen) return null;

  const unlockedCount = unlocked.length;
  const totalCount = ACHIEVEMENTS.length;
  const percentage = Math.round((unlockedCount / totalCount) * 100);

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.panel} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} className={styles.closeBtn}>
          <X size={20} />
        </button>

        <div className={styles.header}>
          <h2><Trophy size={20} color="#c7a060" /> 我的成就</h2>
        </div>

        <div className={styles.progress}>
          <div className={styles.progressText}>
            已解锁: {unlockedCount}/{totalCount} ({percentage}%)
          </div>
          <div className={styles.progressBar}>
            <div
              className={styles.progressFill}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        <div className={styles.achievementList}>
          {ACHIEVEMENTS.map(achievement => {
            const isUnlocked = unlocked.includes(achievement.id);
            const progress = getProgress ? getProgress(achievement.id) : 0;

            return (
              <AchievementCard
                key={achievement.id}
                achievement={achievement}
                isUnlocked={isUnlocked}
                progress={progress}
                stats={stats}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};

const AchievementCard = ({ achievement, isUnlocked, progress, stats }) => {
  const IconComponent = iconMap[achievement.iconName] || Star;

  const getProgressText = () => {
    if (isUnlocked) return '已解锁';

    // 根据成就 ID 显示具体进度
    if (achievement.id.startsWith('save_')) {
      const target = parseInt(achievement.id.split('_')[1]);
      return `${stats.totalScreenshots}/${target}`;
    }

    if (achievement.id === 'character_creator') {
      return `${stats.charactersCreated}/3`;
    }

    if (achievement.id === 'character_master') {
      return `${stats.charactersCreated}/10`;
    }

    if (achievement.id === 'daily_creator') {
      return `${stats.consecutiveDays}/3 天`;
    }

    if (achievement.id === 'weekly_creator') {
      return `${stats.consecutiveDays}/7 天`;
    }

    if (achievement.id === 'wordsmith') {
      return `${stats.longestText}/500 字`;
    }

    if (achievement.id === 'novelist') {
      return `${stats.longestText}/1000 字`;
    }

    if (achievement.id === 'use_ai') {
      return `${stats.aiGenerations}/1`;
    }

    if (achievement.id === 'ai_master') {
      return `${stats.aiGenerations}/50`;
    }

    return `${Math.round(progress)}%`;
  };

  return (
    <div className={`${styles.achievementCard} ${isUnlocked ? styles.unlocked : styles.locked}`}>
      <div className={styles.icon}>
        <IconComponent size={24} />
      </div>
      <div className={styles.info}>
        <div className={styles.title}>
          {achievement.title}
          {!isUnlocked && <Lock size={14} className={styles.lockIcon} />}
        </div>
        <div className={styles.description}>{achievement.description}</div>
        <div className={styles.progressInfo}>
          {getProgressText()}
        </div>
        {!isUnlocked && progress > 0 && (
          <div className={styles.miniProgressBar}>
            <div
              className={styles.miniProgressFill}
              style={{ width: `${progress}%` }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default AchievementPanel;
