<p align="center">
  <img src="https://img.shields.io/badge/Platform-TurboWarp-4C97FF?style=flat-square&logo=scratch&logoColor=white" alt="TurboWarp">
  <img src="https://img.shields.io/badge/AI-Powered-FFAB19?style=flat-square" alt="AI Powered">
  <img src="https://img.shields.io/badge/🌐-中文%20%7C%20English-59C059?style=flat-square" alt="Bilingual">
  <img src="https://img.shields.io/badge/License-MIT-59C059?style=flat-square" alt="License">
</p>

我是一名中关村三小的三年级学生，我三年前开始学习Scratch编程、一年前开始学习C++编程、一个月前开始学习vibecoding。这是我做的第一个开源项目。<br>
I am 9 , a primary student. I like the TurboWarp especially custom extension function.However, I don't know how to write JavaScript. So I use Claude Code to develop a visual editor.This is my first open source project。
<h1 align="center">TurboWarp Extension Editor</h1>

<p align="center">
  <b>你还在为不会写自定义扩展而发愁吗？<br>
    你还在为手搓自定义扩展代码发愁吗？<br>
    你还在手动微调AI生成的扩展代码吗？<br>
    试试这款编辑器,新手快速入门几分钟搞定超复杂扩展。<br>
    用自然语言创建 TurboWarp 扩展积木 —— 说一句话，出一个积木。</b><br><br>
  <b>Struggling to write custom extensions? Tired of hand-coding or tweaking AI-generated code?<br>
    Try this editor — beginners can build complex extensions in minutes.<br>
    Create TurboWarp extension blocks with natural language.</b>
</p>

<p align="center">
  一个可视化的积木编辑器，支持 AI 自动生成代码、实时预览、一键下载<br>
  让 Scratch 玩家零门槛创建自己的扩展积木
</p>

<p align="center">
  A visual block editor with AI-powered code generation, live preview, and one-click export.<br>
  Empowering Scratch users to create custom extension blocks with zero barriers.
</p>

---

## Features / 功能特性

| Feature / 功能 | Description / 说明 |
|---|---|
| **AI 自然语言生成** / **AI Natural Language Generation** | 输入中文/英文描述，自动生成完整的 TurboWarp 扩展代码<br>Describe blocks in Chinese or English — full extension code is generated automatically |
| **可视化积木预览** / **Visual Block Preview** | 实时预览积木外观，支持指令块、Reporter、Boolean、帽子块、条件块、循环块等所有类型<br>Live preview of all block types: Command, Reporter, Boolean, Hat, Conditional, Loop, Button |
| **代码编辑器** / **Code Editor** | CodeMirror 语法高亮，支持手动编写和 AI 自动编写两种模式<br>Syntax-highlighted editor with both manual and AI-assisted coding modes |
| **调试控制台** / **Debug Console** | 内置 Scratch Runtime 模拟环境，运行前自动验证代码<br>Built-in mock Scratch Runtime for testing blocks before loading into TurboWarp |
| **语法参考** / **Syntax Reference** | 完整的 TurboWarp 扩展语法速查手册，10 个章节<br>Complete TurboWarp extension API reference embedded in the UI (10 sections) |
| **一键导出** / **One-Click Export** | 下载为 .js 文件 / 生成可分享 URL / 复制代码到剪贴板<br>Download as .js file / generate shareable URL / copy code to clipboard |
| **颜色配置** / **Color System** | 三级颜色系统（浅色/中色/深色），预设色板匹配 Scratch 分类颜色<br>Three-level color system with preset palettes matching Scratch category colors |
| **参数管理** / **Argument Management** | 支持 STRING / NUMBER / BOOLEAN / ANGLE / COLOR 等参数类型，可设默认值<br>Supports STRING, NUMBER, BOOLEAN, ANGLE, COLOR and more with default values |
| **本地存储** / **Local Storage** | 自动保存所有配置和代码，刷新页面不丢失<br>Auto-saves all state and code — survives page refresh |
| **多语言界面** / **Bilingual UI** | 支持中文 / English 双语切换，标题栏同时显示「中 / EN」，当前语言高亮，偏好自动保存<br>Header shows both 中/EN with active language highlighted — preference is saved automatically |
| **AI 生成警告** / **AI Generation Warning** | AI 生成后弹出确认提醒：内容仅用于个人研发，请勿直接提交到扩展社区，并附 contributing guidelines 链接。用户需主动确认后才会应用结果<br>After AI generation, a confirmation dialog warns that content is for personal use only and links to contributing guidelines. Users must explicitly accept before results are applied |
| **后台服务管理** / **Backend Service Manager** | 标题栏显示后台服务状态（运行中/已停止/离线），支持一键启动/停止后端服务<br>Header shows backend service status (Running/Stopped/Offline) with one-click start/stop toggle |
| **代码片段库** / **Code Snippets Library** | 代码编辑界面左侧提供完整代码片段库，包含扩展积木、Scratch API 和 JavaScript 内置方法三大分类。每个片段显示代码类型、返回值类型、参数信息和功能说明，支持搜索过滤和一键复制<br>Left panel in code editor with Extension Blocks, Scratch API, and JS built-in snippets. Each shows type, return value, params, and description. Supports search filtering and one-click copy |
| **代码补全** / **Code Autocomplete** | CodeMirror 编辑器内置智能代码补全，输入 `.` 或按 `Ctrl+Space` 触发。支持 Scratch API、用户自定义积木和 JavaScript 关键词补全<br>Built-in intelligent autocomplete in the editor. Trigger with `.` or `Ctrl+Space`. Supports Scratch API, user block opcodes, and JavaScript keyword completion |

