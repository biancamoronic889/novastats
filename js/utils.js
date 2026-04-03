/* ===== UTILITY FUNCTIONS ===== */

window.Utils = {
  $(selector) {
    return document.querySelector(selector);
  },

  $$(selector) {
    return document.querySelectorAll(selector);
  },

  el(tag, attrs = {}, children = []) {
    const elem = document.createElement(tag);
    for (const [key, val] of Object.entries(attrs)) {
      if (key === 'className') elem.className = val;
      else if (key === 'innerHTML') elem.innerHTML = val;
      else if (key === 'textContent') elem.textContent = val;
      else if (key.startsWith('on')) elem.addEventListener(key.slice(2).toLowerCase(), val);
      else if (key === 'style' && typeof val === 'object') Object.assign(elem.style, val);
      else elem.setAttribute(key, val);
    }
    children.forEach(c => {
      if (typeof c === 'string') elem.appendChild(document.createTextNode(c));
      else if (c) elem.appendChild(c);
    });
    return elem;
  },

  fmt(num, decimals) {
    if (num === null || num === undefined || isNaN(num)) return '—';
    const d = decimals !== undefined ? decimals : CONFIG.DECIMAL_PLACES;
    if (!isFinite(num)) return num > 0 ? '∞' : '-∞';
    if (Math.abs(num) < 0.0001 && num !== 0) return num.toExponential(d);
    return parseFloat(num.toFixed(d)).toString();
  },

  pFmt(p) {
    if (p === null || p === undefined || isNaN(p)) return '—';
    if (p < 0.0001) return '< 0.0001';
    return p.toFixed(4);
  },

  debounce(fn, ms) {
    let timer;
    return (...args) => {
      clearTimeout(timer);
      timer = setTimeout(() => fn(...args), ms || CONFIG.DEBOUNCE_MS);
    };
  },

  show(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.style.display = '';
  },

  hide(el) {
    if (typeof el === 'string') el = document.querySelector(el);
    if (el) el.style.display = 'none';
  },

  toast(message, type = 'info', duration = 3000) {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    const toast = this.el('div', { className: `toast toast-${type}` }, [message]);
    container.appendChild(toast);
    setTimeout(() => {
      toast.classList.add('removing');
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  clamp(val, min, max) {
    return Math.min(Math.max(val, min), max);
  },

  downloadFile(content, filename, mime = 'text/csv') {
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  },

  buildSelectOptions(values) {
    return values.map((v, i) =>
      `<option value="${i}">${this.escHtml(v)}</option>`
    ).join('');
  },

  escHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  },

  interpretCorrelation(r) {
    const abs = Math.abs(r);
    let strength, direction;
    if (abs >= 0.9) strength = 'very strong';
    else if (abs >= 0.7) strength = 'strong';
    else if (abs >= 0.5) strength = 'moderate';
    else if (abs >= 0.3) strength = 'weak';
    else strength = 'very weak or no';
    direction = r >= 0 ? 'positive' : 'negative';
    if (abs < 0.1) return 'no linear correlation';
    return `${strength} ${direction} correlation`;
  },

  interpretPValue(p, alpha) {
    alpha = alpha || CONFIG.DEFAULT_ALPHA;
    if (p < alpha) {
      return { reject: true, text: `Reject H\u2080 (p = ${this.pFmt(p)} < \u03B1 = ${alpha})` };
    }
    return { reject: false, text: `Fail to reject H\u2080 (p = ${this.pFmt(p)} \u2265 \u03B1 = ${alpha})` };
  }
};

/* Shorthand */
const $ = Utils.$.bind(Utils);
const $$ = Utils.$$.bind(Utils);
