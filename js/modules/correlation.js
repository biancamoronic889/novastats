/* ===== CORRELATION MODULE CONTROLLER ===== */

window.ModuleCorrelation = {

  render(container) {
    container.innerHTML = `
      <div class="module-header">
        <h2>Correlation Analysis</h2>
        <p>Measure the strength and direction of the linear relationship between two variables.</p>
      </div>
      <div class="module-grid">
        <div class="card">
          <div class="card-header"><h3>Variable Selection</h3></div>
          <div class="card-body">
            <div class="var-selector">
              <div class="form-group">
                <label>X Variable</label>
                <select id="corrVarX">${DataManager.getVariableOptions()}</select>
              </div>
              <div class="form-group">
                <label>Y Variable</label>
                <select id="corrVarY">
                  ${AppState.data.headers.map((h, i) =>
                    `<option value="${i}" ${i === 1 ? 'selected' : ''}>${Utils.escHtml(h)}</option>`
                  ).join('')}
                </select>
              </div>
              <button class="btn btn-primary" id="corrCompute">Calculate</button>
            </div>
          </div>
        </div>

        <div class="card" id="corrChartCard" style="display:none">
          <div class="card-header"><h3>Scatterplot</h3></div>
          <div class="card-body">
            <div class="chart-container">
              <canvas id="corrChart"></canvas>
            </div>
          </div>
        </div>

        <div class="card full-width" id="corrResultsCard" style="display:none">
          <div class="card-header"><h3>Results</h3></div>
          <div class="card-body">
            <div class="results-grid" id="corrResultsGrid"></div>
            <div class="interpretation" id="corrInterpretation"></div>
            <details style="margin-top:12px">
              <summary>Step-by-step calculation</summary>
              <div class="details-content" id="corrSteps"></div>
            </details>
          </div>
        </div>
      </div>
    `;

    $('#corrCompute').addEventListener('click', () => this.compute());
  },

  compute() {
    const xIdx = parseInt($('#corrVarX').value);
    const yIdx = parseInt($('#corrVarY').value);
    const xData = AppState.getColumn(xIdx);
    const yData = AppState.getColumn(yIdx);

    if (!xData.length || !yData.length) {
      Utils.toast('Need data for both variables', 'warning');
      return;
    }
    if (xIdx === yIdx) {
      Utils.toast('Please select two different variables', 'warning');
      return;
    }

    const result = StatsCorrelation.pearsonR(xData, yData);
    AppState.setResult('correlation', result);

    const xName = AppState.data.headers[xIdx];
    const yName = AppState.data.headers[yIdx];

    // Show results
    $('#corrResultsCard').style.display = '';
    $('#corrChartCard').style.display = '';

    const metrics = [
      { label: 'Pearson r', value: Utils.fmt(result.r) },
      { label: 'r\u00B2', value: Utils.fmt(result.r ** 2) },
      { label: 'n pairs', value: result.n },
      { label: 't-statistic', value: Utils.fmt(result.t) },
      { label: 'p-value', value: Utils.pFmt(result.pValue) }
    ];

    $('#corrResultsGrid').innerHTML = metrics.map(m =>
      `<div class="result-card">
        <div class="result-value">${m.value}</div>
        <div class="result-label">${m.label}</div>
      </div>`
    ).join('');

    const sigText = result.pValue < 0.05
      ? `This correlation is <strong>statistically significant</strong> (p = ${Utils.pFmt(result.pValue)}).`
      : `This correlation is <strong>not statistically significant</strong> (p = ${Utils.pFmt(result.pValue)}).`;

    $('#corrInterpretation').innerHTML = `
      The Pearson correlation coefficient between <strong>${xName}</strong> and <strong>${yName}</strong>
      is <strong>r = ${Utils.fmt(result.r)}</strong>, indicating a <strong>${result.interpretation}</strong>.
      ${sigText}
      Approximately <strong>${Utils.fmt(result.r ** 2 * 100, 1)}%</strong> of the variance in ${yName}
      is explained by ${xName}.
    `;

    $('#corrSteps').innerHTML = result.steps.map(s =>
      `<div class="step-line">${Utils.escHtml(s)}</div>`
    ).join('');

    // Scatterplot
    const canvas = document.getElementById('corrChart');
    const w = canvas.parentElement.clientWidth - 32;
    ChartRenderer.scatterplot(canvas, xData, yData, {
      width: w, height: 300,
      title: `${xName} vs ${yName}`,
      xLabel: xName,
      yLabel: yName
    });
  }
};
