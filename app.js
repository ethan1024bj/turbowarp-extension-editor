// ==================== State ====================
const state = {
  extId: 'myextension',
  extName: 'My Extension',
  extColor1: '#4C97FF',
  extColor2: '#3373CC',
  extColor3: '#295FA8',
  blocks: [],
  editingIndex: -1,
  cm: null
};

// ==================== Init ====================
document.addEventListener('DOMContentLoaded', () => {
  i18n.initLang();
  i18n.applyTranslations();
  initCodeMirror();
  initTabs();
  initColorSync();
  initSysParams();
  initButtons();
  initAI();
  initKeyboardShortcuts();
  initImportFromURL();
  loadFromLocalStorage();
  renderBlockList();
  renderSnippets();
  refreshPreview();
  syncCodeFromState();
});

// ==================== Keyboard Shortcuts ====================
function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Ctrl+S: Download JS
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      downloadJS();
    }
    // Ctrl+Enter: Auto-generate
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      autoGenerate();
    }
    // Ctrl+Shift+C: Copy code
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault();
      copyCode();
    }
    // Escape: Close modal / block editor
    if (e.key === 'Escape') {
      document.getElementById('url-modal').style.display = 'none';
      closeBlockEditor();
    }
  });
}

// ==================== CodeMirror ====================
function initCodeMirror() {
  state.cm = CodeMirror.fromTextArea(document.getElementById('code-editor'), {
    mode: 'javascript',
    theme: 'monokai',
    lineNumbers: true,
    tabSize: 2,
    indentWithTabs: false,
    lineWrapping: true,
    matchBrackets: true,
    autoCloseBrackets: true,
    extraKeys: { 'Ctrl-Space': 'autocomplete' }
  });
  state.cm.on('change', () => {
    saveToLocalStorage();
  });
  initAutocomplete();
}

// ==================== Tabs ====================
function initTabs() {
  document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
      tab.classList.add('active');
      document.getElementById(tab.dataset.tab).classList.add('active');
      if (tab.dataset.tab === 'tab-code') {
        setTimeout(() => state.cm.refresh(), 50);
      }
    });
  });
}

// ==================== Color Sync ====================
function initColorSync() {
  const levels = ['color1', 'color2', 'color3'];
  const defaultColors = { color1: '#4C97FF', color2: '#3373CC', color3: '#295FA8' };

  levels.forEach(level => {
    const picker = document.getElementById(`blk-${level}-picker`);
    const textInput = document.getElementById(`blk-${level}`);
    const preview = document.getElementById(`blk-${level}-preview`);

    picker.addEventListener('input', () => {
      textInput.value = picker.value.toUpperCase();
      preview.style.background = picker.value;
    });
    textInput.addEventListener('input', () => {
      const match = textInput.value.match(/#[0-9a-fA-F]{6}/i);
      if (match) {
        picker.value = match[0];
        preview.style.background = match[0];
      }
    });
  });

  document.querySelectorAll('.color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const base = btn.dataset.color;
      setThreeColors(base);
    });
  });
}

function setThreeColors(baseColor) {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const color1 = baseColor.toUpperCase();
  const color2 = darken(r, g, b, 0.8);
  const color3 = darken(r, g, b, 0.6);

  ['color1', 'color2', 'color3'].forEach((level, i) => {
    const c = [color1, color2, color3][i];
    document.getElementById(`blk-${level}-picker`).value = c;
    document.getElementById(`blk-${level}`).value = c;
    document.getElementById(`blk-${level}-preview`).style.background = c;
  });
}

function darken(r, g, b, factor) {
  const nr = Math.round(r * factor);
  const ng = Math.round(g * factor);
  const nb = Math.round(b * factor);
  return '#' + [nr, ng, nb].map(v => v.toString(16).padStart(2, '0')).join('').toUpperCase();
}

function setExtThreeColors(baseColor) {
  const hex = baseColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  const color1 = baseColor.toUpperCase();
  const color2 = darken(r, g, b, 0.8);
  const color3 = darken(r, g, b, 0.6);

  ['ext-color1', 'ext-color2', 'ext-color3'].forEach((id, i) => {
    const c = [color1, color2, color3][i];
    document.getElementById(id).value = c;
    state[id.replace('-', '')] = c;
  });
  saveToLocalStorage();
}

// ==================== System Params ====================
function initSysParams() {
  const nav = navigator;
  document.getElementById('sys-platform').textContent = nav.platform || '-';
  document.getElementById('sys-screen').textContent = `${screen.width}x${screen.height}`;
  document.getElementById('sys-lang').textContent = nav.language || '-';
  document.getElementById('sys-online').textContent = nav.onLine ? i18n.t('sys.online') : i18n.t('sys.offline');
  document.getElementById('sys-cores').textContent = nav.hardwareConcurrency || '-';
  document.getElementById('sys-memory').textContent = nav.deviceMemory ? `${nav.deviceMemory} GB` : '-';
}

// ==================== AI Generate ====================
function initAI() {
  const input = document.getElementById('ai-input');
  const btn = document.getElementById('btn-ai-generate');

  // Auto-resize textarea
  input.addEventListener('input', () => {
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 120) + 'px';
  });

  // Ctrl+Enter to generate
  input.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      callAI();
    }
  });

  btn.addEventListener('click', callAI);
}

