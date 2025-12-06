# 背景音乐文件说明

**请将你的 `bgm.mp3` 文件放在这个 `public` 文件夹中。**

## 为什么要放在 public 文件夹？

Vite 打包时，`public` 文件夹中的文件会被直接复制到 `dist` 目录，不会经过构建处理。这样可以确保音频文件在打包后仍然存在。

## 文件路径

- **开发环境**: `/bgm.mp3`
- **生产环境**: `/bgm.mp3`（自动复制到 dist 根目录）

## 音乐规格建议

- **格式**: MP3
- **比特率**: 128-192 kbps（平衡质量和文件大小）
- **时长**: 1-3 分钟（会自动循环）
- **风格**: 8-bit / Chiptune / Lo-fi 游戏音乐

## Suno AI 生成提示词

**英文版（推荐）**：
```
8-bit retro game ambient, calm instrumental, visual novel background music, pixel art vibe, nostalgic gaming atmosphere, lo-fi chiptune, peaceful and quiet, no vocals, pure instrumental
```

**中文版**：
```
8位复古游戏氛围音乐，安静的纯器乐，视觉小说背景乐，像素风格，怀旧游戏氛围，低保真芯片音乐，平静放松，无人声
```

## 使用步骤

1. 将音乐文件重命名为 `bgm.mp3`
2. 放到 `public/` 文件夹（与这个 README 同级）
3. 运行 `npm run build` 构建项目
4. `bgm.mp3` 会自动出现在 `dist/` 目录中

## 容错说明

如果没有放置 `bgm.mp3` 文件，应用仍然可以正常运行，只是不会播放背景音乐。其他音效（对话打字、按钮悬停、快门声）都由代码生成，不受影响。
