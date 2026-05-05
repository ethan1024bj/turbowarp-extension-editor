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
  initServerToggle();
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

// ==================== Server Toggle ====================
const WATCHER_URL = 'http://' + location.hostname + ':3001';

function initServerToggle() {
  const btn = document.getElementById('btn-server-toggle');

  btn.addEventListener('click', async () => {
    const cur = btn.classList;
    if (cur.contains('running')) {
      await controlServer('stop');
    } else if (cur.contains('stopped') || cur.contains('offline')) {
      await controlServer('start');
    }
  });

  pollServerStatus();
  setInterval(pollServerStatus, 3000);
}

async function pollServerStatus() {
  const btn = document.getElementById('btn-server-toggle');
  const label = document.getElementById('server-label');
  try {
    const resp = await fetch(WATCHER_URL + '/api/watcher/status');
    if (!resp.ok) throw new Error('fail');
    const data = await resp.json();
    btn.className = 'btn btn-server ' + data.serverStatus;
    if (data.serverStatus === 'running') {
      label.textContent = i18n.t('server.running') + (data.uptime > 0 ? ` (${formatUptime(data.uptime)})` : '');
    } else if (data.serverStatus === 'starting') {
      label.textContent = i18n.t('server.starting');
    } else if (data.serverStatus === 'stopping') {
      label.textContent = i18n.t('server.stopping');
    } else {
      label.textContent = i18n.t('server.stopped');
    }
  } catch (e) {
    btn.className = 'btn btn-server offline';
    label.textContent = i18n.t('server.offline');
  }
}

async function controlServer(action) {
  const btn = document.getElementById('btn-server-toggle');
  const label = document.getElementById('server-label');
  btn.disabled = true;
  label.textContent = i18n.t(action === 'start' ? 'server.starting' : 'server.stopping');
  try {
    await fetch(WATCHER_URL + '/api/watcher/' + action, { method: 'POST' });
    setTimeout(pollServerStatus, 1500);
  } catch (e) {
    // watcher might be down
  }
  btn.disabled = false;
}