async function callAI() {
  const input = document.getElementById('ai-input');
  const btn = document.getElementById('btn-ai-generate');
  const status = document.getElementById('ai-status');
  const prompt = input.value.trim();
  if (!prompt) { toast(i18n.t('toast.inputDesc')); return; }

  btn.disabled = true;
  status.style.display = 'block';
  status.className = 'ai-status loading';
  status.textContent = i18n.t('toast.generating');

  try {
    const resp = await fetch('/api/generate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt })
    });

    if (!resp.ok) {
      const err = await resp.json();
      throw new Error(err.error || `HTTP ${resp.status}`);
    }

    const data = await resp.json();

    // Apply to state
    state.extId = data.extId || state.extId;
    state.extName = data.extName || state.extName;
    state.extColor1 = data.extColor1 || state.extColor1;
    state.extColor2 = data.extColor2 || state.extColor2;
    state.extColor3 = data.extColor3 || state.extColor3;
    state.blocks = data.blocks || [];

    document.getElementById('ext-id').value = state.extId;
    document.getElementById('ext-name').value = state.extName;
    document.getElementById('ext-color1').value = state.extColor1;
    document.getElementById('ext-color2').value = state.extColor2;
    document.getElementById('ext-color3').value = state.extColor3;

    renderBlockList();
    renderSnippets();
    refreshPreview();
    syncCodeFromState();
    saveToLocalStorage();

    status.className = 'ai-status success';
    status.textContent = i18n.t('toast.genSuccess', { n: state.blocks.length });
    setTimeout(() => { status.style.display = 'none'; }, 4000);
  } catch (err) {
    status.className = 'ai-status error';
    status.textContent = i18n.t('toast.genFail', { msg: err.message });
  } finally {
    btn.disabled = false;
  }
}

// ==================== Buttons ====================
function initButtons() {
  document.getElementById('btn-add-block').addEventListener('click', () => openBlockEditor(-1));
  document.getElementById('btn-save-block').addEventListener('click', saveBlock);
  document.getElementById('btn-delete-block').addEventListener('click', deleteBlock);
  document.getElementById('btn-cancel-block').addEventListener('click', closeBlockEditor);
  document.getElementById('btn-add-arg').addEventListener('click', addArg);
  document.getElementById('btn-auto-generate').addEventListener('click', autoGenerate);
  document.getElementById('btn-download').addEventListener('click', downloadJS);
  document.getElementById('btn-export-url').addEventListener('click', exportURL);
  document.getElementById('btn-import-url').addEventListener('click', importFromURL);
  document.getElementById('btn-refresh-preview').addEventListener('click', refreshPreview);
  document.getElementById('btn-format-code').addEventListener('click', formatCode);
  document.getElementById('btn-copy-code').addEventListener('click', copyCode);
  document.getElementById('btn-run-debug').addEventListener('click', runDebug);
  document.getElementById('btn-clear-debug').addEventListener('click', () => {
    document.getElementById('debug-output').innerHTML = '';
  });
  document.getElementById('btn-copy-url').addEventListener('click', () => {
    const ta = document.getElementById('url-output');
    ta.select();
    document.execCommand('copy');
    toast(i18n.t('toast.urlCopied'));
  });
  document.getElementById('btn-close-modal').addEventListener('click', () => {
    document.getElementById('url-modal').style.display = 'none';
  });

  // Language switcher
  document.getElementById('btn-lang-switch').addEventListener('click', () => {
    const newLang = i18n.getLang() === 'zh' ? 'en' : 'zh';
    i18n.setLang(newLang);
    // Re-render dynamic content
    initSysParams();
    renderBlockList();
    renderSnippets();
    renderArgs(collectArgs());
  });

  document.getElementById('blk-blockType').addEventListener('change', (e) => {
    const isReporter = e.target.value.includes('REPORTER');
    document.getElementById('return-group').style.display = isReporter ? 'block' : 'block';
  });

  document.getElementById('ext-id').addEventListener('input', (e) => { state.extId = e.target.value; saveToLocalStorage(); });
  document.getElementById('ext-name').addEventListener('input', (e) => { state.extName = e.target.value; saveToLocalStorage(); });
  ['ext-color1', 'ext-color2', 'ext-color3'].forEach(id => {
    document.getElementById(id).addEventListener('input', (e) => {
      state[id.replace('-', '')] = e.target.value.toUpperCase();
      saveToLocalStorage();
    });
  });

  // Extension color presets
  document.querySelectorAll('.ext-color-preset').forEach(btn => {
    btn.addEventListener('click', () => {
      const base = btn.dataset.color;
      setExtThreeColors(base);
    });
  });

  // Reset ext colors to default
  document.getElementById('btn-ext-color-default').addEventListener('click', () => {
    setExtThreeColors('#4C97FF');
    toast(i18n.t('toast.colorReset'));
  });
}

// ==================== Block Editor ====================
function openBlockEditor(index) {
  state.editingIndex = index;
  const section = document.getElementById('block-editor-section');
  section.style.display = 'block';

  if (index >= 0) {
    const blk = state.blocks[index];
    document.getElementById('blk-opcode').value = blk.opcode;
    document.getElementById('blk-blockType').value = blk.blockType;
    document.getElementById('blk-text').value = blk.text;
    document.getElementById('blk-isEdgeActivated').checked = !!blk.isEdgeActivated;
    document.getElementById('blk-function').value = blk.funcBody || '';
    document.getElementById('blk-return').value = blk.returnExpr || '';

    // Load 3-level colors
    const c1 = blk.color1 || '#4C97FF';
    const c2 = blk.color2 || '#3373CC';
    const c3 = blk.color3 || '#295FA8';
    ['color1', 'color2', 'color3'].forEach((level, i) => {
      const c = [c1, c2, c3][i];
      document.getElementById(`blk-${level}-picker`).value = c;
      document.getElementById(`blk-${level}`).value = c.toUpperCase();
      document.getElementById(`blk-${level}-preview`).style.background = c;
    });

    renderArgs(blk.args || []);
  } else {
    document.getElementById('blk-opcode').value = '';
    document.getElementById('blk-blockType').value = 'Scratch.BlockType.COMMAND';
    document.getElementById('blk-text').value = '';
    document.getElementById('blk-isEdgeActivated').checked = false;
    document.getElementById('blk-function').value = '';
    document.getElementById('blk-return').value = '';

    // Reset colors to default
    setThreeColors('#4C97FF');
    renderArgs([]);
  }
}