<img width="1872" height="995" alt="d0900db8717aa89161508abaa34d6f5b" src="https://github.com/user-attachments/assets/9d886aba-7912-41c9-993a-0be770f321c4" />
<p align="center">中文界面</p>

<img width="1576" height="910" alt="ScreenShot_2026-05-04_175611_309" src="https://github.com/user-attachments/assets/edc3324d-548d-43eb-9fae-b8aedbb922a4" />
<p align="center">English Interface</p>


---

## Quick Start / 快速开始

```bash
# 1. 克隆仓库 / Clone the repo
git clone https://github.com/ethan1024bj/turbowarp-extension-editor.git
cd turbowarp-extension-editor

# 2. 安装依赖 / Install dependencies
npm install

# 3. 配置 AI / Configure AI
# 复制 .env.example 为 .env，填入你的 API Key
# Copy .env.example to .env and fill in your API Key
cp .env.example .env

# 4. 启动服务器 / Start the server
npm start

# 5. 打开浏览器 / Open browser
# 访问 / Visit http://localhost:3000
# 标题栏可一键启动/停止后端服务 / Use header button to start/stop backend
```

---

## AI 配置 / AI Configuration

在 `.env` 文件中配置你的 LLM API：

Configure your LLM API in the `.env` file:

```env
LLM_API_KEY=sk-your-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

支持所有 OpenAI 兼容接口 / Supports all OpenAI-compatible APIs:

| 服务商 / Provider | BASE_URL | MODEL |
|---|---|---|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 通义千问 / Tongyi Qianwen | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` |
| 本地 Ollama / Local Ollama | `http://localhost:11434/v1` | `llama3` |
| 小米 MiMo / Xiaomi MiMo | `https://token-plan-cn.xiaomimimo.com/v1` | `mimo-v2.5-pro` |

---

## Usage / 使用方法

### AI 生成（推荐）/ AI Generation (Recommended)

1. 在顶部输入框描述你想要的积木 / Describe your desired block in the top input box
   - "创建一个打招呼积木，输入名字输出你好xxx" / "Create a greeting block that takes a name and outputs hello xxx"
   - "做一个随机数生成器，输入最小值和最大值" / "Make a random number generator with min and max inputs"
2. 点击 **生成** 或按 `Ctrl+Enter` / Click **Generate** or press `Ctrl+Enter`
3. 积木预览和代码自动更新 / Block preview and code update automatically

### 手动创建 / Manual Creation

1. 点击左侧 **+** 按钮添加积木 / Click the **+** button on the left to add a block
2. 配置积木类型、显示文本、参数、颜色 / Configure block type, display text, arguments, and colors
3. 编写函数实现 / Write the function body
4. 点击 **自动编写** 生成代码 / Click **Auto-generate** to produce the code

### 加载到 TurboWarp / Load into TurboWarp

