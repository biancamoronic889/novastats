/* ===== CHI-SQUARE TESTS ===== */

window.StatsChiSquare = {

  chiSquareIndependence(observed) {
    const rows = observed.length;
    const cols = observed[0].length;
    const rowTotals = observed.map(row => row.reduce((a, b) => a + b, 0));
    const colTotals = [];
    for (let j = 0; j < cols; j++) {
      let sum = 0;
      for (let i = 0; i < rows; i++) sum += observed[i][j];
      colTotals.push(sum);
    }
    const grandTotal = rowTotals.reduce((a, b) => a + b, 0);

    if (grandTotal === 0) return null;

    // Expected frequencies
    const expected = [];
    for (let i = 0; i < rows; i++) {
      expected[i] = [];
      for (let j = 0; j < cols; j++) {
        expected[i][j] = (rowTotals[i] * colTotals[j]) / grandTotal;
      }
    }

    // Chi-square statistic
    let chi2 = 0;
    const contributions = [];
    for (let i = 0; i < rows; i++) {
      contributions[i] = [];
      for (let j = 0; j < cols; j++) {
        const e = expected[i][j];
        if (e === 0) {
          contributions[i][j] = 0;
        } else {
          contributions[i][j] = (observed[i][j] - e) ** 2 / e;
        }
        chi2 += contributions[i][j];
      }
    }

    const df = (rows - 1) * (cols - 1);
    const pValue = Distributions.pFromChiSquare(chi2, df);
    const critValue = Distributions.criticalChiSquare(CONFIG.DEFAULT_ALPHA, df);
    const decision = Utils.interpretPValue(pValue, CONFIG.DEFAULT_ALPHA);

    const steps = [
      `Observed table: ${rows} rows \u00D7 ${cols} columns`,
      `Row totals: [${rowTotals.map(v => Utils.fmt(v, 0)).join(', ')}]`,
      `Column totals: [${colTotals.map(v => Utils.fmt(v, 0)).join(', ')}]`,
      `Grand total = ${grandTotal}`,
      `Expected frequencies: E\u1D62\u2C7C = (Row total \u00D7 Col total) / Grand total`,
      ...expected.map((row, i) =>
        `  Row ${i + 1}: [${row.map(v => Utils.fmt(v, 2)).join(', ')}]`
      ),
      `\u03C7\u00B2 = \u03A3 (O - E)\u00B2/E = ${Utils.fmt(chi2)}`,
      `df = (${rows}-1)(${cols}-1) = ${df}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      `Critical value (\u03B1=0.05) = ${Utils.fmt(critValue)}`,
      decision.text
    ];

    return {
      testType: 'Chi-Square Test of Independence',
      chi2, df, pValue, critValue,
      expected, contributions,
      rowTotals, colTotals, grandTotal,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  chiSquareGoodnessOfFit(observed, expected) {
    const n = observed.length;
    if (n === 0 || n !== expected.length) return null;

    let chi2 = 0;
    const contributions = [];
    for (let i = 0; i < n; i++) {
      if (expected[i] === 0) {
        contributions.push(0);
      } else {
        contributions.push((observed[i] - expected[i]) ** 2 / expected[i]);
      }
      chi2 += contributions[i];
    }

    const df = n - 1;
    const pValue = Distributions.pFromChiSquare(chi2, df);
    const critValue = Distributions.criticalChiSquare(CONFIG.DEFAULT_ALPHA, df);
    const decision = Utils.interpretPValue(pValue, CONFIG.DEFAULT_ALPHA);

    const steps = [
      `Number of categories = ${n}`,
      `Observed: [${observed.map(v => Utils.fmt(v, 0)).join(', ')}]`,
      `Expected: [${expected.map(v => Utils.fmt(v, 2)).join(', ')}]`,
      ...contributions.map((c, i) =>
        `  Category ${i + 1}: (${observed[i]} - ${Utils.fmt(expected[i], 2)})\u00B2 / ${Utils.fmt(expected[i], 2)} = ${Utils.fmt(c)}`
      ),
      `\u03C7\u00B2 = ${Utils.fmt(chi2)}`,
      `df = ${n} - 1 = ${df}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      `Critical value (\u03B1=0.05) = ${Utils.fmt(critValue)}`,
      decision.text
    ];

    return {
      testType: 'Chi-Square Goodness-of-Fit',
      chi2, df, pValue, critValue,
      contributions,
      reject: decision.reject, decision: decision.text, steps
    };
  }
};
