import React from 'react';
import { Plus, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import styles from './SceneList.module.css';

const SceneList = ({
  scenes,
  currentSceneIndex,
  onSelectScene,
  onAddScene,
  onDeleteScene,
  onMoveScene,
  getResolvedScene
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>场景列表</h3>
        <button onClick={onAddScene} className={styles.addBtn} title="添加新场景">
          <Plus size={16} />
          添加场景
        </button>
      </div>

      <div className={styles.sceneList}>
        {scenes.map((scene, index) => {
          const resolved = getResolvedScene(index);
          const isCurrent = index === currentSceneIndex;

          return (
            <SceneCard
              key={scene.id}
              scene={scene}
              resolved={resolved}
              index={index}
              isCurrent={isCurrent}
              isFirst={index === 0}
              isLast={index === scenes.length - 1}
              canDelete={scenes.length > 1}
              onSelect={() => onSelectScene(index)}
              onDelete={() => onDeleteScene(scene.id)}
              onMoveUp={() => onMoveScene(index, index - 1)}
              onMoveDown={() => onMoveScene(index, index + 1)}
            />
          );
        })}
      </div>
    </div>
  );
};

const SceneCard = ({
  scene,
  resolved,
  index,
  isCurrent,
  isFirst,
  isLast,
  canDelete,
  onSelect,
  onDelete,
  onMoveUp,
  onMoveDown
}) => {
  return (
    <div
      className={`${styles.sceneCard} ${isCurrent ? styles.current : ''}`}
      onClick={onSelect}
    >
      <div className={styles.sceneHeader}>
        <span className={styles.sceneNumber}>场景 {index + 1}</span>
        <div className={styles.actions}>
          {!isFirst && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
              className={styles.moveBtn}
              title="上移"
            >
              <ChevronUp size={14} />
            </button>
          )}
          {!isLast && (
            <button
              onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
              className={styles.moveBtn}
              title="下移"
            >
              <ChevronDown size={14} />
            </button>
          )}
          {canDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className={styles.deleteBtn}
              title="删除场景"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      <div className={styles.sceneContent}>
        <div className={styles.sceneInfo}>
          <span className={styles.label}>角色:</span>
          <span className={styles.value}>
            {scene.inheritCharacter ? (
              <span className={styles.inherited}>继承: {resolved.character}</span>
            ) : (
              resolved.character
            )}
          </span>
        </div>

        <div className={styles.sceneInfo}>
          <span className={styles.label}>对话:</span>
          <span className={styles.valueText}>
            {scene.inheritText ? (
              <span className={styles.inherited}>继承</span>
            ) : (
              scene.text ? (
                scene.text.length > 30 ? scene.text.slice(0, 30) + '...' : scene.text
              ) : (
                <span className={styles.empty}>未填写</span>
              )
            )}
          </span>
        </div>

        <div className={styles.sceneInfo}>
          <span className={styles.label}>背景:</span>
          <span className={styles.value}>
            {scene.inheritBackground ? (
              <span className={styles.inherited}>继承</span>
            ) : scene.background ? (
              <span className={styles.hasBackground}>✓ 已设置</span>
            ) : (
              <span className={styles.empty}>无</span>
            )}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SceneList;
