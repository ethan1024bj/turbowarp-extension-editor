require('dotenv').config();
const express = require('express');
const path = require('path');
const OpenAI = require('openai');

const app = express();
const PORT = process.env.PORT || 3000;

const client = new OpenAI({
  apiKey: process.env.LLM_API_KEY,
  baseURL: process.env.LLM_BASE_URL,
});

app.use(express.json());
app.use(express.static(path.join(__dirname)));

const SYSTEM_PROMPT = `你是一个 TurboWarp 扩展代码生成器。用户会用自然语言描述想要的积木功能，你需要生成对应的 JSON 配置。

严格返回以下 JSON 格式，不要包含任何其他文字、解释或 markdown 代码块标记：

{
  "extId": "小写字母的扩展id",
  "extName": "扩展显示名称",
  "blocks": [
    {
      "opcode": "方法名小驼峰",
      "blockType": "Scratch.BlockType.COMMAND",
      "text": "积木显示文本 [ARG1] 和 [ARG2]",
      "color": "/*#4C97FF*/",
      "isEdgeActivated": false,
      "args": [
        { "name": "ARG1", "type": "string", "defaultValue": "默认值" }
      ],
      "funcBody": "        console.log(args.ARG1);",
      "returnExpr": ""
    }
  ]
}

字段说明：
- extId: 仅小写字母和数字，如 "mytools"
- extName: 中文或英文显示名
- opcode: JS 方法名，小驼峰
- blockType 可选值:
  - "Scratch.BlockType.COMMAND" (指令块)
  - "Scratch.BlockType.REPORTER" (返回值块)
  - "Scratch.BlockType.BOOLEAN" (布尔块)
  - "Scratch.BlockType.HAT" (帽子块)
- text: 积木文本，用 [参数名] 表示参数占位符
- color: 格式 /*#十六进制颜色*/
- args[].type 可选值: "string", "number", "boolean"
- funcBody: 函数体 JS 代码，使用 args.参数名 访问参数，缩进用空格
- returnExpr: 仅 REPORTER/BOOLEAN 类型需要，如 "return args.RESULT;"

注意事项：
1. funcBody 中不要包含 function 关键字和花括号，只写函数体内容
2. 如果用户没指定颜色，根据功能自动选择合适的颜色
3. 积木文本中英文皆可，保持用户描述的语言
4. 返回严格 JSON，不要有其他内容`;

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

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