function formatUptime(s) {
  if (s < 60) return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm';
  return Math.floor(s / 3600) + 'h' + Math.floor((s % 3600) / 60) + 'm';
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

    // Show warning dialog before applying
    const accepted = await showAIWarning();
    if (!accepted) {
      status.className = 'ai-status error';
      status.textContent = i18n.t('toast.genAborted');
      setTimeout(() => { status.style.display = 'none'; }, 3000);
      return;
    }

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

function showAIWarning() {
  return new Promise((resolve) => {
    const modal = document.getElementById('ai-warning-modal');
    const btnContinue = document.getElementById('btn-ai-continue');
    const btnAbort = document.getElementById('btn-ai-abort');

    modal.style.display = 'flex';

    function cleanup() {
      modal.style.display = 'none';
      btnContinue.removeEventListener('click', onContinue);
      btnAbort.removeEventListener('click', onAbort);
    }
    function onContinue() { cleanup(); resolve(true); }
    function onAbort() { cleanup(); resolve(false); }

    btnContinue.addEventListener('click', onContinue);
    btnAbort.addEventListener('click', onAbort);
  });
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

  updateLangSwitch();

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
  // ===== 积木类型 BlockType =====
  { category: 'blockType', code: 'Scratch.BlockType.COMMAND', desc_zh: '指令块 - 执行操作，无返回值', desc_en: 'Command block - executes action, no return', type: 'COMMAND', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.REPORTER', desc_zh: '返回值块 - 返回字符串或数字', desc_en: 'Reporter block - returns string/number', type: 'REPORTER', hasReturn: true, returnType: 'string/number', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.BOOLEAN', desc_zh: '布尔块 - 返回 true 或 false', desc_en: 'Boolean block - returns true/false', type: 'BOOLEAN', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.HAT', desc_zh: '帽子块 - 事件触发', desc_en: 'Hat block - event trigger', type: 'HAT', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.CONDITIONAL', desc_zh: '条件块 - 包含子栈（if/else）', desc_en: 'Conditional block - contains substack', type: 'CONDITIONAL', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.LOOP', desc_zh: '循环块 - 包含子栈（repeat/while）', desc_en: 'Loop block - contains substack', type: 'LOOP', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'blockType', code: 'Scratch.BlockType.BUTTON', desc_zh: '按钮 - 点击触发回调', desc_en: 'Button - click to trigger callback', type: 'BUTTON', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 参数类型 ArgumentType =====
  { category: 'argType', code: 'Scratch.ArgumentType.STRING', desc_zh: '字符串输入框 - 文本类型参数', desc_en: 'String input field', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.NUMBER', desc_zh: '数字输入框 - 数值类型参数', desc_en: 'Number input field', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.BOOLEAN', desc_zh: '布尔判断（六边形）- true/false 参数', desc_en: 'Boolean check (hexagon)', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.ANGLE', desc_zh: '角度选择器 - 0~360 度', desc_en: 'Angle picker (0-360)', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.COLOR', desc_zh: '颜色选择器 - 十六进制颜色值', desc_en: 'Color picker - hex color value', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.IMAGE', desc_zh: '图片数据 - 需 dataURI 格式', desc_en: 'Image data (requires dataURI)', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.MATRIX', desc_zh: '矩阵编辑器 - 5x5 点阵', desc_en: 'Matrix editor - 5x5 grid', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argType', code: 'Scratch.ArgumentType.NOTE', desc_zh: '音符选择器 - MIDI 音符编号', desc_en: 'Note picker - MIDI note number', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 参数定义模板 Argument Definition =====
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.STRING, defaultValue: 'hello' }", desc_zh: '字符串参数定义 - 带默认值', desc_en: 'String argument with default value', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.NUMBER, defaultValue: '0' }", desc_zh: '数字参数定义 - 默认值 0', desc_en: 'Number argument - default 0', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.NUMBER, defaultValue: '10' }", desc_zh: '数字参数定义 - 默认值 10', desc_en: 'Number argument - default 10', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.NUMBER, defaultValue: '100' }", desc_zh: '数字参数定义 - 默认值 100', desc_en: 'Number argument - default 100', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.BOOLEAN }", desc_zh: '布尔参数定义 - 无默认值', desc_en: 'Boolean argument - no default', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.ANGLE, defaultValue: '90' }", desc_zh: '角度参数定义 - 默认 90 度', desc_en: 'Angle argument - default 90', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.COLOR, defaultValue: '#ff0000' }", desc_zh: '颜色参数定义 - 默认红色', desc_en: 'Color argument - default red', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.NOTE, defaultValue: '60' }", desc_zh: '音符参数定义 - 默认中央 C (60)', desc_en: 'Note argument - default middle C (60)', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'argDef', code: "{ type: Scratch.ArgumentType.MATRIX, defaultValue: '0101010101010101010101010' }", desc_zh: '矩阵参数定义 - 5x5 点阵默认值', desc_en: 'Matrix argument - 5x5 grid default', type: 'ARG', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 参数调用 Argument Access =====
  { category: 'argAccess', code: 'args.TEXT', desc_zh: '获取字符串参数 TEXT 的值', desc_en: 'Get string argument TEXT value', type: 'PARAM', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'argAccess', code: 'args.NUM', desc_zh: '获取数字参数 NUM 的值', desc_en: 'Get number argument NUM value', type: 'PARAM', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'argAccess', code: 'Number(args.NUM)', desc_zh: '获取数字参数并转为 Number 类型', desc_en: 'Get number argument as Number type', type: 'PARAM', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'argAccess', code: 'Boolean(args.FLAG)', desc_zh: '获取布尔参数值', desc_en: 'Get boolean argument value', type: 'PARAM', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'argAccess', code: 'args.COLOR || "#ff0000"', desc_zh: '获取颜色参数，带默认值回退', desc_en: 'Get color argument with fallback default', type: 'PARAM', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'argAccess', code: "String(args.VALUE || '')", desc_zh: '获取参数并转为字符串，空值回退', desc_en: 'Get argument as string with empty fallback', type: 'PARAM', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'argAccess', code: 'Number(args.VALUE) || 0', desc_zh: '获取参数并转为数字，NaN 回退为 0', desc_en: 'Get argument as number, NaN fallback to 0', type: 'PARAM', hasReturn: true, returnType: 'number', hasParams: false },

  // ===== 颜色与特效 Color & Effects =====
  { category: 'color', code: "target.setEffect('color', 50)", desc_zh: '设置角色颜色特效 (0-100)', desc_en: 'Set sprite color effect (0-100)', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('ghost', 50)", desc_zh: '设置角色虚像特效 (0=可见, 100=透明)', desc_en: 'Set ghost effect (0=visible, 100=transparent)', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('brightness', 50)", desc_zh: '设置角色亮度特效 (-100~100)', desc_en: 'Set brightness effect (-100 to 100)', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('fisheye', 50)", desc_zh: '设置鱼眼特效', desc_en: 'Set fisheye effect', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('whirl', 50)", desc_zh: '设置漩涡特效', desc_en: 'Set whirl effect', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('pixelate', 50)", desc_zh: '设置像素化特效', desc_en: 'Set pixelate effect', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: "target.setEffect('mosaic', 50)", desc_zh: '设置马赛克特效', desc_en: 'Set mosaic effect', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: 'target.effects', desc_zh: '获取角色所有特效对象', desc_en: 'Get all sprite effects object', type: 'FX', hasReturn: true, returnType: 'object', hasParams: false },
  { category: 'color', code: "target.getEffect('color')", desc_zh: '获取角色颜色特效值', desc_en: 'Get sprite color effect value', type: 'FX', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'color', code: "target.clearEffects()", desc_zh: '清除角色所有特效', desc_en: 'Clear all sprite effects', type: 'FX', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "target.setVisible(true)", desc_zh: '显示角色', desc_en: 'Show sprite', type: 'FX', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "target.setVisible(false)", desc_zh: '隐藏角色', desc_en: 'Hide sprite', type: 'FX', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: 'target.visible', desc_zh: '获取角色是否可见', desc_en: 'Check if sprite is visible', type: 'FX', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'color', code: "target.setSize(100)", desc_zh: '设置角色大小 (百分比)', desc_en: 'Set sprite size (percentage)', type: 'FX', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'color', code: 'target.size', desc_zh: '获取角色大小', desc_en: 'Get sprite size', type: 'FX', hasReturn: true, returnType: 'number', hasParams: false },

  // ===== 角色属性 Sprite Properties =====
  { category: 'sprite', code: 'target.x', desc_zh: '获取/设置角色 X 坐标', desc_en: 'Get/set sprite X position', type: 'SPRITE', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'sprite', code: 'target.y', desc_zh: '获取/设置角色 Y 坐标', desc_en: 'Get/set sprite Y position', type: 'SPRITE', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'sprite', code: 'target.direction', desc_zh: '获取/设置角色朝向角度', desc_en: 'Get/set sprite direction angle', type: 'SPRITE', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'sprite', code: 'target.sprite.name', desc_zh: '获取角色名称', desc_en: 'Get sprite name', type: 'SPRITE', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'sprite', code: 'target.sprite.costume', desc_zh: '获取当前造型', desc_en: 'Get current costume', type: 'SPRITE', hasReturn: true, returnType: 'object', hasParams: false },
  { category: 'sprite', code: "target.setCostume(0)", desc_zh: '切换造型（按索引）', desc_en: 'Switch costume (by index)', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'sprite', code: "target.getCostumes()", desc_zh: '获取所有造型列表', desc_en: 'Get all costumes list', type: 'SPRITE', hasReturn: true, returnType: 'array', hasParams: false },
  { category: 'sprite', code: 'target.sprite.costumes.length', desc_zh: '获取造型数量', desc_en: 'Get costume count', type: 'SPRITE', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'sprite', code: "target.goToFront()", desc_zh: '移到最前面', desc_en: 'Go to front layer', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'sprite', code: "target.goToBack()", desc_zh: '移到最后面', desc_en: 'Go to back layer', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'sprite', code: "target.moveForward(10)", desc_zh: '向前移动指定步数', desc_en: 'Move forward by steps', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'sprite', code: "target.setXY(0, 0)", desc_zh: '设置角色坐标 (x, y)', desc_en: 'Set sprite position (x, y)', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'sprite', code: "target.setDirection(90)", desc_zh: '设置角色朝向', desc_en: 'Set sprite direction', type: 'SPRITE', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'sprite', code: "target.isTouchingObject('_mouse_')", desc_zh: '检测是否碰到鼠标', desc_en: 'Check if touching mouse', type: 'SPRITE', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'sprite', code: "target.isTouchingObject('_edge_')", desc_zh: '检测是否碰到边缘', desc_en: 'Check if touching edge', type: 'SPRITE', hasReturn: true, returnType: 'boolean', hasParams: false },

  // ===== 运行时 Runtime =====
  { category: 'runtime', code: 'Scratch.vm.runtime.targets', desc_zh: '获取所有角色列表', desc_en: 'Get all sprite targets', type: 'RUNTIME', hasReturn: true, returnType: 'array', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.targets[0]', desc_zh: '获取第一个角色（通常是舞台）', desc_en: 'Get first target (usually stage)', type: 'RUNTIME', hasReturn: true, returnType: 'object', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.getSpriteTargetByName('Sprite1')", desc_zh: '按名称获取角色', desc_en: 'Get sprite target by name', type: 'RUNTIME', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'runtime', code: 'Scratch.vm.runtime.ioDevices.clock.projectTimer()', desc_zh: '获取项目计时器（秒）', desc_en: 'Get project timer (seconds)', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.ioDevices.clock.resetProjectTimer()", desc_zh: '重置项目计时器', desc_en: 'Reset project timer', type: 'RUNTIME', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.ioDevices.keyboard.isKeyDown('space')", desc_zh: '检测键盘按键是否按下', desc_en: 'Check if key is pressed', type: 'RUNTIME', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'runtime', code: "Scratch.vm.runtime.ioDevices.keyboard.isKeyDown('a')", desc_zh: '检测 A 键是否按下', desc_en: 'Check if A key is pressed', type: 'RUNTIME', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.ioDevices.mouse.isDown', desc_zh: '检测鼠标是否按下', desc_en: 'Check if mouse is down', type: 'RUNTIME', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.ioDevices.mouse.x', desc_zh: '获取鼠标 X 坐标', desc_en: 'Get mouse X position', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.ioDevices.mouse.y', desc_zh: '获取鼠标 Y 坐标', desc_en: 'Get mouse Y position', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.ioDevices.cloud.requestUpdateVariable('var', 123)", desc_zh: '发送云变量更新消息', desc_en: 'Send cloud variable update', type: 'RUNTIME', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'runtime', code: 'Scratch.vm.runtime.ioDevices.loudness', desc_zh: '获取麦克风响度 (0-100)', desc_en: 'Get microphone loudness (0-100)', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.tempo', desc_zh: '获取/设置项目节拍 (BPM)', desc_en: 'Get/set project tempo (BPM)', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.startHats('event_whenflagclicked')", desc_zh: '触发绿旗点击事件', desc_en: 'Trigger green flag click event', type: 'RUNTIME', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'runtime', code: "Scratch.vm.runtime.startHats('event_whenbroadcastreceived', { BROADCAST_OPTION: 'msg' })", desc_zh: '触发广播接收事件', desc_en: 'Trigger broadcast receive event', type: 'RUNTIME', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'runtime', code: "Scratch.vm.runtime.emit('SAY', 'Hello!')", desc_zh: '发送说话消息', desc_en: 'Emit say message', type: 'RUNTIME', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'runtime', code: 'Scratch.vm.runtime.stageWidth', desc_zh: '获取舞台宽度', desc_en: 'Get stage width', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'runtime', code: 'Scratch.vm.runtime.stageHeight', desc_zh: '获取舞台高度', desc_en: 'Get stage height', type: 'RUNTIME', hasReturn: true, returnType: 'number', hasParams: false },

  // ===== 扩展注册 Extension Registration =====
  { category: 'extReg', code: 'Scratch.extensions.register(new MyExtension())', desc_zh: '注册扩展实例到 TurboWarp', desc_en: 'Register extension to TurboWarp', type: 'REG', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'extReg', code: 'Scratch.extensions.unsandboxed', desc_zh: '检查是否为非沙盒模式', desc_en: 'Check if unsandboxed mode', type: 'REG', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'extReg', code: "if (!Scratch.extensions.unsandboxed) throw new Error('需要非沙盒模式');", desc_zh: '非沙盒模式检查（不满足则抛错）', desc_en: 'Unsandboxed check (throw if sandboxed)', type: 'REG', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 积木颜色预设 Block Color Presets =====
  { category: 'color', code: "color1: '#4C97FF', color2: '#3373CC', color3: '#295FA8'", desc_zh: '运动蓝 - 三级颜色', desc_en: 'Motion blue - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#9966FF', color2: '#774DCB', color3: '#5A36A2'", desc_zh: '事件紫 - 三级颜色', desc_en: 'Events purple - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#CF63CF', color2: '#A64FA6', color3: '#873D87'", desc_zh: '控制粉 - 三级颜色', desc_en: 'Control pink - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#FFAB19', color2: '#CF8A13', color3: '#A86E0F'", desc_zh: '侦测黄 - 三级颜色', desc_en: 'Sensing yellow - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#FF6680', color2: '#CC5266', color3: '#A83F52'", desc_zh: '声音玫红 - 三级颜色', desc_en: 'Sound rose - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#5CB1D6', color2: '#4A8EAC', color3: '#3A6E87'", desc_zh: '画笔青 - 三级颜色', desc_en: 'Pen cyan - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#59C059', color2: '#479A47', color3: '#377A37'", desc_zh: '数据绿 - 三级颜色', desc_en: 'Data green - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'color', code: "color1: '#FF8C1A', color2: '#CF7013', color3: '#A8590F'", desc_zh: '运算橙 - 三级颜色', desc_en: 'Operators orange - 3-level colors', type: 'COLOR', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 控制流 Control Flow (Scratch 模拟) =====
  { category: 'control', code: "util.stackFrame.executed = util.stackFrame.executed || 0;\nif (util.stackFrame.executed < TIMES) {\n  util.stackFrame.executed++;\n  util.startBranch(1, true);\n}", desc_zh: 'LOOP 循环块实现 - 重复 N 次', desc_en: 'LOOP block implementation - repeat N times', type: 'CTRL', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'control', code: "if (CONDITION) { util.startBranch(1, false); }", desc_zh: 'CONDITIONAL 条件块 - if 判断', desc_en: 'CONDITIONAL block - if check', type: 'CTRL', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'control', code: "util.stackFrame.executed = util.stackFrame.executed || 0;\nif (util.stackFrame.executed < 1 && CONDITION) {\n  util.stackFrame.executed++;\n  util.startBranch(1, true);\n}", desc_zh: 'LOOP 条件循环 - while 条件成立时循环', desc_en: 'LOOP conditional - while condition is true', type: 'CTRL', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'control', code: "util.stackFrame.loopCounter = (util.stackFrame.loopCounter || 0) + 1;\nif (util.stackFrame.loopCounter <= MAX) {\n  util.startBranch(1, true);\n}", desc_zh: 'LOOP 计数循环 - 带计数器', desc_en: 'LOOP counter - with counter variable', type: 'CTRL', hasReturn: false, returnType: '—', hasParams: true },
];

const jsSnippets = [
  // ===== 基础类型 Basic Types =====
  { category: 'jsCore', code: "typeof x", desc_zh: '检测变量类型', desc_en: 'Check variable type', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "instanceof", desc_zh: '检测对象是否为某类实例', desc_en: 'Check if object is instance of class', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsCore', code: "null", desc_zh: '空值 - 表示无对象', desc_en: 'Null - no object', type: 'JS', hasReturn: true, returnType: 'null', hasParams: false },
  { category: 'jsCore', code: "undefined", desc_zh: '未定义 - 变量未赋值', desc_en: 'Undefined - variable not assigned', type: 'JS', hasReturn: true, returnType: 'undefined', hasParams: false },
  { category: 'jsCore', code: "true", desc_zh: '布尔真值', desc_en: 'Boolean true', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'jsCore', code: "false", desc_zh: '布尔假值', desc_en: 'Boolean false', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: false },
  { category: 'jsCore', code: "NaN", desc_zh: '非数字 (Not a Number)', desc_en: 'Not a Number', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsCore', code: "Infinity", desc_zh: '无穷大', desc_en: 'Infinity', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },

  // ===== 变量与函数 Variables & Functions =====
  { category: 'jsCore', code: "const x = 0;", desc_zh: '声明常量 - 不可重新赋值', desc_en: 'Declare constant - cannot reassign', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "let x = 0;", desc_zh: '声明块级变量 - 可重新赋值', desc_en: 'Declare block variable - can reassign', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "function name() {}", desc_zh: '函数声明', desc_en: 'Function declaration', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "const name = () => {};", desc_zh: '箭头函数', desc_en: 'Arrow function', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "return value;", desc_zh: '返回值 - 退出函数并返回', desc_en: 'Return value - exit and return', type: 'JS', hasReturn: true, returnType: 'any', hasParams: true },
  { category: 'jsCore', code: "async function name() {}", desc_zh: '异步函数声明', desc_en: 'Async function declaration', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "await promise", desc_zh: '等待异步 Promise 完成', desc_en: 'Wait for async Promise to resolve', type: 'JS', hasReturn: true, returnType: 'any', hasParams: true },

  // ===== 控制流 Control Flow =====
  { category: 'jsCore', code: "if (condition) {}", desc_zh: '条件判断 - if', desc_en: 'Conditional - if', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "if (condition) {} else {}", desc_zh: '条件判断 - if/else', desc_en: 'Conditional - if/else', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "if (a) {} else if (b) {} else {}", desc_zh: '多条件判断 - if/else if/else', desc_en: 'Multi-condition - if/else if/else', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "switch (x) { case 1: break; default: }", desc_zh: 'switch 多分支选择', desc_en: 'Switch multi-branch', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "for (let i = 0; i < n; i++) {}", desc_zh: 'for 循环 - 计数循环', desc_en: 'For loop - counter loop', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "for (const item of array) {}", desc_zh: 'for...of 遍历数组', desc_en: 'For...of iterate array', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "for (const key in obj) {}", desc_zh: 'for...in 遍历对象属性', desc_en: 'For...in iterate object keys', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "while (condition) {}", desc_zh: 'while 循环', desc_en: 'While loop', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "do {} while (condition);", desc_zh: 'do...while 循环 - 至少执行一次', desc_en: 'Do...while loop - executes at least once', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "break;", desc_zh: '跳出循环', desc_en: 'Break out of loop', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "continue;", desc_zh: '跳过本次循环，继续下一次', desc_en: 'Skip to next iteration', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },
  { category: 'jsCore', code: "try {} catch (err) {} finally {}", desc_zh: 'try/catch/finally 异常处理', desc_en: 'Try/catch/finally error handling', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsCore', code: "throw new Error('message')", desc_zh: '抛出错误', desc_en: 'Throw an error', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },

  // ===== 类型转换 Type Conversion =====
  { category: 'jsCore', code: "Number(value)", desc_zh: '转换为数字', desc_en: 'Convert to number', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsCore', code: "String(value)", desc_zh: '转换为字符串', desc_en: 'Convert to string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "Boolean(value)", desc_zh: '转换为布尔值', desc_en: 'Convert to boolean', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsCore', code: "parseInt(str)", desc_zh: '解析字符串为整数', desc_en: 'Parse string to integer', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsCore', code: "parseInt(str, 10)", desc_zh: '解析整数（指定十进制）', desc_en: 'Parse integer (base 10)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsCore', code: "parseFloat(str)", desc_zh: '解析字符串为浮点数', desc_en: 'Parse string to float', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsCore', code: "isNaN(value)", desc_zh: '判断是否为 NaN', desc_en: 'Check if value is NaN', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsCore', code: "isFinite(value)", desc_zh: '判断是否为有限数', desc_en: 'Check if value is finite', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsCore', code: "value.toFixed(2)", desc_zh: '数字保留 2 位小数（返回字符串）', desc_en: 'Number to 2 decimal places (returns string)', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "value.toString()", desc_zh: '转为字符串', desc_en: 'Convert to string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsCore', code: "Number.MAX_SAFE_INTEGER", desc_zh: '最大安全整数 (2^53 - 1)', desc_en: 'Max safe integer (2^53 - 1)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsCore', code: "Number.MIN_SAFE_INTEGER", desc_zh: '最小安全整数 -(2^53 - 1)', desc_en: 'Min safe integer -(2^53 - 1)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },

  // ===== 数学 Math =====
  { category: 'jsMath', code: "Math.random()", desc_zh: '生成 0~1 随机数', desc_en: 'Random number 0-1', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsMath', code: "Math.floor(value)", desc_zh: '向下取整', desc_en: 'Floor (round down)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.ceil(value)", desc_zh: '向上取整', desc_en: 'Ceil (round up)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.round(value)", desc_zh: '四舍五入', desc_en: 'Round to nearest', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.abs(value)", desc_zh: '取绝对值', desc_en: 'Absolute value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.max(a, b)", desc_zh: '取最大值', desc_en: 'Maximum value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.min(a, b)", desc_zh: '取最小值', desc_en: 'Minimum value', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.pow(base, exp)", desc_zh: '幂运算 base^exp', desc_en: 'Power base^exp', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.sqrt(value)", desc_zh: '平方根', desc_en: 'Square root', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.cbrt(value)", desc_zh: '立方根', desc_en: 'Cube root', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.log(value)", desc_zh: '自然对数 ln(x)', desc_en: 'Natural logarithm ln(x)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.log10(value)", desc_zh: '以 10 为底的对数', desc_en: 'Base-10 logarithm', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.log2(value)", desc_zh: '以 2 为底的对数', desc_en: 'Base-2 logarithm', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.sin(angle)", desc_zh: '正弦函数（弧度）', desc_en: 'Sine (radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.cos(angle)", desc_zh: '余弦函数（弧度）', desc_en: 'Cosine (radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.tan(angle)", desc_zh: '正切函数（弧度）', desc_en: 'Tangent (radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.asin(value)", desc_zh: '反正弦（返回弧度）', desc_en: 'Arcsine (returns radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.acos(value)", desc_zh: '反余弦（返回弧度）', desc_en: 'Arccosine (returns radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.atan2(y, x)", desc_zh: '反正切2（返回弧度）', desc_en: 'Arctangent2 (returns radians)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.PI", desc_zh: '圆周率 π (3.14159...)', desc_en: 'Pi (3.14159...)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsMath', code: "Math.E", desc_zh: '自然常数 e (2.718...)', desc_en: "Euler's number (2.718...)", type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsMath', code: "Math.clamp(value, min, max)", desc_zh: '将值限制在 min~max 范围内', desc_en: 'Clamp value between min and max', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsMath', code: "Math.floor(Math.random() * (max - min + 1)) + min", desc_zh: '生成 min~max 范围的随机整数', desc_en: 'Random integer between min and max', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },

  // ===== 字符串 String =====
  { category: 'jsString', code: "str.length", desc_zh: '获取字符串长度', desc_en: 'Get string length', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsString', code: "str.toUpperCase()", desc_zh: '转为大写', desc_en: 'Convert to uppercase', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsString', code: "str.toLowerCase()", desc_zh: '转为小写', desc_en: 'Convert to lowercase', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsString', code: "str.trim()", desc_zh: '去除首尾空格', desc_en: 'Trim whitespace', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsString', code: "str.includes(sub)", desc_zh: '判断是否包含子字符串', desc_en: 'Check if contains substring', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsString', code: "str.startsWith(prefix)", desc_zh: '判断是否以指定字符串开头', desc_en: 'Check if starts with prefix', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsString', code: "str.endsWith(suffix)", desc_zh: '判断是否以指定字符串结尾', desc_en: 'Check if ends with suffix', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsString', code: "str.indexOf(sub)", desc_zh: '查找子字符串位置（找不到返回-1）', desc_en: 'Find substring index (-1 if not found)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsString', code: "str.slice(start, end)", desc_zh: '截取字符串（支持负数索引）', desc_en: 'Slice string (supports negative index)', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.substring(start, end)", desc_zh: '截取字符串', desc_en: 'Extract substring', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.split(separator)", desc_zh: '按分隔符拆分为数组', desc_en: 'Split string into array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsString', code: "str.replace(old, new)", desc_zh: '替换第一个匹配', desc_en: 'Replace first match', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.replaceAll(old, new)", desc_zh: '替换所有匹配', desc_en: 'Replace all matches', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.repeat(n)", desc_zh: '重复字符串 n 次', desc_en: 'Repeat string n times', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.padStart(len, char)", desc_zh: '左侧填充到指定长度', desc_en: 'Pad start to length', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.charAt(index)", desc_zh: '获取指定位置的字符', desc_en: 'Get character at index', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.charCodeAt(index)", desc_zh: '获取指定位置字符的 Unicode 编码', desc_en: 'Get char code at index', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsString', code: "String.fromCharCode(code)", desc_zh: '从 Unicode 编码创建字符', desc_en: 'Create char from Unicode code', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "`template ${value} string`", desc_zh: '模板字符串 - 嵌入变量', desc_en: 'Template literal - embed variables', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsString', code: "str.match(/regex/)", desc_zh: '正则表达式匹配', desc_en: 'Regex match', type: 'JS', hasReturn: true, returnType: 'array|null', hasParams: true },
  { category: 'jsString', code: "str.test(/regex/)", desc_zh: '正则表达式测试', desc_en: 'Regex test', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },

  // ===== 数组 Array =====
  { category: 'jsArray', code: "arr.length", desc_zh: '获取数组长度', desc_en: 'Get array length', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsArray', code: "arr.push(item)", desc_zh: '在末尾添加元素', desc_en: 'Add element to end', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsArray', code: "arr.pop()", desc_zh: '移除并返回最后一个元素', desc_en: 'Remove and return last element', type: 'JS', hasReturn: true, returnType: 'any', hasParams: false },
  { category: 'jsArray', code: "arr.shift()", desc_zh: '移除并返回第一个元素', desc_en: 'Remove and return first element', type: 'JS', hasReturn: true, returnType: 'any', hasParams: false },
  { category: 'jsArray', code: "arr.unshift(item)", desc_zh: '在开头添加元素', desc_en: 'Add element to start', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsArray', code: "arr.splice(index, count)", desc_zh: '删除/插入元素', desc_en: 'Remove/insert elements', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.slice(start, end)", desc_zh: '截取子数组（不改变原数组）', desc_en: 'Slice subarray (non-mutating)', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.concat(other)", desc_zh: '合并数组', desc_en: 'Concatenate arrays', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.join(separator)", desc_zh: '数组元素拼接为字符串', desc_en: 'Join array to string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsArray', code: "arr.indexOf(item)", desc_zh: '查找元素位置', desc_en: 'Find element index', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsArray', code: "arr.includes(item)", desc_zh: '判断是否包含元素', desc_en: 'Check if includes element', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsArray', code: "arr.find(fn)", desc_zh: '查找满足条件的第一个元素', desc_en: 'Find first matching element', type: 'JS', hasReturn: true, returnType: 'any', hasParams: true },
  { category: 'jsArray', code: "arr.findIndex(fn)", desc_zh: '查找满足条件的第一个元素索引', desc_en: 'Find index of first match', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsArray', code: "arr.filter(fn)", desc_zh: '过滤数组 - 返回满足条件的元素', desc_en: 'Filter array - return matching elements', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.map(fn)", desc_zh: '映射数组 - 返回新数组', desc_en: 'Map array - return new array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.reduce(fn, init)", desc_zh: '归约数组 - 累积计算', desc_en: 'Reduce array - accumulate', type: 'JS', hasReturn: true, returnType: 'any', hasParams: true },
  { category: 'jsArray', code: "arr.forEach(fn)", desc_zh: '遍历数组（无返回值）', desc_en: 'Iterate array (no return)', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsArray', code: "arr.every(fn)", desc_zh: '判断所有元素是否满足条件', desc_en: 'Check if all elements match', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsArray', code: "arr.some(fn)", desc_zh: '判断是否有元素满足条件', desc_en: 'Check if any element matches', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsArray', code: "arr.sort(fn)", desc_zh: '排序数组（改变原数组）', desc_en: 'Sort array (mutates)', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "arr.reverse()", desc_zh: '反转数组（改变原数组）', desc_en: 'Reverse array (mutates)', type: 'JS', hasReturn: true, returnType: 'array', hasParams: false },
  { category: 'jsArray', code: "arr.flat()", desc_zh: '扁平化嵌套数组', desc_en: 'Flatten nested array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: false },
  { category: 'jsArray', code: "Array.isArray(value)", desc_zh: '判断是否为数组', desc_en: 'Check if value is array', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsArray', code: "Array.from(iterable)", desc_zh: '从可迭代对象创建数组', desc_en: 'Create array from iterable', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "new Array(n).fill(0)", desc_zh: '创建长度为 n 的数组并填充 0', desc_en: 'Create array of length n filled with 0', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsArray', code: "[...arr]", desc_zh: '展开运算符 - 浅拷贝数组', desc_en: 'Spread operator - shallow copy array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },

  // ===== 对象 Object =====
  { category: 'jsObject', code: "Object.keys(obj)", desc_zh: '获取对象所有键名数组', desc_en: 'Get object keys array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsObject', code: "Object.values(obj)", desc_zh: '获取对象所有值数组', desc_en: 'Get object values array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsObject', code: "Object.entries(obj)", desc_zh: '获取对象所有键值对数组', desc_en: 'Get object entries array', type: 'JS', hasReturn: true, returnType: 'array', hasParams: true },
  { category: 'jsObject', code: "Object.assign(target, source)", desc_zh: '合并对象到目标对象', desc_en: 'Merge objects into target', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'jsObject', code: "Object.freeze(obj)", desc_zh: '冻结对象（不可修改）', desc_en: 'Freeze object (immutable)', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'jsObject', code: "Object.create(proto)", desc_zh: '以指定原型创建对象', desc_en: 'Create object with prototype', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'jsObject', code: "{ ...obj }", desc_zh: '展开运算符 - 浅拷贝对象', desc_en: 'Spread operator - shallow copy object', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'jsObject', code: "obj.hasOwnProperty(key)", desc_zh: '判断对象是否有指定属性', desc_en: 'Check if object has property', type: 'JS', hasReturn: true, returnType: 'boolean', hasParams: true },
  { category: 'jsObject', code: "JSON.parse(str)", desc_zh: '解析 JSON 字符串为对象', desc_en: 'Parse JSON string to object', type: 'JS', hasReturn: true, returnType: 'object', hasParams: true },
  { category: 'jsObject', code: "JSON.stringify(obj)", desc_zh: '对象转 JSON 字符串', desc_en: 'Object to JSON string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsObject', code: "JSON.stringify(obj, null, 2)", desc_zh: '对象转格式化 JSON（缩进 2 空格）', desc_en: 'Object to formatted JSON (2-space indent)', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },

  // ===== 日期时间 Date & Time =====
  { category: 'jsDate', code: "Date.now()", desc_zh: '获取当前时间戳（毫秒）', desc_en: 'Get current timestamp (ms)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "new Date()", desc_zh: '创建当前日期时间对象', desc_en: 'Create current Date object', type: 'JS', hasReturn: true, returnType: 'Date', hasParams: false },
  { category: 'jsDate', code: "new Date(timestamp)", desc_zh: '从时间戳创建日期', desc_en: 'Create Date from timestamp', type: 'JS', hasReturn: true, returnType: 'Date', hasParams: true },
  { category: 'jsDate', code: "date.getFullYear()", desc_zh: '获取年份', desc_en: 'Get full year', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getMonth()", desc_zh: '获取月份 (0-11)', desc_en: 'Get month (0-11)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getDate()", desc_zh: '获取日期 (1-31)', desc_en: 'Get day of month (1-31)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getHours()", desc_zh: '获取小时 (0-23)', desc_en: 'Get hours (0-23)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getMinutes()", desc_zh: '获取分钟 (0-59)', desc_en: 'Get minutes (0-59)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getSeconds()", desc_zh: '获取秒数 (0-59)', desc_en: 'Get seconds (0-59)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.getTime()", desc_zh: '获取时间戳（毫秒）', desc_en: 'Get timestamp (ms)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: false },
  { category: 'jsDate', code: "date.toISOString()", desc_zh: '转为 ISO 8601 字符串', desc_en: 'Convert to ISO 8601 string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsDate', code: "date.toLocaleString()", desc_zh: '转为本地化日期时间字符串', desc_en: 'Convert to locale string', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },

  // ===== 异步与定时器 Async & Timers =====
  { category: 'jsAsync', code: "setTimeout(() => {}, 1000)", desc_zh: '延时执行（毫秒）', desc_en: 'Delayed execution (ms)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsAsync', code: "setInterval(() => {}, 1000)", desc_zh: '定时循环执行（毫秒）', desc_en: 'Interval execution (ms)', type: 'JS', hasReturn: true, returnType: 'number', hasParams: true },
  { category: 'jsAsync', code: "clearTimeout(id)", desc_zh: '取消延时执行', desc_en: 'Cancel timeout', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsAsync', code: "clearInterval(id)", desc_zh: '取消定时循环', desc_en: 'Cancel interval', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsAsync', code: "new Promise((resolve, reject) => {})", desc_zh: '创建 Promise 对象', desc_en: 'Create Promise', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "promise.then(fn).catch(fn)", desc_zh: 'Promise 链式调用', desc_en: 'Promise chaining', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "Promise.all([p1, p2])", desc_zh: '并行执行多个 Promise', desc_en: 'Execute promises in parallel', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "Promise.resolve(value)", desc_zh: '创建已解决的 Promise', desc_en: 'Create resolved Promise', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "Promise.reject(error)", desc_zh: '创建已拒绝的 Promise', desc_en: 'Create rejected Promise', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "fetch(url)", desc_zh: '发起网络请求', desc_en: 'Make network request', type: 'JS', hasReturn: true, returnType: 'Promise<Response>', hasParams: true },
  { category: 'jsAsync', code: "fetch(url).then(r => r.json())", desc_zh: '发起请求并解析 JSON 响应', desc_en: 'Fetch and parse JSON response', type: 'JS', hasReturn: true, returnType: 'Promise', hasParams: true },
  { category: 'jsAsync', code: "fetch(url, { method: 'POST', body: JSON.stringify(data), headers: { 'Content-Type': 'application/json' } })", desc_zh: '发起 POST 请求（JSON）', desc_en: 'POST request with JSON body', type: 'JS', hasReturn: true, returnType: 'Promise<Response>', hasParams: true },

  // ===== 控制台与调试 Console & Debug =====
  { category: 'jsConsole', code: "console.log(value)", desc_zh: '输出日志到控制台', desc_en: 'Log to console', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.warn(value)", desc_zh: '输出警告信息', desc_en: 'Log warning', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.error(value)", desc_zh: '输出错误信息', desc_en: 'Log error', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.info(value)", desc_zh: '输出信息', desc_en: 'Log info', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.table(array)", desc_zh: '以表格形式输出数据', desc_en: 'Log data as table', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.time('label')", desc_zh: '开始计时', desc_en: 'Start timer', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.timeEnd('label')", desc_zh: '结束计时并输出耗时', desc_en: 'End timer and log elapsed', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.assert(condition, 'msg')", desc_zh: '断言 - 条件为 false 时输出错误', desc_en: 'Assert - log error if false', type: 'JS', hasReturn: false, returnType: '—', hasParams: true },
  { category: 'jsConsole', code: "console.trace()", desc_zh: '输出调用栈', desc_en: 'Log call stack trace', type: 'JS', hasReturn: false, returnType: '—', hasParams: false },

  // ===== 编码解码 Encoding =====
  { category: 'jsCore', code: "encodeURI(str)", desc_zh: '编码 URI（保留特殊字符）', desc_en: 'Encode URI (keep special chars)', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "decodeURI(str)", desc_zh: '解码 URI', desc_en: 'Decode URI', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "encodeURIComponent(str)", desc_zh: '编码 URI 组件（编码所有特殊字符）', desc_en: 'Encode URI component (all special chars)', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "decodeURIComponent(str)", desc_zh: '解码 URI 组件', desc_en: 'Decode URI component', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "btoa(str)", desc_zh: 'Base64 编码', desc_en: 'Base64 encode', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },
  { category: 'jsCore', code: "atob(str)", desc_zh: 'Base64 解码', desc_en: 'Base64 decode', type: 'JS', hasReturn: true, returnType: 'string', hasParams: true },

  // ===== 错误处理 Error Handling =====
  { category: 'jsCore', code: "new Error('message')", desc_zh: '创建错误对象', desc_en: 'Create Error object', type: 'JS', hasReturn: true, returnType: 'Error', hasParams: true },
  { category: 'jsCore', code: "new TypeError('message')", desc_zh: '创建类型错误', desc_en: 'Create TypeError', type: 'JS', hasReturn: true, returnType: 'TypeError', hasParams: true },
  { category: 'jsCore', code: "new RangeError('message')", desc_zh: '创建范围错误', desc_en: 'Create RangeError', type: 'JS', hasReturn: true, returnType: 'RangeError', hasParams: true },
  { category: 'jsCore', code: "error.message", desc_zh: '获取错误消息', desc_en: 'Get error message', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
  { category: 'jsCore', code: "error.stack", desc_zh: '获取错误调用栈', desc_en: 'Get error stack trace', type: 'JS', hasReturn: true, returnType: 'string', hasParams: false },
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

function updateLangSwitch() {
  const cur = i18n.getLang();
  document.querySelectorAll('#btn-lang-switch .lang-opt').forEach(el => {
    el.classList.toggle('lang-active', el.dataset.lang === cur);
  });
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