function closeBlockEditor() {
  state.editingIndex = -1;
  document.getElementById('block-editor-section').style.display = 'none';
}

function saveBlock() {
  const opcode = document.getElementById('blk-opcode').value.trim();
  if (!opcode) { toast(i18n.t('toast.fillOpcode')); return; }

  const blk = {
    opcode,
    blockType: document.getElementById('blk-blockType').value,
    text: document.getElementById('blk-text').value,
    color1: document.getElementById('blk-color1').value.toUpperCase(),
    color2: document.getElementById('blk-color2').value.toUpperCase(),
    color3: document.getElementById('blk-color3').value.toUpperCase(),
    isEdgeActivated: document.getElementById('blk-isEdgeActivated').checked,
    args: collectArgs(),
    funcBody: document.getElementById('blk-function').value,
    returnExpr: document.getElementById('blk-return').value
  };

  if (state.editingIndex >= 0) {
    state.blocks[state.editingIndex] = blk;
  } else {
    state.blocks.push(blk);
  }

  saveToLocalStorage();
  renderBlockList();
  renderSnippets();
  closeBlockEditor();
  refreshPreview();
  syncCodeFromState();
  toast(i18n.t('toast.blockSaved'));
}

function deleteBlock() {
  if (state.editingIndex >= 0) {
    state.blocks.splice(state.editingIndex, 1);
    saveToLocalStorage();
    renderBlockList();
    renderSnippets();
    closeBlockEditor();
    refreshPreview();
    syncCodeFromState();
    toast(i18n.t('toast.blockDeleted'));
  }
}

// ==================== Arguments ====================
function renderArgs(args) {
  const container = document.getElementById('arg-list');
  container.innerHTML = '';
  args.forEach((arg, i) => {
    const div = document.createElement('div');
    div.className = 'arg-item';
    div.innerHTML = `
      <input type="text" class="arg-name" value="${arg.name}" placeholder="${i18n.t('blockEditor.argName')}">
      <select class="arg-type">
        <option value="string" ${arg.type==='string'?'selected':''}>${i18n.t('blockEditor.argTypeString')}</option>
        <option value="number" ${arg.type==='number'?'selected':''}>${i18n.t('blockEditor.argTypeNumber')}</option>
        <option value="boolean" ${arg.type==='boolean'?'selected':''}>${i18n.t('blockEditor.argTypeBoolean')}</option>
      </select>
      <input type="text" class="arg-default" value="${arg.defaultValue||''}" placeholder="${i18n.t('blockEditor.argDefault')}" style="width:70px">
      <button class="arg-remove" onclick="removeArg(this)">×</button>
    `;
    container.appendChild(div);
  });
}

function addArg() {
  const container = document.getElementById('arg-list');
  const div = document.createElement('div');
  div.className = 'arg-item';
  div.innerHTML = `
    <input type="text" class="arg-name" value="" placeholder="${i18n.t('blockEditor.argName')}">
    <select class="arg-type">
      <option value="string">${i18n.t('blockEditor.argTypeString')}</option>
      <option value="number">${i18n.t('blockEditor.argTypeNumber')}</option>
      <option value="boolean">${i18n.t('blockEditor.argTypeBoolean')}</option>
    </select>
    <input type="text" class="arg-default" value="" placeholder="${i18n.t('blockEditor.argDefault')}" style="width:70px">
    <button class="arg-remove" onclick="removeArg(this)">×</button>
  `;
  container.appendChild(div);
}

window.removeArg = function(btn) {
  btn.closest('.arg-item').remove();
};

function collectArgs() {
  const items = document.querySelectorAll('#arg-list .arg-item');
  const args = [];
  items.forEach(item => {
    const name = item.querySelector('.arg-name').value.trim();
    const type = item.querySelector('.arg-type').value;
    const defaultValue = item.querySelector('.arg-default').value;
    if (name) args.push({ name, type, defaultValue });
  });
  return args;
}

// ==================== Block List ====================
function renderBlockList() {
  const container = document.getElementById('block-list');
  container.innerHTML = '';
  state.blocks.forEach((blk, i) => {
    const div = document.createElement('div');
    div.className = 'block-item' + (state.editingIndex === i ? ' active' : '');
    const color = blk.color1 || '#4C97FF';
    const typeShort = blk.blockType.split('.').pop();
    div.innerHTML = `
      <span class="block-dot" style="background:${color}"></span>
      <span class="block-name">${blk.opcode}</span>
      <span class="block-type">${typeShort}</span>
    `;
    div.addEventListener('click', () => openBlockEditor(i));
    container.appendChild(div);
  });
}

// ==================== Block Preview ====================
function refreshPreview() {
  const area = document.getElementById('block-preview');
  if (state.blocks.length === 0) {
    area.innerHTML = `<div class="preview-empty">${i18n.t('preview.empty')}</div>`;
    return;
  }
  area.innerHTML = '';
  state.blocks.forEach(blk => {
    const typeClass = getBlockClass(blk.blockType);
    const bgColor = blk.color1 || '#4C97FF';

    const el = document.createElement('div');
    el.className = `tw-block ${typeClass}`;

    // Notch connectors for stacking blocks
    if (typeClass === 'command' || typeClass === 'loop' || typeClass === 'conditional') {
      const notchTop = document.createElement('div');
      notchTop.className = 'tw-notch-top';
      notchTop.style.background = bgColor;
      el.appendChild(notchTop);

      const notchBot = document.createElement('div');
      notchBot.className = 'tw-notch-bottom';
      notchBot.style.background = bgColor;
      el.appendChild(notchBot);
    }

    // Main shape
    const shape = document.createElement('div');
    shape.className = 'tw-shape';
    shape.style.background = bgColor;

    // Parse text and build label + args
    const parts = parseTextWithArgs(blk.text, blk.args);
    parts.forEach(part => {
      if (part.type === 'label') {
        const span = document.createElement('span');
        span.className = 'tw-label';
        span.textContent = part.text;
        shape.appendChild(span);
      } else {
        const argSpan = document.createElement('span');
        const argDef = (blk.args || []).find(a => a.name === part.name);
        const argType = argDef ? argDef.type : 'string';
        argSpan.className = `tw-arg ${argType}-arg`;
        argSpan.textContent = argDef ? (argDef.defaultValue || part.name) : part.name;
        shape.appendChild(argSpan);
      }
    });

    el.appendChild(shape);
    area.appendChild(el);
  });
}

