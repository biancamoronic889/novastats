/* ===== AI INSIGHTS INTEGRATION ===== */

window.AIInsights = {

  render(container) {
    const savedProvider = localStorage.getItem(CONFIG.STORAGE_KEYS.aiProvider) || 'openai';
    const savedKey = localStorage.getItem(CONFIG.STORAGE_KEYS.aiKey) || '';

    container.innerHTML = `
      <div class="module-header">
        <h2>AI Insights</h2>
        <p>Get AI-powered interpretation and recommendations for your statistical results.</p>
      </div>

      <div class="card" style="margin-bottom:20px">
        <div class="card-header"><h3>API Configuration</h3></div>
        <div class="card-body">
          <div class="banner banner-warning" style="margin-top:0">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 9v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
            <span>Your API key is stored locally in your browser and only sent directly to the AI provider.</span>
          </div>
          <div class="ai-config">
            <div class="form-group">
              <label>Provider</label>
              <select id="aiProvider">
                <option value="openai" ${savedProvider === 'openai' ? 'selected' : ''}>OpenAI</option>
                <option value="gemini" ${savedProvider === 'gemini' ? 'selected' : ''}>Google Gemini</option>
              </select>
            </div>
            <div class="form-group">
              <label>API Key</label>
              <input type="password" id="aiKey" value="${Utils.escHtml(savedKey)}" placeholder="Enter your API key">
            </div>
            <button class="btn btn-secondary" id="aiSaveKey">Save Key</button>
          </div>
        </div>
      </div>

      <div class="card">
        <div class="card-header">
          <h3>Analysis</h3>
          <button class="btn btn-primary" id="aiGenerate">Generate Insights</button>
        </div>
        <div class="card-body">
          <div class="form-group">
            <label>Select module to analyze</label>
            <select id="aiModule">
              <option value="descriptive">Descriptive Statistics</option>
              <option value="correlation">Correlation Analysis</option>
              <option value="regression">Regression Analysis</option>
              <option value="hypothesis">Hypothesis Testing</option>
              <option value="chi-square">Chi-Square Tests</option>
              <option value="anova">ANOVA</option>
              <option value="all">All Available Results</option>
            </select>
          </div>
          <div id="aiOutput">
            <div class="ai-placeholder">
              Run a statistical analysis first, then click "Generate Insights" to get AI-powered interpretation.
            </div>
          </div>
        </div>
      </div>
    `;

    $('#aiSaveKey').addEventListener('click', () => this.saveConfig());
    $('#aiGenerate').addEventListener('click', () => this.generate());
  },

  saveConfig() {
    const provider = $('#aiProvider').value;
    const key = $('#aiKey').value;
    localStorage.setItem(CONFIG.STORAGE_KEYS.aiProvider, provider);
    localStorage.setItem(CONFIG.STORAGE_KEYS.aiKey, key);
    AppState.ai.provider = provider;
    AppState.ai.apiKey = key;
    Utils.toast('API configuration saved', 'success');
  },

  buildPrompt(moduleName) {
    let context = 'The following are results from a statistical analysis:\n\n';

    const addResult = (name, result) => {
      if (!result) return;
      context += `--- ${name} ---\n`;
      if (result.steps) {
        context += result.steps.join('\n') + '\n';
      } else {
        context += JSON.stringify(result, null, 2) + '\n';
      }
      context += '\n';
    };

    if (moduleName === 'all') {
      ['descriptive', 'correlation', 'regression', 'hypothesis', 'chi-square', 'anova'].forEach(m => {
        addResult(m, AppState.getResult(m));
      });
    } else {
      addResult(moduleName, AppState.getResult(moduleName));
    }

    if (context.includes('---')) {
      return `You are a statistics expert and data analyst. Analyze the following statistical results and provide:

1. A plain English interpretation of the findings
2. Key insights and patterns detected
3. Practical recommendations based on the results
4. Any potential issues, limitations, or anomalies to be aware of

Be concise but thorough. Use bullet points for clarity.

${context}`;
    }

    return null;
  },

  async generate() {
    const provider = localStorage.getItem(CONFIG.STORAGE_KEYS.aiProvider) || 'openai';
    const apiKey = localStorage.getItem(CONFIG.STORAGE_KEYS.aiKey) || '';
    const moduleName = $('#aiModule').value;

    if (!apiKey) {
      $('#aiOutput').innerHTML = '<div class="ai-placeholder">AI insights unavailable \u2014 please add an API key above.</div>';
      return;
    }

    const prompt = this.buildPrompt(moduleName);
    if (!prompt) {
      $('#aiOutput').innerHTML = '<div class="ai-placeholder">No results available for the selected module. Run an analysis first.</div>';
      return;
    }

    $('#aiOutput').innerHTML = '<div class="ai-response loading"><div class="spinner"></div> Generating insights...</div>';

    try {
      let text;
      if (provider === 'openai') {
        text = await this.callOpenAI(apiKey, prompt);
      } else {
        text = await this.callGemini(apiKey, prompt);
      }
      $('#aiOutput').innerHTML = `<div class="ai-response">${this.formatResponse(text)}</div>`;
    } catch (err) {
      $('#aiOutput').innerHTML = `<div class="ai-response" style="color:var(--danger)">Error: ${Utils.escHtml(err.message)}</div>`;
    }
  },

  async callOpenAI(apiKey, prompt) {
    const res = await fetch(CONFIG.AI.openai.url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: CONFIG.AI.openai.model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.3
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || 'No response received.';
  },

  async callGemini(apiKey, prompt) {
    const url = `${CONFIG.AI.gemini.url}?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1000, temperature: 0.3 }
      })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received.';
  },

  formatResponse(text) {
    // Basic markdown-like formatting
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/^### (.*$)/gm, '<h4 style="margin:12px 0 6px">$1</h4>')
      .replace(/^## (.*$)/gm, '<h3 style="margin:14px 0 8px">$1</h3>')
      .replace(/^- (.*$)/gm, '<li style="margin-left:16px">$1</li>')
      .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left:16px">$2</li>')
      .replace(/\n{2,}/g, '<br><br>')
      .replace(/\n/g, '<br>');
  }
};