1. 打开 [turbowarp.org/editor](https://turbowarp.org/editor) / Open the TurboWarp editor
2. 左下角 **扩展** → **加载自定义扩展** → **文本/URL/文件** / Bottom-left **Extensions** → **Load Custom Extension** → **Text/URL/File**
3. 粘贴代码或选择下载的 .js 文件 / Paste the code or select the downloaded .js file

### 代码片段库 / Code Snippets Library

切换到 **代码编辑** 标签页，左侧面板显示完整的代码片段库，分三大类：

Switch to the **Code Editor** tab. The left panel shows a complete snippets library in three categories:

- **扩展积木 / Extension Blocks** — 你创建的所有积木，显示代码类型、返回值、参数等信息
  All blocks you've created, with type, return value, and parameter info
- **Scratch API** — `Scratch.BlockType.*`、`Scratch.ArgumentType.*`、`Scratch.vm.runtime.*` 等常用 API
  Common APIs like `Scratch.BlockType.*`, `Scratch.ArgumentType.*`, `Scratch.vm.runtime.*`
- **JavaScript** — `Math.*`、`JSON.*`、`console.*`、`fetch` 等内置方法
  Built-in methods like `Math.*`, `JSON.*`, `console.*`, `fetch`

每个片段卡片显示：代码类型标签、功能说明、是否有返回值（及类型）、是否有参数。点击卡片直接插入代码到编辑器，点击 📋 按钮复制单个代码片段。

Each snippet card shows: type badge, description, return value (and type), and parameters. Click a card to insert code into the editor, or click 📋 to copy a single snippet.

### 代码补全 / Code Autocomplete

在代码编辑器中输入代码时，编辑器会自动提供补全建议：

The editor provides intelligent autocomplete suggestions as you type:

- 输入 `Scratch.` 自动弹出所有 Scratch API 补全列表
  Type `Scratch.` to see all Scratch API completions
- 输入 `.` 或 `[` 自动触发补全
  Type `.` or `[` to trigger autocomplete
- 按 `Ctrl+Space` 手动触发补全
  Press `Ctrl+Space` to manually trigger autocomplete
- 补全列表包含：Scratch API、用户自定义积木名称、JavaScript 关键词
  Completions include: Scratch API, user block names, and JavaScript keywords

### 切换语言 / Switch Language

标题栏同时显示 **中** / **EN**，当前语言高亮，点击即可切换。语言偏好自动保存。

The header shows both **中** and **EN** — the active language is highlighted. Click to switch. Preference is saved automatically.

---

## Project Structure / 项目结构

```
├── index.html          # 主页面 / Main page
├── style.css           # 样式 / Styles (dark theme)
├── app.js              # 前端逻辑 / Frontend logic
├── i18n.js             # 多语言模块 / Internationalization module (zh/en)
├── server.js           # Node.js 服务器 / Node.js server (AI API + static files)
├── watcher.js          # 后台服务管理器 / Backend service manager (start/stop server)
├── package.json        # 依赖配置 / Dependencies
├── .env.example        # 环境变量模板 / Environment variable template
└── .gitignore          # Git 忽略规则 / Git ignore rules
```

---

## Keyboard Shortcuts / 快捷键

| 快捷键 / Shortcut | 功能 / Function |
|---|---|
| `Ctrl+Enter` | AI 生成 / AI Generate |
| `Ctrl+S` | 下载 .js 文件 / Download .js file |
| `Ctrl+Shift+C` | 复制代码 / Copy code |
| `Ctrl+Space` | 触发代码补全 / Trigger autocomplete |
| `Escape` | 关闭弹窗 / Close popup |

---

## License / 许可证

[MIT](LICENSE)

---

## Star History / 支持我们

如果这个项目对你有帮助，请给我们一个 Star！你的支持是我们持续更新的动力。

If you find this project helpful, please give us a Star! Your support motivates us to keep improving.

<p align="center">
  <a href="https://github.com/ethan1024bj/turbowarp-extension-editor/stargazers">
    <img src="https://img.shields.io/github/stars/ethan1024bj/turbowarp-extension-editor?style=social" alt="GitHub Stars">
  </a>
</p>

<p align="center">
  <b>觉得不错？点个 Star 吧！</b><br>
  <b>Like it? Give us a Star!</b><br><br>
  <a href="https://github.com/ethan1024bj/turbowarp-extension-editor/stargazers">
    <img src="https://img.shields.io/badge/⭐_Star_on_Github-Click_Here-4C97FF?style=for-the-badge" alt="Star on GitHub">
  </a>
</p>
