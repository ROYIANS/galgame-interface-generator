# Galgame Screen Editor

一个视觉小说（Galgame）屏幕编辑器和截图生成工具，支持AI增强功能。

## 功能特性

- **对话场景编辑** - 自定义角色名称、对话文本和背景图片
- **AI文本生成** - 使用OpenAI API生成中二病风格的动漫对话文本
- **AI图像生成** - 使用DALL-E生成背景图片
- **打字机动画效果** - 逐字显示对话文本，营造沉浸式体验
- **截图功能** - 带闪光效果的场景截图生成
- **复古CRT效果** - 扫描线和像素化美学
- **图片裁剪** - 内置图片裁剪工具，完美适配背景

## 技术栈

- **React 19** - UI框架
- **Vite** - 构建工具
- **OpenAI API** - AI文本和图像生成
- **html2canvas** - 截图生成
- **react-easy-crop** - 图片裁剪
- **lucide-react** - 图标库

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发模式

```bash
npm run dev
```

访问 `http://localhost:5173` 查看应用

### 生产构建

```bash
npm run build
```

### 预览生产构建

```bash
npm run preview
```

## 使用说明

### 1. 配置AI设置

点击顶部 "SETTINGS" 按钮，配置OpenAI API：
- **API Key** - 你的OpenAI API密钥
- **Base URL** - API基础URL（默认：https://api.openai.com/v1）
- **Text Model** - 文本生成模型（默认：gpt-3.5-turbo）
- **Image Model** - 图像生成模型（默认：dall-e-3）

配置会保存在浏览器的localStorage中。

### 2. 编辑对话内容

点击 "EDIT" 按钮打开编辑面板：
- **角色名称** - 输入说话角色的名字
- **对话文本** - 输入对话内容
- **背景图片** - 上传自定义背景图（支持裁剪）
- **AI生成文本** - 点击生成符合中二病风格的对话
- **AI生成背景** - 根据描述生成背景图

### 3. 截图保存

点击 "CAPTURE" 按钮生成当前场景截图，自动下载为PNG文件。

## 项目结构

```
src/
├── components/
│   ├── ActionBar/         # 顶部菜单栏
│   ├── DialogBox/         # 对话框组件
│   ├── GalgameScreen/     # 主屏幕容器
│   ├── Controls/          # 编辑控制面板
│   ├── Settings/          # AI设置模态框
│   └── CropModal/         # 图片裁剪模态框
├── hooks/
│   ├── useAI.js           # AI API集成Hook
│   └── useTypewriter.js   # 打字机效果Hook
├── assets/                # 静态资源
├── App.jsx                # 主应用组件
├── main.jsx               # 应用入口
└── index.css              # 全局样式
```

## 主要组件说明

### GalgameScreen
主屏幕容器，包含背景图片和CRT效果。

### DialogBox
对话框组件，显示角色名称和对话文本，带打字机动画效果。

### ActionBar
顶部操作栏，包含设置、编辑和截图按钮。

### Controls
编辑面板，用于输入文本、上传图片和调用AI功能。

### Settings
AI配置模态框，用于设置OpenAI API参数。

### CropModal
图片裁剪模态框，用于调整上传的背景图片。

## 自定义Hooks

### useTypewriter
打字机效果Hook，实现文字逐字显示动画。

```javascript
const displayedText = useTypewriter(text, speed);
```

### useAI
OpenAI API集成Hook，提供文本和图像生成功能。

```javascript
const { generateText, generateImage, loading, error } = useAI(config);
```

## 环境变量

项目不需要环境变量文件，所有配置通过UI界面设置。

## 浏览器兼容性

- Chrome/Edge (推荐)
- Firefox
- Safari

需要支持ES2020+和现代Web API（Web Audio API、Canvas API）。

## 注意事项

- 使用AI功能需要有效的OpenAI API密钥
- 截图功能在某些浏览器中可能受CORS限制
- 打字机效果速度可在代码中调整（默认30ms/字符）

## 许可证

MIT

## 贡献

欢迎提交Issue和Pull Request！
