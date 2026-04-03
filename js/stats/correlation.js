/* ===== CORRELATION ANALYSIS ===== */

window.StatsCorrelation = {
  covariance(x, y, population = false) {
    const n = Math.min(x.length, y.length);
    if (n < 2) return NaN;
    const mx = StatsDescriptive.mean(x.slice(0, n));
    const my = StatsDescriptive.mean(y.slice(0, n));
    let sum = 0;
    for (let i = 0; i < n; i++) {
      sum += (x[i] - mx) * (y[i] - my);
    }
    return sum / (population ? n : n - 1);
  },

  pearsonR(x, y) {
    const n = Math.min(x.length, y.length);
    if (n < 3) return { r: NaN, interpretation: 'Insufficient data (need at least 3 pairs)' };

    const xSlice = x.slice(0, n);
    const ySlice = y.slice(0, n);
    const mx = StatsDescriptive.mean(xSlice);
    const my = StatsDescriptive.mean(ySlice);

    let sumXY = 0, sumX2 = 0, sumY2 = 0;
    for (let i = 0; i < n; i++) {
      const dx = xSlice[i] - mx;
      const dy = ySlice[i] - my;
      sumXY += dx * dy;
      sumX2 += dx * dx;
      sumY2 += dy * dy;
    }

    if (sumX2 === 0 || sumY2 === 0) {
      return { r: 0, interpretation: 'One or both variables have zero variance' };
    }

    const r = sumXY / Math.sqrt(sumX2 * sumY2);
    const interpretation = Utils.interpretCorrelation(r);

    // t-test for significance
    const t = r * Math.sqrt((n - 2) / (1 - r * r));
    const pValue = Distributions.pFromT(t, n - 2, 2);

    const steps = [
      `n = ${n} pairs`,
      `Mean of X (\u0078\u0304) = ${Utils.fmt(mx)}`,
      `Mean of Y (\u0079\u0304) = ${Utils.fmt(my)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)(y\u1D62 - \u0079\u0304) = ${Utils.fmt(sumXY)}`,
      `\u03A3(x\u1D62 - \u0078\u0304)\u00B2 = ${Utils.fmt(sumX2)}`,
      `\u03A3(y\u1D62 - \u0079\u0304)\u00B2 = ${Utils.fmt(sumY2)}`,
      `r = ${Utils.fmt(sumXY)} / \u221A(${Utils.fmt(sumX2)} \u00D7 ${Utils.fmt(sumY2)})`,
      `r = ${Utils.fmt(r)}`,
      `t-statistic = r\u221A((n-2)/(1-r\u00B2)) = ${Utils.fmt(t)}`,
      `p-value (two-tailed) = ${Utils.pFmt(pValue)}`
    ];

    return { r, interpretation, t, pValue, n, steps };
  }
};