function getBlockClass(blockType) {
  if (blockType.includes('COMMAND')) return 'command';
  if (blockType.includes('REPORTER')) return 'reporter';
  if (blockType.includes('BOOLEAN')) return 'boolean';
  if (blockType.includes('HAT')) return 'hat';
  if (blockType.includes('CONDITIONAL')) return 'c-block';
  if (blockType.includes('LOOP')) return 'c-block';
  if (blockType.includes('BUTTON')) return 'command';
  return 'command';
}

function parseTextWithArgs(text, args) {
  const parts = [];
  const regex = /\[([^\]]+)\]/g;
  let lastIndex = 0;
  let match;
  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'label', text: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'arg', name: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'label', text: text.slice(lastIndex) });
  }
  return parts;
}

// ==================== Code Generation ====================
function generateCode() {
  const id = toLowerCaseId(state.extId || 'myextension');
  const name = state.extName || 'My Extension';
  const className = toClassName(id);

  let blocksCode = '';
  state.blocks.forEach((blk, i) => {
    const argsCode = generateArgsCode(blk);
    const edgeLine = blk.isEdgeActivated ? `,\n                isEdgeActivated: true` : '';
    const comma = i < state.blocks.length - 1 ? ',' : '';

    const c1 = blk.color1 || '#4C97FF';
    const c2 = blk.color2 || '#3373CC';
    const c3 = blk.color3 || '#295FA8';
    blocksCode += `            {
                opcode: '${blk.opcode}',
                blockType: ${blk.blockType},
                text: '${escapeQuote(blk.text)}',
                color1: '${c1}',
                color2: '${c2}',
                color3: '${c3}'${argsCode ? `,\n                arguments: {\n${argsCode}                }` : ''}${edgeLine}
            }${comma}\n`;
  });

  const methodsCode = state.blocks.map(blk => generateMethodCode(blk)).join('\n\n');

  return `class ${className} {
    getInfo() {
        return {
            id: '${id}',
            name: '${name}',
            color1: '${state.extColor1 || '#4C97FF'}',
            color2: '${state.extColor2 || '#3373CC'}',
            color3: '${state.extColor3 || '#295FA8'}',
            blocks: [
${blocksCode}            ]
        };
    }

${methodsCode}
}

Scratch.extensions.register(new ${className}());`;
}

function generateArgsCode(blk) {
  if (!blk.args || blk.args.length === 0) return '';
  return blk.args.map((arg, i) => {
    const comma = i < blk.args.length - 1 ? ',' : '';
    let argDef = `                    ${arg.name}: {\n`;
    argDef += `                        type: ${getArgType(arg.type)}`;
    if (arg.defaultValue) {
      argDef += `,\n                        defaultValue: '${escapeQuote(arg.defaultValue)}'`;
    }
    argDef += `\n                    }${comma}`;
    return argDef;
  }).join('\n') + '\n';
}

function getArgType(type) {
  switch (type) {
    case 'number': return 'Scratch.ArgumentType.NUMBER';
    case 'boolean': return 'Scratch.ArgumentType.BOOLEAN';
    default: return 'Scratch.ArgumentType.STRING';
  }
}

function generateMethodCode(blk) {
  const params = (blk.args || []).map(a => a.name).join(', ');
  let body = blk.funcBody || '';
  if (!body.trim()) {
    body = `        // ${blk.opcode}`;
  } else {
    body = body.split('\n').map(line => {
      const trimmed = line.trimStart();
      return trimmed ? '        ' + trimmed : '';
    }).join('\n');
  }
  const returnLine = blk.returnExpr ? `\n        ${blk.returnExpr}` : '';
  return `    ${blk.opcode}({${params}}) {
${body}${returnLine}
    }`;
}

function toLowerCaseId(id) {
  return id.toLowerCase().replace(/[^a-z0-9]/g, '').replace(/^[^a-z]/, 'ext');
}

function toClassName(id) {
  return id.replace(/(^|_)(\w)/g, (_, _p, c) => c.toUpperCase());
}

function escapeQuote(str) {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'");
}

// ==================== Auto Generate ====================
function autoGenerate() {
  syncCodeFromState();
  refreshPreview();
  // Switch to code tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
  document.querySelector('[data-tab="tab-code"]').classList.add('active');
  document.getElementById('tab-code').classList.add('active');
  setTimeout(() => state.cm.refresh(), 50);
  toast(i18n.t('toast.codeGenerated'));
}

function syncCodeFromState() {
  const code = generateCode();
  state.cm.setValue(code);
}

