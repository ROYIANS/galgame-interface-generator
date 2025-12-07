import React, { useState } from 'react';
import { BookOpen, ChevronRight, ChevronDown } from 'lucide-react';
import styles from './CharacterLibrary.module.css';

const CharacterLibrary = ({ characters, onSelectCharacter, onDeleteCharacter }) => {
  const [expanded, setExpanded] = useState(false);

  if (characters.length === 0) {
    return null; // 没有角色时不显示
  }

  return (
    <div className={styles.container}>
      <button
        className={styles.toggleButton}
        onClick={() => setExpanded(!expanded)}
      >
        <div className={styles.headerTitle}>
          <BookOpen size={20} />
          <span>我的角色库 ({characters.length})</span>
        </div>
        {expanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
      </button>

      {expanded && (
        <div className={styles.characterGrid}>
          {characters.map(character => (
            <CharacterCard
              key={character.id}
              character={character}
              onSelect={onSelectCharacter}
              onDelete={onDeleteCharacter}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const CharacterCard = ({ character, onSelect, onDelete }) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleLongPress = () => {
    setShowDeleteConfirm(true);
  };

  const handleDelete = (e) => {
    e.stopPropagation();
    onDelete(character.id);
    setShowDeleteConfirm(false);
  };

  return (
    <div
      className={styles.characterCard}
      onClick={() => onSelect(character)}
      onContextMenu={(e) => {
        e.preventDefault();
        handleLongPress();
      }}
      style={{ borderColor: character.color }}
    >
      <div className={styles.cardContent}>
        {character.avatar && (
          <img
            src={character.avatar}
            alt={character.name}
            className={styles.avatar}
          />
        )}
        <div className={styles.characterName}>{character.name}</div>
        {character.usageCount > 0 && (
          <div className={styles.usageCount}>
            使用 {character.usageCount} 次
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className={styles.deleteConfirm} onClick={(e) => e.stopPropagation()}>
          <button onClick={handleDelete} className={styles.deleteBtn}>
            删除
          </button>
          <button onClick={() => setShowDeleteConfirm(false)} className={styles.cancelBtn}>
            取消
          </button>
        </div>
      )}
    </div>
  );
};

export default CharacterLibrary;
