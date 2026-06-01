require('dotenv').config();
const express = require('express');
const path = require('path');
const http = require('http');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;
const WATCHER_PORT = 3001;

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

app.use(express.json());

// Proxy /api/watcher/* to watcher on port 3001
app.all('/api/watcher/*', (req, res) => {
  const opts = {
    hostname: '127.0.0.1',
    port: WATCHER_PORT,
    path: req.originalUrl,
    method: req.method,
    headers: { 'Content-Type': 'application/json' }
  };
  const proxy = http.request(opts, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res);
  });
  proxy.on('error', () => {
    res.status(502).json({ serverStatus: 'offline', error: 'Watcher not running' });
  });
  if (req.method === 'POST' && req.body) {
    proxy.write(JSON.stringify(req.body));
  }
  proxy.end();
});

app.use(express.static(path.join(__dirname)));

const SYSTEM_PROMPT = `你是一个 TurboWarp 扩展代码生成器。用户会用自然语言描述想要的积木功能，你需要生成对应的 JSON 配置。

严格返回以下 JSON 格式，不要包含任何其他文字、解释或 markdown 代码块标记：

{
  "extId": "小写字母的扩展id",
  "extName": "扩展显示名称",
  "extColor1": "#4C97FF",
  "extColor2": "#3373CC",
  "extColor3": "#295FA8",
  "extTargetTypes": "",
  "extDocsURI": "",
  "extSandboxMode": "sandbox",
  "blocks": [
    {
      "opcode": "方法名小驼峰",
      "blockType": "Scratch.BlockType.COMMAND",
      "text": "积木显示文本 [ARG1] 和 [ARG2]",
      "color1": "#4C97FF",
      "color2": "#3373CC",
      "color3": "#295FA8",
      "isEdgeActivated": false,
      "hide": false,
      "isTerminal": false,
      "args": [
        { "name": "ARG1", "type": "string", "defaultValue": "默认值" },
        { "name": "ARG2", "type": "string", "defaultValue": "", "menu": "myMenu" }
      ],
      "funcBody": "        console.log(args.ARG1);",
      "returnExpr": ""
    }
  ],
  "menus": [
    {
      "name": "myMenu",
      "acceptReporters": true,
      "isDynamic": false,
      "dynamicMethod": "",
      "items": [
        { "text": "选项A", "value": "a" },
        { "text": "选项B", "value": "b" }
      ]
    }
  ]
}

字段说明：
- extId: 仅小写字母和数字，如 "mytools"
- extName: 中文或英文显示名
- extColor1/2/3: 扩展 UI 三级颜色（十六进制）
- extTargetTypes: 可选，"" (全部), "sprite" (仅角色), "stage" (仅舞台)
- extDocsURI: 可选，文档链接 URL
- extSandboxMode: "sandbox" (沙箱) 或 "unsandbox" (非沙箱)
- opcode: JS 方法名，小驼峰
- blockType 可选值:
  - "Scratch.BlockType.COMMAND" (指令块)
  - "Scratch.BlockType.REPORTER" (返回值块)
  - "Scratch.BlockType.BOOLEAN" (布尔块)
  - "Scratch.BlockType.HAT" (帽子块)
  - "Scratch.BlockType.CONDITIONAL" (条件块)
  - "Scratch.BlockType.LOOP" (循环块)
  - "Scratch.BlockType.BUTTON" (按钮)
- text: 积木文本，用 [参数名] 表示参数占位符
- color1/2/3: 积木三级颜色
- hide: 是否隐藏积木（可选，默认 false）
- isTerminal: 是否为终端块（可选，默认 false）
- args[].type 可选值: "string", "number", "boolean", "color", "angle", "matrix", "note", "variable", "list", "costume", "sound", "image"
- args[].menu: 可选，关联菜单名称（参数类型必须为 "string"）
- menus: 菜单定义数组（可选）
  - menus[].name: 菜单名称
  - menus[].acceptReporters: 是否允许变量/表达式输入
  - menus[].isDynamic: 是否为动态菜单（可选，默认 false）
  - menus[].dynamicMethod: 动态菜单的方法名（isDynamic 为 true 时使用）
  - menus[].items: 选项数组，可以是字符串或 {text, value} 对象，'-' 表示分隔线
- funcBody: 函数体 JS 代码，使用 args.参数名 访问参数，缩进用空格
- returnExpr: 仅 REPORTER/BOOLEAN 类型需要，如 "return args.RESULT;"

注意事项：
1. funcBody 中不要包含 function 关键字和花括号，只写函数体内容
2. 如果用户没指定颜色，根据功能自动选择合适的颜色。常用配色：
   - 运动(蓝): color1="#4C97FF", color2="#3373CC", color3="#295FA8"
   - 事件(紫): color1="#9966FF", color2="#7746CC", color3="#5533A0"
   - 控制(粉): color1="#CF63CF", color2="#A64DA6", color3="#803880"
   - 侦测(黄): color1="#FFAB19", color2="#CC8914", color3="#99670F"
   - 声音(玫红): color1="#FF6680", color2="#CC5266", color3="#993D4D"
   - 画笔(青): color1="#5CB1D6", color2="#4A8EAB", color3="#386B80"
   - 数据(绿): color1="#59C059", color2="#479A47", color3="#357435"
   - 运算(橙): color1="#FF8C1A", color2="#CC7015", color3="#995410"
3. 积木文本中英文皆可，保持用户描述的语言
4. 返回严格 JSON，不要有其他内容
5. 菜单参数的 args[].type 必须是 "string"，不能是 "menu"
6. 需要非沙箱模式（如 DOM 操作、fetch 请求）时，设置 extSandboxMode 为 "unsandbox"`;

app.post('/api/generate', async (req, res) => {
  const { prompt } = req.body;
  if (!prompt || !prompt.trim()) {
    return res.status(400).json({ error: '请输入描述' });
  }

  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ],
      temperature: 0.3,
      max_tokens: 4096,
    });

    let content = completion.choices[0].message.content.trim();

    // Strip markdown code fences if present
    content = content.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/i, '');

    const data = JSON.parse(content);
    res.json(data);
  } catch (err) {
    console.error('LLM Error:', err.message);
    if (err instanceof SyntaxError) {
      return res.status(502).json({ error: 'AI 返回的不是有效 JSON，请重试' });
    }
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'running', port: PORT, pid: process.pid, uptime: process.uptime() });
});

app.post('/api/stop', (req, res) => {
  res.json({ status: 'stopping' });
  console.log('Server stopping by user request...');
  setTimeout(() => process.exit(0), 300);
});

const server = app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
  if (process.send) process.send({ type: 'started', port: PORT });
});
