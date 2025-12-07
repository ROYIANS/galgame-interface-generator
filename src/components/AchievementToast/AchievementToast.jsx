import React, { useEffect, useState } from 'react';
import styles from './AchievementToast.module.css';
import {
  PartyPopper,
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

const AchievementToast = ({ achievements, onDismiss }) => {
  const [visible, setVisible] = useState(false);
  const [currentAchievement, setCurrentAchievement] = useState(null);

  useEffect(() => {
    if (achievements && achievements.length > 0) {
      setCurrentAchievement(achievements[0]);
      setVisible(true);

      // 3秒后自动消失
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(() => {
          onDismiss();
        }, 300); // 等待动画完成
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [achievements, onDismiss]);

  if (!currentAchievement) return null;

  const IconComponent = iconMap[currentAchievement.iconName] || Star;

  return (
    <div className={`${styles.toast} ${visible ? styles.visible : ''}`}>
      <div className={styles.header}>
        <PartyPopper size={20} style={{ display: 'inline', verticalAlign: 'middle', marginRight: '5px' }} />
        成就解锁！
      </div>
      <div className={styles.content}>
        <div className={styles.icon}>
          <IconComponent size={32} color="#c7a060" />
        </div>
        <div className={styles.info}>
          <div className={styles.title}>{currentAchievement.title}</div>
          <div className={styles.description}>{currentAchievement.description}</div>
        </div>
      </div>
    </div>
  );
};

export default AchievementToast;
