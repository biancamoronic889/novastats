/* ===== SIMPLE LINEAR REGRESSION ===== */

window.StatsRegression = {
  linearRegression(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return null;

    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);
    const mx = StatsDescriptive.mean(xSlice);
    const my = StatsDescriptive.mean(ySlice);

    let sumXY = 0, sumX2 = 0, sumY2 = 0, ssRes = 0;
    for (let i = 0; i < n; i++) {
      sumXY += (xSlice[i] - mx) * (ySlice[i] - my);
      sumX2 += (xSlice[i] - mx) ** 2;
      sumY2 += (ySlice[i] - my) ** 2;
    }

    if (sumX2 === 0) return null;

    const slope = sumXY / sumX2;
    const intercept = my - slope * mx;

    // R-squared
    for (let i = 0; i < n; i++) {
      const predicted = slope * xSlice[i] + intercept;
      ssRes += (ySlice[i] - predicted) ** 2;
    }
    const ssTot = sumY2;
    const rSquared = ssTot === 0 ? 0 : 1 - ssRes / ssTot;

    // Standard error of slope
    const se = n > 2 ? Math.sqrt(ssRes / (n - 2) / sumX2) : NaN;

    // Format equation
    const sign = intercept >= 0 ? '+' : '-';
    const equation = `y = ${Utils.fmt(slope)}x ${sign} ${Utils.fmt(Math.abs(intercept))}`;

    const steps = [
      `n = ${n} data points`,
      `Mean of X (\u0078\u0304) = ${Utils.fmt(mx)}`,
      `Mean of Y (\u0079\u0304) = ${Utils.fmt(my)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)(y\u1D62 - \u0079\u0304) = ${Utils.fmt(sumXY)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)\u00B2 = ${Utils.fmt(sumX2)}`,
      `Slope (b\u2081) = ${Utils.fmt(sumXY)} / ${Utils.fmt(sumX2)} = ${Utils.fmt(slope)}`,
      `Intercept (b\u2080) = ${Utils.fmt(my)} - ${Utils.fmt(slope)} \u00D7 ${Utils.fmt(mx)} = ${Utils.fmt(intercept)}`,
      `Equation: ${equation}`,
      `SS_res = ${Utils.fmt(ssRes)}`,
      `SS_tot = ${Utils.fmt(ssTot)}`,
      `R\u00B2 = 1 - SS_res/SS_tot = 1 - ${Utils.fmt(ssRes)}/${Utils.fmt(ssTot)} = ${Utils.fmt(rSquared)}`,
      `Standard Error of Slope = ${Utils.fmt(se)}`
    ];

    return { slope, intercept, rSquared, equation, se, n, steps };
  },

  predict(model, xValue) {
    if (!model) return NaN;
    return model.slope * xValue + model.intercept;
  }
};
