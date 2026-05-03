<p align="center">
  <img src="https://img.shields.io/badge/Platform-TurboWarp-4C97FF?style=flat-square&logo=scratch&logoColor=white" alt="TurboWarp">
  <img src="https://img.shields.io/badge/AI-mimo--v2.5--pro-FFAB19?style=flat-square" alt="AI Powered">
  <img src="https://img.shields.io/badge/License-MIT-59C059?style=flat-square" alt="License">
</p>

<h1 align="center">TurboWarp Extension Editor</h1>

<p align="center">
  <b>用自然语言创建 TurboWarp 扩展积木 —— 说一句话，出一个积木</b>
</p>

<p align="center">
  一个可视化的积木编辑器，支持 AI 自动生成代码、实时预览、一键下载<br>
  让 Scratch 玩家零门槛创建自己的扩展积木
</p>

---

## Features

- **AI 自然语言生成** —— 输入中文/英文描述，自动生成完整的 TurboWarp 扩展代码
- **可视化积木预览** —— 实时预览积木外观，支持指令块、Reporter、Boolean、帽子块等所有类型
- **代码编辑器** —— CodeMirror 语法高亮，支持手动编写和自动编写两种模式
- **调试控制台** —— 内置 Scratch Runtime 模拟环境，运行前自动验证代码
- **语法参考** —— 完整的 TurboWarp 扩展语法速查手册
- **一键导出** —— 下载为 .js 文件 / 生成可分享 URL / 复制代码
- **颜色配置** —— 拾色器 + 预设色板，支持 `/*#RRGGBB*/` 格式
- **参数管理** —— 支持 STRING / NUMBER / BOOLEAN 参数类型，可设默认值
- **本地存储** —— 自动保存，刷新不丢失


<img width="1872" height="995" alt="d0900db8717aa89161508abaa34d6f5b" src="https://github.com/user-attachments/assets/9d886aba-7912-41c9-993a-0be770f321c4" />


## Quick Start

```bash
# 1. 克隆仓库
git clone https://github.com/ethan1024bj/TWeditor.git
cd TWeditor

# 2. 安装依赖
npm install

# 3. 配置 AI（复制 .env.example 为 .env，填入你的 API Key）
cp .env.example .env
# 编辑 .env 填写 LLM_API_KEY、LLM_BASE_URL、LLM_MODEL

# 4. 启动服务器
npm start

# 5. 打开浏览器
# 访问 http://localhost:3000
```

## AI 配置

在 `.env` 文件中配置你的 LLM API：

```env
LLM_API_KEY=sk-your-key-here
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

支持所有 OpenAI 兼容接口：

| 服务商 | BASE_URL | MODEL |
|--------|----------|-------|
| OpenAI | `https://api.openai.com/v1` | `gpt-4o-mini` |
| DeepSeek | `https://api.deepseek.com/v1` | `deepseek-chat` |
| 通义千问 | `https://dashscope.aliyuncs.com/compatible-mode/v1` | `qwen-turbo` |
| 本地 Ollama | `http://localhost:11434/v1` | `llama3` |
| 小米 MiMo | `https://token-plan-cn.xiaomimimo.com/v1` | `mimo-v2.5-pro` |

## Usage

### AI 生成（推荐）

1. 在顶部输入框描述你想要的积木，例如：
   - "创建一个打招呼积木，输入名字输出你好xxx"
   - "做一个随机数生成器，输入最小值和最大值"
   - "Create a block that calculates the sum of two numbers"
2. 点击 **生成** 或按 `Ctrl+Enter`
3. 积木预览和代码自动更新

### 手动创建

1. 点击左侧 **+** 按钮添加积木
2. 配置积木类型、显示文本、参数、颜色
3. 编写函数实现
4. 点击 **自动编写** 生成代码

### 加载到 TurboWarp

1. 打开 [turbowarp.org/editor](https://turbowarp.org/editor)
2. 左下角 **高级** → **加载未打包的扩展**
3. 粘贴代码或选择下载的 .js 文件


## Project Structure

```
├── index.html          # 主页面
├── style.css           # 样式
├── app.js              # 前端逻辑
├── server.js           # Node.js 代理服务器（AI 调用）
├── package.json        # 依赖配置
├── .env.example        # 环境变量模板
└── .gitignore          # Git 忽略规则
```

## Keyboard Shortcuts

| 快捷键 | 功能 |
|--------|------|
| `Ctrl+Enter` | AI 生成 |
| `Ctrl+S` | 下载 .js 文件 |
| `Ctrl+Shift+C` | 复制代码 |
| `Escape` | 关闭弹窗 |

## License

MIT
