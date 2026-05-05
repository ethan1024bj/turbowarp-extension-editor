// ==================== i18n Module ====================
(function () {
  'use strict';

  const translations = {
    zh: {
      // Header
      'header.title': 'TurboWarp 扩展编辑器',
      'header.autoGenerate': '自动编写',
      'header.autoGenerateTitle': '根据左侧配置自动生成代码',
      'header.downloadJS': '下载 JS',
      'header.downloadJSTitle': '下载为 .js 文件',
      'header.exportURL': '导出 URL',
      'header.exportURLTitle': '生成可分享的 URL',
      'header.importURL': '导入 URL',
      'header.importURLTitle': '从 URL 导入',

      // AI Bar
      'ai.placeholder': '用自然语言描述你想要的积木，例如：创建一个计算器积木，输入两个数字，返回它们的和',
      'ai.generate': '生成',

      // Config Panel
      'config.extConfig': '扩展配置',
      'config.basicInfo': '基本信息',
      'config.extId': '扩展 ID',
      'config.extIdPlaceholder': 'myextension (仅小写字母)',
      'config.extName': '扩展名称',
      'config.extColor': '扩展 UI 颜色',
      'config.resetColor': '恢复默认颜色',
      'config.colorMotion': '运动(蓝)',
      'config.colorEvent': '事件(紫)',
      'config.colorControl': '控制(粉)',
      'config.colorDetect': '侦测(黄)',
      'config.colorSound': '声音(玫红)',
      'config.colorPen': '画笔(青)',
      'config.colorData': '数据(绿)',
      'config.colorOperator': '运算(橙)',
      'config.colorPrimary': '主体',
      'config.colorInner': '内部',
      'config.colorDark': '深色',
      'config.blockList': '积木列表',
      'config.addBlock': '添加积木',

      // Block Editor
      'blockEditor.title': '编辑积木',
      'blockEditor.opcode': '积木名称 (opcode)',
      'blockEditor.blockType': '积木类型 (blockType)',
      'blockEditor.typeCommand': '指令块 (COMMAND)',
      'blockEditor.typeReporter': 'Reporter - 返回字符串/数字',
      'blockEditor.typeBoolean': 'Boolean - 返回 true/false',
      'blockEditor.typeHat': '帽子块 (HAT)',
      'blockEditor.typeConditional': '条件块 (CONDITIONAL)',
      'blockEditor.typeLoop': '循环块 (LOOP)',
      'blockEditor.typeButton': '按钮 (BUTTON)',
      'blockEditor.text': '显示文本 (text)',
      'blockEditor.textHint': '用 [参数名] 定义参数占位符',
      'blockEditor.edgeActivated': '边缘触发 (isEdgeActivated)',
      'blockEditor.argList': '参数列表',
      'blockEditor.addArg': '添加参数',
      'blockEditor.argName': '参数名',
      'blockEditor.argTypeString': '字符串',
      'blockEditor.argTypeNumber': '数字',
      'blockEditor.argTypeBoolean': '布尔',
      'blockEditor.argDefault': '默认值',
      'blockEditor.blockColor': '积木颜色',
      'blockEditor.colorPrimary': '主体 (最亮)',
      'blockEditor.colorInner': '内部 (中等)',
      'blockEditor.colorDark': '深色 (最深)',
      'blockEditor.funcBody': '函数实现 (JS)',
      'blockEditor.returnExpr': '返回值表达式',
      'blockEditor.save': '保存积木',
      'blockEditor.delete': '删除积木',
      'blockEditor.cancel': '取消',

      // System Params
      'sys.title': '系统参数',
      'sys.platform': '平台',
      'sys.screen': '屏幕',
      'sys.lang': '语言',
      'sys.online': '在线',
      'sys.offline': '离线',
      'sys.cores': 'CPU 核心',
      'sys.memory': '内存',

      // Tabs
      'tabs.preview': '积木预览',
      'tabs.code': '代码编辑',
      'tabs.debug': '调试控制台',
      'tabs.reference': '语法参考',

      // Preview
      'preview.refresh': '刷新预览',
      'preview.hint': '预览积木外观（颜色、形状、文本）',
      'preview.empty': '点击「自动编写」或添加积木后预览',

      // Code
      'code.format': '格式化代码',
      'code.copy': '复制代码',

      // Debug
      'debug.run': '运行测试',
      'debug.clear': '清空',
      'debug.ready': '调试控制台已就绪。点击「运行测试」执行扩展代码。',

      // Modal
      'modal.exportTitle': '导出为 URL',
      'modal.exportDesc': '复制以下 URL 可分享给他人，对方打开即可导入你的扩展配置：',
      'modal.copyURL': '复制 URL',
      'modal.close': '关闭',

      // Toast messages
      'toast.inputDesc': '请输入积木描述',
      'toast.generating': '正在生成中，请稍候...',
      'toast.genSuccess': '生成成功！共 {n} 个积木',
      'toast.genFail': '生成失败: {msg}',
      'toast.genAborted': '已放弃生成',
      'toast.urlCopied': 'URL 已复制到剪贴板',
      'toast.colorReset': '已恢复默认颜色',
      'toast.blockSaved': '积木已保存',
      'toast.blockDeleted': '积木已删除',
      'toast.codeGenerated': '代码已自动生成',
      'toast.fileDownloaded': '文件已下载',
      'toast.importSuccess': '导入成功',
      'toast.importFail': '导入失败：无效的数据',
      'toast.codeFormatted': '代码已格式化',
      'toast.codeCopied': '代码已复制到剪贴板',
      'toast.fillOpcode': '请填写积木名称',
      'toast.snippetCopied': '代码片段已复制',

      // Snippets
      'snippets.title': '代码片段',
      'snippets.search': '搜索代码片段...',
      'snippets.extBlocks': '扩展积木',
      'snippets.scratchAPI': 'Scratch API',
      'snippets.jsBuiltins': 'JavaScript',
      'snippets.noBlocks': '暂无积木，请先添加或生成积木',
      'snippets.return': '返回值',
      'snippets.noReturn': '无返回值',
      'snippets.params': '参数',
      'snippets.noParams': '无参数',
      'snippets.copy': '复制',
      'snippets.copied': '已复制',

      // Debug messages
      'debug.executing': '正在执行扩展代码...',
      'debug.registerSuccess': '扩展 "{name}" 注册成功 (ID: {id})',
      'debug.blockCount': '包含 {n} 个积木',
      'debug.execSuccess': '  ✓ {name}() 执行成功',
      'debug.execResult': '  ✓ {name}() 执行成功 → {result}',
      'debug.execFail': '  ✗ {name}() 执行失败: {msg}',
      'debug.methodUndefined': '  ! {name} 方法未定义',
      'debug.done': '执行完成',
      'debug.error': '执行错误: {msg}',

      // Prompt
      'prompt.importURL': '请输入导入 URL 或 JSON 数据：',

      // Syntax Reference
      'ref.s1Title': '1. 扩展基本结构',
      'ref.s2Title': '2. 积木类型 (blockType)',
      'ref.s3Title': '3. 参数类型 (argumentType)',
      'ref.s4Title': '4. 积木颜色 (color)',
      'ref.s4Desc': '格式:',
      'ref.s5Title': '5. 显示文本 (text)',
      'ref.s5Desc': '用 <code>[参数名]</code> 插入参数占位符：',
      'ref.s6Title': '6. 参数定义 (arguments)',
      'ref.s7Title': '7. 函数实现 (方法体)',
      'ref.s8Title': '8. 常用 Scratch Runtime API',
      'ref.s9Title': '9. 完整示例',
      'ref.s10Title': '10. 加载扩展到 TurboWarp',
      'ref.s10Desc1': '方法一：',
      'ref.s10Desc1Text': ' 打开 <a href="https://turbowarp.org/editor" target="_blank" rel="noopener">turbowarp.org/editor</a> → 左下角「高级」→ 「加载未打包的扩展」→ 粘贴代码或选择 .js 文件',
      'ref.s10Desc2': '方法二：',
      'ref.s10Desc2Text': ' 将 .js 文件上传到可访问的 URL，在扩展URL栏填入该地址',
      'ref.s10Desc3': '方法三：',
      'ref.s10Desc3Text': ' 在编辑器地址栏后加 <code>#extension=URL</code> 参数自动加载',

      // Reference table headers
      'ref.thType': '类型',
      'ref.thDesc': '说明',
      'ref.thReturn': '返回值',
      'ref.thDefault': '默认值示例',

      // Reference table cells - block types
      'ref.btCommand': '指令块 - 执行操作',
      'ref.btReporter': '返回值块 - 返回字符串/数字',
      'ref.btBoolean': '布尔块 - 返回 true/false',
      'ref.btHat': '帽子块 - 事件触发',
      'ref.btConditional': '条件块 - 包含子栈',
      'ref.btLoop': '循环块 - 包含子栈',
      'ref.btButton': '按钮 - 点击触发',

      // Reference - argument types
      'ref.atString': '字符串输入框',
      'ref.atNumber': '数字输入框',
      'ref.atBoolean': '布尔判断（六边形）',
      'ref.atAngle': '角度选择器',
      'ref.atColor': '颜色选择器',
      'ref.atImage': '图片数据',
      'ref.atMatrix': '矩阵编辑器',
      'ref.atNote': '音符选择器',
      'ref.atImageNote': '需 dataURI 格式',

      // Reference - color names
      'ref.colorMotion': '运动',
      'ref.colorEvent': '事件',
      'ref.colorControl': '控制',
      'ref.colorDetect': '侦测',
      'ref.colorSound': '声音',
      'ref.colorPen': '画笔',
      'ref.colorData': '数据',
      'ref.colorOperator': '运算',

      // Language switcher
      'lang.switch': 'EN',
      'lang.current': '中文',

      // Server toggle
      'server.status': '后台服务',
      'server.running': '服务运行中',
      'server.stopped': '服务已停止',
      'server.starting': '启动中...',
      'server.stopping': '停止中...',
      'server.offline': 'Watcher 离线',

      // AI Warning
      'aiWarning.title': '⚠ AI 生成提醒',
      'aiWarning.desc': 'AI 生成内容仅用于辅助个人研发，请勿直接发布提交到扩展社区，请遵循 <a href="https://github.com/TurboWarp/extensions/blob/8b27fe92f4674e53e3c677a11e609c77254df08f/CONTRIBUTING.md" target="_blank" rel="noopener">contributing guidelines</a>。',
      'aiWarning.continue': '继续生成',
      'aiWarning.abort': '放弃生成'
    },

    en: {
      // Header
      'header.title': 'TurboWarp Extension Editor',
      'header.autoGenerate': 'Auto Generate',
      'header.autoGenerateTitle': 'Auto-generate code from the left panel config',
      'header.downloadJS': 'Download JS',
      'header.downloadJSTitle': 'Download as .js file',
      'header.exportURL': 'Export URL',
      'header.exportURLTitle': 'Generate a shareable URL',
      'header.importURL': 'Import URL',
      'header.importURLTitle': 'Import from URL',

      // AI Bar
      'ai.placeholder': 'Describe the blocks you want in natural language, e.g.: Create a calculator block that takes two numbers and returns their sum',
      'ai.generate': 'Generate',

      // Config Panel
      'config.extConfig': 'Extension Config',
      'config.basicInfo': 'Basic Info',
      'config.extId': 'Extension ID',
      'config.extIdPlaceholder': 'myextension (lowercase only)',
      'config.extName': 'Extension Name',
      'config.extColor': 'Extension UI Color',
      'config.resetColor': 'Reset to default color',
      'config.colorMotion': 'Motion (Blue)',
      'config.colorEvent': 'Events (Purple)',
      'config.colorControl': 'Control (Pink)',
      'config.colorDetect': 'Sensing (Yellow)',
      'config.colorSound': 'Sound (Rose)',
      'config.colorPen': 'Pen (Cyan)',
      'config.colorData': 'Data (Green)',
      'config.colorOperator': 'Operators (Orange)',
      'config.colorPrimary': 'Primary',
      'config.colorInner': 'Inner',
      'config.colorDark': 'Dark',
      'config.blockList': 'Block List',
      'config.addBlock': 'Add Block',

      // Block Editor
      'blockEditor.title': 'Edit Block',
      'blockEditor.opcode': 'Block Name (opcode)',
      'blockEditor.blockType': 'Block Type (blockType)',
      'blockEditor.typeCommand': 'Command (COMMAND)',
      'blockEditor.typeReporter': 'Reporter - returns string/number',
      'blockEditor.typeBoolean': 'Boolean - returns true/false',
      'blockEditor.typeHat': 'Hat Block (HAT)',
      'blockEditor.typeConditional': 'Conditional (CONDITIONAL)',
      'blockEditor.typeLoop': 'Loop (LOOP)',
      'blockEditor.typeButton': 'Button (BUTTON)',
      'blockEditor.text': 'Display Text (text)',
      'blockEditor.textHint': 'Use [argName] to define argument placeholders',
      'blockEditor.edgeActivated': 'Edge Activated (isEdgeActivated)',
      'blockEditor.argList': 'Arguments',
      'blockEditor.addArg': 'Add Argument',
      'blockEditor.argName': 'Argument name',
      'blockEditor.argTypeString': 'String',
      'blockEditor.argTypeNumber': 'Number',
      'blockEditor.argTypeBoolean': 'Boolean',
      'blockEditor.argDefault': 'Default',
      'blockEditor.blockColor': 'Block Color',
      'blockEditor.colorPrimary': 'Primary (lightest)',
      'blockEditor.colorInner': 'Inner (medium)',
      'blockEditor.colorDark': 'Dark (darkest)',
      'blockEditor.funcBody': 'Function Body (JS)',
      'blockEditor.returnExpr': 'Return Expression',
      'blockEditor.save': 'Save Block',
      'blockEditor.delete': 'Delete Block',
      'blockEditor.cancel': 'Cancel',

      // System Params
      'sys.title': 'System Info',
      'sys.platform': 'Platform',
      'sys.screen': 'Screen',
      'sys.lang': 'Language',
      'sys.online': 'Online',
      'sys.offline': 'Offline',
      'sys.cores': 'CPU Cores',
      'sys.memory': 'Memory',

      // Tabs
      'tabs.preview': 'Block Preview',
      'tabs.code': 'Code Editor',
      'tabs.debug': 'Debug Console',
      'tabs.reference': 'Reference',

      // Preview
      'preview.refresh': 'Refresh Preview',
      'preview.hint': 'Preview block appearance (color, shape, text)',
      'preview.empty': 'Click "Auto Generate" or add blocks to preview',

      // Code
      'code.format': 'Format Code',
      'code.copy': 'Copy Code',

      // Debug
      'debug.run': 'Run Test',
      'debug.clear': 'Clear',
      'debug.ready': 'Debug console ready. Click "Run Test" to execute extension code.',

      // Modal
      'modal.exportTitle': 'Export as URL',
      'modal.exportDesc': 'Copy the URL below to share with others. They can import your extension config by opening it:',
      'modal.copyURL': 'Copy URL',
      'modal.close': 'Close',

      // Toast messages
      'toast.inputDesc': 'Please enter a block description',
      'toast.generating': 'Generating, please wait...',
      'toast.genSuccess': 'Generation complete! {n} block(s) created',
      'toast.genFail': 'Generation failed: {msg}',
      'toast.genAborted': 'Generation aborted',
      'toast.urlCopied': 'URL copied to clipboard',
      'toast.colorReset': 'Color reset to default',
      'toast.blockSaved': 'Block saved',
      'toast.blockDeleted': 'Block deleted',
      'toast.codeGenerated': 'Code auto-generated',
      'toast.fileDownloaded': 'File downloaded',
      'toast.importSuccess': 'Import successful',
      'toast.importFail': 'Import failed: invalid data',
      'toast.codeFormatted': 'Code formatted',
      'toast.codeCopied': 'Code copied to clipboard',
      'toast.fillOpcode': 'Please fill in the block name',
      'toast.snippetCopied': 'Snippet copied',

      // Snippets
      'snippets.title': 'Code Snippets',
      'snippets.search': 'Search snippets...',
      'snippets.extBlocks': 'Extension Blocks',
      'snippets.scratchAPI': 'Scratch API',
      'snippets.jsBuiltins': 'JavaScript',
      'snippets.noBlocks': 'No blocks yet. Add or generate blocks first',
      'snippets.return': 'Return',
      'snippets.noReturn': 'No return',
      'snippets.params': 'Params',
      'snippets.noParams': 'No params',
      'snippets.copy': 'Copy',
      'snippets.copied': 'Copied',

      // Debug messages
      'debug.executing': 'Executing extension code...',
      'debug.registerSuccess': 'Extension "{name}" registered (ID: {id})',
      'debug.blockCount': 'Contains {n} block(s)',
      'debug.execSuccess': '  ✓ {name}() executed successfully',
      'debug.execResult': '  ✓ {name}() executed successfully → {result}',
      'debug.execFail': '  ✗ {name}() failed: {msg}',
      'debug.methodUndefined': '  ! {name} method not defined',
      'debug.done': 'Execution complete',
      'debug.error': 'Execution error: {msg}',

      // Prompt
      'prompt.importURL': 'Enter import URL or JSON data:',

      // Syntax Reference
      'ref.s1Title': '1. Extension Basic Structure',
      'ref.s2Title': '2. Block Types (blockType)',
      'ref.s3Title': '3. Argument Types (argumentType)',
      'ref.s4Title': '4. Block Colors (color)',
      'ref.s4Desc': 'Format:',
      'ref.s5Title': '5. Display Text (text)',
      'ref.s5Desc': 'Use <code>[argName]</code> to insert argument placeholders:',
      'ref.s6Title': '6. Argument Definitions (arguments)',
      'ref.s7Title': '7. Function Implementation (method body)',
      'ref.s8Title': '8. Common Scratch Runtime APIs',
      'ref.s9Title': '9. Complete Example',
      'ref.s10Title': '10. Loading Extensions in TurboWarp',
      'ref.s10Desc1': 'Method 1:',
      'ref.s10Desc1Text': ' Open <a href="https://turbowarp.org/editor" target="_blank" rel="noopener">turbowarp.org/editor</a> → bottom-left "Advanced" → "Load unpacked extension" → paste code or select .js file',
      'ref.s10Desc2': 'Method 2:',
      'ref.s10Desc2Text': ' Upload the .js file to an accessible URL and enter it in the extension URL field',
      'ref.s10Desc3': 'Method 3:',
      'ref.s10Desc3Text': ' Add <code>#extension=URL</code> parameter after the editor URL to auto-load',

      // Reference table headers
      'ref.thType': 'Type',
      'ref.thDesc': 'Description',
      'ref.thReturn': 'Return',
      'ref.thDefault': 'Default Example',

      // Reference table cells - block types
      'ref.btCommand': 'Command - executes an action',
      'ref.btReporter': 'Reporter - returns string/number',
      'ref.btBoolean': 'Boolean - returns true/false',
      'ref.btHat': 'Hat - event trigger',
      'ref.btConditional': 'Conditional - contains substack',
      'ref.btLoop': 'Loop - contains substack',
      'ref.btButton': 'Button - click to trigger',

      // Reference - argument types
      'ref.atString': 'String input',
      'ref.atNumber': 'Number input',
      'ref.atBoolean': 'Boolean check (hexagon)',
      'ref.atAngle': 'Angle picker',
      'ref.atColor': 'Color picker',
      'ref.atImage': 'Image data',
      'ref.atMatrix': 'Matrix editor',
      'ref.atNote': 'Note picker',
      'ref.atImageNote': 'Requires dataURI format',

      // Reference - color names
      'ref.colorMotion': 'Motion',
      'ref.colorEvent': 'Events',
      'ref.colorControl': 'Control',
      'ref.colorDetect': 'Sensing',
      'ref.colorSound': 'Sound',
      'ref.colorPen': 'Pen',
      'ref.colorData': 'Data',
      'ref.colorOperator': 'Operators',

      // Language switcher
      'lang.switch': '中',
      'lang.current': 'English',

      // Server toggle
      'server.status': 'Backend',
      'server.running': 'Running',
      'server.stopped': 'Stopped',
      'server.starting': 'Starting...',
      'server.stopping': 'Stopping...',
      'server.offline': 'Watcher Offline',

      // AI Warning
      'aiWarning.title': '⚠ AI Generation Notice',
      'aiWarning.desc': 'AI-generated content is for personal development assistance only. Do not directly publish or submit to the extension community. Please follow the <a href="https://github.com/TurboWarp/extensions/blob/8b27fe92f4674e53e3c677a11e609c77254df08f/CONTRIBUTING.md" target="_blank" rel="noopener">contributing guidelines</a>.',
      'aiWarning.continue': 'Continue',
      'aiWarning.abort': 'Abort'
    }
  };

  let currentLang = 'zh';

  function t(key, params) {
    const dict = translations[currentLang] || translations.zh;
    let text = dict[key] || translations.zh[key] || key;
    if (params) {
      Object.keys(params).forEach(k => {
        text = text.replace(new RegExp('\\{' + k + '\\}', 'g'), params[k]);
      });
    }
    return text;
  }

  function applyTranslations() {
    // Text content
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      el.textContent = t(key);
    });

    // InnerHTML (for references with HTML)
    document.querySelectorAll('[data-i18n-html]').forEach(el => {
      const key = el.getAttribute('data-i18n-html');
      el.innerHTML = t(key);
    });

    // Placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
      const key = el.getAttribute('data-i18n-placeholder');
      el.placeholder = t(key);
    });

    // Titles
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
      const key = el.getAttribute('data-i18n-title');
      el.title = t(key);
    });

    // Update html lang attribute
    document.documentElement.lang = currentLang === 'zh' ? 'zh-CN' : 'en';

    // Update page title
    document.title = t('header.title');

    // Update language switcher display
    const langOpts = document.querySelectorAll('#btn-lang-switch .lang-opt');
    langOpts.forEach(el => {
      el.classList.toggle('lang-active', el.dataset.lang === currentLang);
    });
  }

  function setLang(lang) {
    if (lang !== 'zh' && lang !== 'en') return;
    currentLang = lang;
    try {
      localStorage.setItem('tw-ext-lang', lang);
    } catch (e) {}
    applyTranslations();
  }

  function getLang() {
    return currentLang;
  }

  function initLang() {
    let saved = null;
    try {
      saved = localStorage.getItem('tw-ext-lang');
    } catch (e) {}
    if (saved === 'zh' || saved === 'en') {
      currentLang = saved;
    } else {
      // Auto-detect from browser
      const browserLang = (navigator.language || navigator.userLanguage || '').toLowerCase();
      currentLang = browserLang.startsWith('zh') ? 'zh' : 'en';
    }
  }

  // Expose globally
  window.i18n = { t, applyTranslations, setLang, getLang, initLang };
})();
