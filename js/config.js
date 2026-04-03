/* ===== CONFIGURATION & CONSTANTS ===== */

window.CONFIG = {
  MAX_ROWS: 10000,
  MAX_COLS: 20,
  DECIMAL_PLACES: 4,
  DEBOUNCE_MS: 300,

  CHART_COLORS: ['#6c5ce7', '#00b894', '#74b9ff', '#fdcb6e', '#e17055', '#a29bfe', '#ff7675', '#55efc4'],
  CHART_PADDING: { top: 30, right: 20, bottom: 40, left: 55 },

  AI: {
    openai: {
      name: 'OpenAI',
      model: 'gpt-4o-mini',
      url: 'https://api.openai.com/v1/chat/completions'
    },
    gemini: {
      name: 'Google Gemini',
      model: 'gemini-1.5-flash',
      url: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    }
  },

  STORAGE_KEYS: {
    theme: 'novastats_theme',
    aiProvider: 'novastats_ai_provider',
    aiKey: 'novastats_ai_key',
    data: 'novastats_data'
  },

  SIGNIFICANCE_LEVELS: [0.01, 0.025, 0.05, 0.10],
  DEFAULT_ALPHA: 0.05
};
