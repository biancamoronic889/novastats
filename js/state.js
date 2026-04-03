/* ===== APPLICATION STATE ===== */

window.AppState = {
  theme: 'dark',
  activeModule: 'data-input',

  data: {
    raw: '',
    headers: [],
    columns: [],
    rows: []
  },

  results: {},

  ai: {
    provider: 'openai',
    apiKey: ''
  },

  listeners: [],

  get(key) {
    return key ? this[key] : this;
  },

  setData(newData) {
    Object.assign(this.data, newData);
    this.notify('data');
  },

  setModule(moduleName) {
    this.activeModule = moduleName;
    this.notify('module');
  },

  setResult(module, result) {
    this.results[module] = result;
  },

  getResult(module) {
    return this.results[module] || null;
  },

  hasData() {
    return this.data.columns.length > 0 && this.data.columns[0].length > 0;
  },

  getColumnCount() {
    return this.data.columns.length;
  },

  getColumn(index) {
    return this.data.columns[index] || [];
  },

  getColumnByName(name) {
    const idx = this.data.headers.indexOf(name);
    return idx >= 0 ? this.data.columns[idx] : [];
  },

  onUpdate(fn) {
    this.listeners.push(fn);
  },

  notify(type) {
    this.listeners.forEach(fn => fn(type));
  },

  reset() {
    this.data = { raw: '', headers: [], columns: [], rows: [] };
    this.results = {};
    this.notify('data');
  }
};