// ==================== Download ====================
function downloadJS() {
  const code = state.cm.getValue();
  const blob = new Blob([code], { type: 'application/javascript' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${state.extId || 'extension'}.js`;
  a.click();
  URL.revokeObjectURL(url);
  toast(i18n.t('toast.fileDownloaded'));
}

// ==================== URL Export/Import ====================
function exportURL() {
  const data = {
    extId: state.extId,
    extName: state.extName,
    extColor1: state.extColor1,
    extColor2: state.extColor2,
    extColor3: state.extColor3,
    blocks: state.blocks,
    code: state.cm.getValue()
  };
  const encoded = btoa(unescape(encodeURIComponent(JSON.stringify(data))));
  const url = window.location.origin + window.location.pathname + '#data=' + encoded;
  document.getElementById('url-output').value = url;
  document.getElementById('url-modal').style.display = 'flex';
}

function importFromURL() {
  const input = prompt(i18n.t('prompt.importURL'));
  if (!input) return;
  try {
    loadDataFromURL(input);
    toast(i18n.t('toast.importSuccess'));
  } catch (e) {
    toast(i18n.t('toast.importFail'));
  }
}

function initImportFromURL() {
  if (window.location.hash.startsWith('#data=')) {
    try {
      loadDataFromURL(window.location.hash);
    } catch (e) {
      console.error('Import failed:', e);
    }
  }
}

function loadDataFromURL(str) {
  let encoded = str;
  if (str.includes('#data=')) {
    encoded = str.split('#data=')[1];
  }
  const json = decodeURIComponent(escape(atob(encoded)));
  const data = JSON.parse(json);
  state.extId = data.extId || 'myextension';
  state.extName = data.extName || 'My Extension';
  state.extColor1 = data.extColor1 || '#4C97FF';
  state.extColor2 = data.extColor2 || '#3373CC';
  state.extColor3 = data.extColor3 || '#295FA8';
  state.blocks = data.blocks || [];
  document.getElementById('ext-id').value = state.extId;
  document.getElementById('ext-name').value = state.extName;
  document.getElementById('ext-color1').value = state.extColor1;
  document.getElementById('ext-color2').value = state.extColor2;
  document.getElementById('ext-color3').value = state.extColor3;
  renderBlockList();
  if (data.code) {
    state.cm.setValue(data.code);
  } else {
    syncCodeFromState();
  }
  refreshPreview();
  saveToLocalStorage();
}

// ==================== Format / Copy ====================
function formatCode() {
  let code = state.cm.getValue();
  // Normalize tabs to spaces
  code = code.replace(/\t/g, '  ');
  // Remove trailing whitespace per line
  code = code.split('\n').map(l => l.trimEnd()).join('\n');
  // Remove excessive blank lines (max 2 consecutive)
  code = code.replace(/\n{4,}/g, '\n\n\n');
  // Ensure file ends with single newline
  code = code.trimEnd() + '\n';
  state.cm.setValue(code);
  toast(i18n.t('toast.codeFormatted'));
}

function copyCode() {
  const code = state.cm.getValue();
  navigator.clipboard.writeText(code).then(() => {
    toast(i18n.t('toast.codeCopied'));
  }).catch(() => {
    // Fallback
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast(i18n.t('toast.codeCopied'));
  });
}

// ==================== Debug ====================
function runDebug() {
  const code = state.cm.getValue();

  logDebug('info', i18n.t('debug.executing'));

  // Intercept console.log/warn/error
  const origLog = console.log, origWarn = console.warn, origError = console.error;
  console.log = (...args) => { logDebug('log', '[log] ' + args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')); origLog.apply(console, args); };
  console.warn = (...args) => { logDebug('warn', '[warn] ' + args.join(' ')); origWarn.apply(console, args); };
  console.error = (...args) => { logDebug('error', '[error] ' + args.join(' ')); origError.apply(console, args); };

  try {
    const mockScratch = {
      extensions: { unsandboxed: true, register: function(ext) {
        logDebug('success', i18n.t('debug.registerSuccess', { name: ext.getInfo().name, id: ext.getInfo().id }));
        logDebug('info', i18n.t('debug.blockCount', { n: ext.getInfo().blocks.length }));

        ext.getInfo().blocks.forEach(blk => {
          if (typeof ext[blk.opcode] === 'function') {
            try {
              const args = {};
              if (blk.arguments) {
                Object.keys(blk.arguments).forEach(key => {
                  const arg = blk.arguments[key];
                  if (arg.type === 'Scratch.ArgumentType.NUMBER' || arg.type === 2) {
                    args[key] = arg.defaultValue ? Number(arg.defaultValue) : 0;
                  } else if (arg.type === 'Scratch.ArgumentType.BOOLEAN' || arg.type === 3) {
                    args[key] = false;
                  } else {
                    args[key] = arg.defaultValue || 'test';
                  }
                });
              }
              const result = ext[blk.opcode](args);
              if (result !== undefined) {
                logDebug('success', i18n.t('debug.execResult', { name: blk.opcode, result: result }));
              } else {
                logDebug('success', i18n.t('debug.execSuccess', { name: blk.opcode }));
              }
            } catch (err) {
              logDebug('error', i18n.t('debug.execFail', { name: blk.opcode, msg: err.message }));
            }
          } else {
            logDebug('warn', i18n.t('debug.methodUndefined', { name: blk.opcode }));
          }
        });
      }},
      BlockType: { COMMAND: 'Scratch.BlockType.COMMAND', REPORTER: 'Scratch.BlockType.REPORTER', BOOLEAN: 'Scratch.BlockType.BOOLEAN', HAT: 'Scratch.BlockType.HAT', CONDITIONAL: 'Scratch.BlockType.CONDITIONAL', LOOP: 'Scratch.BlockType.LOOP', BUTTON: 'Scratch.BlockType.BUTTON' },
      ArgumentType: { STRING: 'Scratch.ArgumentType.STRING', NUMBER: 'Scratch.ArgumentType.NUMBER', BOOLEAN: 'Scratch.ArgumentType.BOOLEAN', ANGLE: 'Scratch.ArgumentType.ANGLE', COLOR: 'Scratch.ArgumentType.COLOR', IMAGE: 'Scratch.ArgumentType.IMAGE', MATRIX: 'Scratch.ArgumentType.MATRIX', NOTE: 'Scratch.ArgumentType.NOTE' }
    };

    // Wrap code to provide Scratch in scope
    const wrappedCode = `(function(Scratch) { ${code} })(mockScratch);`;
    const fn = new Function('mockScratch', wrappedCode);
    fn(mockScratch);
    logDebug('info', i18n.t('debug.done'));
  } catch (err) {
    logDebug('error', i18n.t('debug.error', { msg: err.message }));
    if (err.stack) logDebug('error', err.stack);
  } finally {
    console.log = origLog;
    console.warn = origWarn;
    console.error = origError;
  }
}

function logDebug(type, msg) {
  const output = document.getElementById('debug-output');
  const line = document.createElement('div');
  line.className = `debug-line debug-${type}`;
  line.textContent = msg;
  output.appendChild(line);
  output.scrollTop = output.scrollHeight;
}

// ==================== Code Snippets ====================
const scratchAPISnippets = [
  // BlockType
  { category: 'api', code: 'Scratch.BlockType.COMMAND', desc_zh: '指令块 - 执行操作，无返回值', desc_en: 'Command block - executes action, no return', type: 'COMMAND', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.REPORTER', desc_zh: '返回值块 - 返回字符串或数字', desc_en: 'Reporter block - returns string/number', type: 'REPORTER', hasReturn: true, returnType: 'string/number', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.BOOLEAN', desc_zh: '布尔块 - 返回 true 或 false', desc_en: 'Boolean block - returns true/false', type: 'BOOLEAN', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.HAT', desc_zh: '帽子块 - 事件触发', desc_en: 'Hat block - event trigger', type: 'HAT', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.CONDITIONAL', desc_zh: '条件块 - 包含子栈', desc_en: 'Conditional block - contains substack', type: 'CONDITIONAL', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.LOOP', desc_zh: '循环块 - 包含子栈', desc_en: 'Loop block - contains substack', type: 'LOOP', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.BlockType.BUTTON', desc_zh: '按钮 - 点击触发回调', desc_en: 'Button - click to trigger callback', type: 'BUTTON', hasReturn: false, returnType: '—', hasParams: false },

  // ArgumentType
  { category: 'api', code: 'Scratch.ArgumentType.STRING', desc_zh: '字符串输入框', desc_en: 'String input field', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.NUMBER', desc_zh: '数字输入框', desc_en: 'Number input field', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.BOOLEAN', desc_zh: '布尔判断（六边形）', desc_en: 'Boolean check (hexagon)', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.ANGLE', desc_zh: '角度选择器', desc_en: 'Angle picker', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.COLOR', desc_zh: '颜色选择器', desc_en: 'Color picker', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.IMAGE', desc_zh: '图片数据（需 dataURI）', desc_en: 'Image data (requires dataURI)', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.MATRIX', desc_zh: '矩阵编辑器', desc_en: 'Matrix editor', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.ArgumentType.NOTE', desc_zh: '音符选择器', desc_en: 'Note picker', type: 'API', hasReturn: false, returnType: '—', hasParams: false },

  // Runtime API
  { category: 'api', code: 'Scratch.vm.runtime.targets[0].x', desc_zh: '获取角色 X 坐标', desc_en: 'Get sprite X position', type: 'API', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'api', code: 'Scratch.vm.runtime.targets[0].y', desc_zh: '获取角色 Y 坐标', desc_en: 'Get sprite Y position', type: 'API', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'api', code: 'Scratch.vm.runtime.targets[0].direction', desc_zh: '获取角色方向', desc_en: 'Get sprite direction', type: 'API', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'api', code: 'Scratch.vm.runtime.targets[0].setVisible(false)', desc_zh: '隐藏角色', desc_en: 'Hide sprite', type: 'API', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'api', code: 'Scratch.vm.runtime.ioDevices.clock.projectTimer()', desc_zh: '获取项目计时器', desc_en: 'Get project timer', type: 'API', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'api', code: "Scratch.vm.runtime.ioDevices.keyboard.isKeyDown('space')", desc_zh: '检测键盘按键是否按下', desc_en: 'Check if key is pressed', type: 'API', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'api', code: "Scratch.vm.runtime.ioDevices.cloud.requestUpdateVariable('var', 123)", desc_zh: '发送云变量消息', desc_en: 'Send cloud variable message', type: 'API', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'api', code: 'Scratch.extensions.unsandboxed', desc_zh: '检查是否为非沙盒模式', desc_en: 'Check if unsandboxed mode', type: 'API', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'api', code: 'Scratch.extensions.register(new MyExtension())', desc_zh: '注册扩展实例', desc_en: 'Register extension instance', type: 'API', hasReturn: false, returnType: '—', hasParams: true },
];

const jsSnippets = [
  { category: 'js', code: "console.log()", desc_zh: '输出日志到控制台', desc_en: 'Log to console', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'js', code: "console.warn()", desc_zh: '输出警告信息', desc_en: 'Log warning', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'js', code: "console.error()", desc_zh: '输出错误信息', desc_en: 'Log error', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'js', code: "JSON.parse()", desc_zh: '解析 JSON 字符串', desc_en: 'Parse JSON string', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'js', code: "JSON.stringify()", desc_zh: '对象转 JSON 字符串', desc_en: 'Object to JSON string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'js', code: "Number()", desc_zh: '转换为数字', desc_en: 'Convert to number', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "String()", desc_zh: '转换为字符串', desc_en: 'Convert to string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'js', code: "parseInt()", desc_zh: '解析整数', desc_en: 'Parse integer', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "parseFloat()", desc_zh: '解析浮点数', desc_en: 'Parse float', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Math.random()", desc_zh: '生成 0~1 随机数', desc_en: 'Random number 0-1', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'js', code: "Math.floor()", desc_zh: '向下取整', desc_en: 'Floor (round down)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Math.round()", desc_zh: '四舍五入', desc_en: 'Round to nearest', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Math.max()", desc_zh: '取最大值', desc_en: 'Get maximum value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Math.min()", desc_zh: '取最小值', desc_en: 'Get minimum value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Math.abs()", desc_zh: '取绝对值', desc_en: 'Get absolute value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'js', code: "Date.now()", desc_zh: '获取当前时间戳（毫秒）', desc_en: 'Get current timestamp (ms)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'js', code: "setTimeout(() => {}, 1000)", desc_zh: '延时执行（毫秒）', desc_en: 'Delayed execution (ms)', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'js', code: "setInterval(() => {}, 1000)", desc_zh: '定时循环执行（毫秒）', desc_en: 'Interval execution (ms)', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'js', code: "fetch(url)", desc_zh: '发起网络请求', desc_en: 'Make network request', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'js', code: "Array.isArray()", desc_zh: '判断是否为数组', desc_en: 'Check if array', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
];

function getExtBlockSnippets() {
  return state.blocks.map(blk => {
    const typeShort = blk.blockType.split('.').pop();
    const hasReturn = typeShort === 'REPORTER' || typeShort === 'BOOLEAN';
    const returnType = typeShort === 'REPORTER' ? 'string/number' : typeShort === 'BOOLEAN' ? 'boolean' : '—';
    const args = blk.args || [];
    const params = args.map(a => a.name).join(', ');
    const code = params ? `${blk.opcode}({${params}})` : `${blk.opcode}()`;
    return {
      category: 'block',
      code,
      desc_zh: `${blk.text || blk.opcode} (${typeShort})`,
      desc_en: `${blk.text || blk.opcode} (${typeShort})`,
      type: typeShort,
      hasReturn,
      returnType,
      hasParams: args.length > 0,
      params,
      funcBody: blk.funcBody || '',
      returnExpr: blk.returnExpr || ''
    };
  });
}

function renderSnippets() {
  const body = document.getElementById('snippets-body');
  if (!body) return;
  body.innerHTML = '';

  const lang = i18n.getLang();
  const searchVal = (document.getElementById('snippet-search')?.value || '').toLowerCase();

  // Extension blocks
  const extSnippets = getExtBlockSnippets();
  renderSnippetCategory(body, i18n.t('snippets.extBlocks'), extSnippets, lang, searchVal, 'block');

  // Scratch API
  renderSnippetCategory(body, i18n.t('snippets.scratchAPI'), scratchAPISnippets, lang, searchVal, 'api');

  // JS Builtins
  renderSnippetCategory(body, i18n.t('snippets.jsBuiltins'), jsSnippets, lang, searchVal, 'js');
}

function renderSnippetCategory(container, title, snippets, lang, searchVal, catType) {
  const filtered = snippets.filter(s => {
    if (!searchVal) return true;
    const desc = lang === 'en' ? s.desc_en : s.desc_zh;
    return s.code.toLowerCase().includes(searchVal) ||
           desc.toLowerCase().includes(searchVal) ||
           (s.type || '').toLowerCase().includes(searchVal);
  });

  if (filtered.length === 0 && searchVal) return;

  const catDiv = document.createElement('div');
  catDiv.className = 'snippet-category';

  const catTitle = document.createElement('div');
  catTitle.className = 'snippet-cat-title';
  catTitle.innerHTML = `${title} <span class="cat-count">${filtered.length}</span>`;
  catTitle.addEventListener('click', () => {
    const items = catDiv.querySelector('.snippet-cat-items');
    items.style.display = items.style.display === 'none' ? 'flex' : 'none';
  });
  catDiv.appendChild(catTitle);

  const itemsDiv = document.createElement('div');
  itemsDiv.className = 'snippet-cat-items';

  if (filtered.length === 0 && catType === 'block') {
    const empty = document.createElement('div');
    empty.className = 'snippet-card-desc';
    empty.style.padding = '8px';
    empty.textContent = i18n.t('snippets.noBlocks');
    itemsDiv.appendChild(empty);
  }

  filtered.forEach(s => {
    const card = document.createElement('div');
    card.className = 'snippet-card';
    const typeClass = 'snippet-type-' + (catType === 'block' ? s.type.toLowerCase() : catType);
    const desc = lang === 'en' ? s.desc_en : s.desc_zh;
    const paramTag = s.hasParams
      ? `<span class="snippet-meta-tag has-params">${i18n.t('snippets.params')}</span>`
      : `<span class="snippet-meta-tag no-params">${i18n.t('snippets.noParams')}</span>`;
    const returnTag = s.hasReturn
      ? `<span class="snippet-meta-tag return-yes">${i18n.t('snippets.return')}: ${s.returnType}</span>`
      : `<span class="snippet-meta-tag return-no">${i18n.t('snippets.noReturn')}</span>`;

    card.innerHTML = `
      <div class="snippet-card-header">
        <span class="snippet-card-name">${escapeHTML(s.code)}</span>
        <span class="snippet-card-type ${typeClass}">${s.type}</span>
      </div>
      <div class="snippet-card-desc">${escapeHTML(desc)}</div>
      <div class="snippet-card-meta">
        ${returnTag}${paramTag}
      </div>
      <button class="snippet-copy-btn" title="${i18n.t('snippets.copy')}">📋</button>
    `;

    card.querySelector('.snippet-copy-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      copySnippet(s.code, e.currentTarget);
    });

    card.addEventListener('click', () => {
      // Insert code at cursor in CodeMirror
      const cm = state.cm;
      if (cm) {
        cm.replaceSelection(s.code);
        cm.focus();
      }
    });

    itemsDiv.appendChild(card);
  });

  catDiv.appendChild(itemsDiv);
  container.appendChild(catDiv);
}

function copySnippet(code, btn) {
  navigator.clipboard.writeText(code).then(() => {
    toast(i18n.t('toast.snippetCopied'));
    if (btn) {
      const orig = btn.textContent;
      btn.textContent = '✓';
      setTimeout(() => { btn.textContent = orig; }, 1000);
    }
  }).catch(() => {
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    toast(i18n.t('toast.snippetCopied'));
  });
}

function escapeHTML(str) {
  return (str || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// ==================== Autocomplete ====================
function initAutocomplete() {
  const cm = state.cm;

  // Custom Scratch + user hints
  const scratchCompletions = [
    'Scratch.BlockType.COMMAND', 'Scratch.BlockType.REPORTER', 'Scratch.BlockType.BOOLEAN',
    'Scratch.BlockType.HAT', 'Scratch.BlockType.CONDITIONAL', 'Scratch.BlockType.LOOP', 'Scratch.BlockType.BUTTON',
    'Scratch.ArgumentType.STRING', 'Scratch.ArgumentType.NUMBER', 'Scratch.ArgumentType.BOOLEAN',
    'Scratch.ArgumentType.ANGLE', 'Scratch.ArgumentType.COLOR', 'Scratch.ArgumentType.IMAGE',
    'Scratch.ArgumentType.MATRIX', 'Scratch.ArgumentType.NOTE',
    'Scratch.extensions.register', 'Scratch.extensions.unsandboxed',
    'Scratch.vm.runtime.targets', 'Scratch.vm.runtime.ioDevices',
    'Scratch.vm.runtime.ioDevices.clock.projectTimer',
    'Scratch.vm.runtime.ioDevices.keyboard.isKeyDown',
    'Scratch.vm.runtime.ioDevices.cloud.requestUpdateVariable',
  ];

  CodeMirror.registerHelper('hint', 'javascript', function(editor) {
    const cur = editor.getCursor();
    const token = editor.getTokenAt(cur);
    let start = token.start;
    let end = cur.ch;
    let line = token.string;

    // Determine what the user is typing
    const text = editor.getLine(cur.line);
    const beforeCursor = text.slice(0, cur.ch);

    // Get the word being typed
    const wordMatch = beforeCursor.match(/[\w$.]+$/);
    const word = wordMatch ? wordMatch[0] : '';

    if (word.length < 1 && !beforeCursor.endsWith('.')) return;

    const wordStart = cur.ch - word.length;

    // Build list of completions
    let completions = [];

    // Scratch API completions
    scratchCompletions.forEach(c => {
      if (!word || c.toLowerCase().includes(word.toLowerCase())) {
        completions.push({ text: c, displayText: c });
      }
    });

    // User block opcodes
    state.blocks.forEach(blk => {
      const name = blk.opcode;
      if (!word || name.toLowerCase().includes(word.toLowerCase())) {
        completions.push({ text: name, displayText: name + ' (block)' });
      }
    });

    // Standard JS keywords
    const jsKeywords = [
      'function', 'return', 'const', 'let', 'var', 'if', 'else', 'for', 'while',
      'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class',
      'extends', 'super', 'import', 'export', 'default', 'try', 'catch',
      'finally', 'throw', 'typeof', 'instanceof', 'void', 'delete',
      'true', 'false', 'null', 'undefined', 'NaN', 'Infinity',
      'console', 'Math', 'JSON', 'Array', 'Object', 'String', 'Number',
      'Boolean', 'Date', 'Promise', 'Map', 'Set', 'RegExp', 'Error',
      'parseInt', 'parseFloat', 'isNaN', 'isFinite', 'encodeURI', 'decodeURI',
      'setTimeout', 'setInterval', 'clearTimeout', 'clearInterval', 'fetch',
    ];
    jsKeywords.forEach(k => {
      if (!word || k.toLowerCase().startsWith(word.toLowerCase())) {
        completions.push({ text: k, displayText: k });
      }
    });

    // Filter to only match what user typed
    if (word) {
      completions = completions.filter(c =>
        c.displayText.toLowerCase().includes(word.toLowerCase())
      );
    }

    // Deduplicate
    const seen = new Set();
    completions = completions.filter(c => {
      if (seen.has(c.text)) return false;
      seen.add(c.text);
      return true;
    });

    return {
      list: completions.slice(0, 50),
      from: CodeMirror.Pos(cur.line, wordStart),
      to: CodeMirror.Pos(cur.line, end)
    };
  });

  // Auto-trigger on dot and [
  cm.on('inputRead', function(editor, changeObj) {
    if (changeObj.origin === '+input') {
      const ch = changeObj.text[0];
      if (ch === '.' || ch === '[') {
        editor.showHint({ completeSingle: false });
      }
    }
  });

  // Search filter for snippets panel
  const searchInput = document.getElementById('snippet-search');
  if (searchInput) {
    searchInput.addEventListener('input', () => renderSnippets());
  }
}

// ==================== Toast ====================
function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 2500);
}

// ==================== Local Storage ====================
function saveToLocalStorage() {
  try {
    localStorage.setItem('tw-ext-editor', JSON.stringify({
      extId: state.extId,
      extName: state.extName,
      extColor1: state.extColor1,
      extColor2: state.extColor2,
      extColor3: state.extColor3,
      blocks: state.blocks,
      code: state.cm ? state.cm.getValue() : ''
    }));
  } catch (e) {}
}

function loadFromLocalStorage() {
  try {
    const data = JSON.parse(localStorage.getItem('tw-ext-editor'));
    if (data) {
      state.extId = data.extId || 'myextension';
      state.extName = data.extName || 'My Extension';
      state.extColor1 = data.extColor1 || '#4C97FF';
      state.extColor2 = data.extColor2 || '#3373CC';
      state.extColor3 = data.extColor3 || '#295FA8';
      state.blocks = data.blocks || [];
      document.getElementById('ext-id').value = state.extId;
      document.getElementById('ext-name').value = state.extName;
      document.getElementById('ext-color1').value = state.extColor1;
      document.getElementById('ext-color2').value = state.extColor2;
      document.getElementById('ext-color3').value = state.extColor3;
      if (data.code) {
        state.cm.setValue(data.code);
      }
    }
  } catch (e) {}
}
