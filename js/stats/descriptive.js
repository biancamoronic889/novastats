/* ===== DESCRIPTIVE STATISTICS ENGINE ===== */

window.StatsDescriptive = {
  sum(arr) {
    return arr.reduce((a, b) => a + b, 0);
  },

  mean(arr) {
    if (!arr.length) return NaN;
    return this.sum(arr) / arr.length;
  },

  median(arr) {
    if (!arr.length) return NaN;
    const sorted = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 !== 0
      ? sorted[mid]
      : (sorted[mid - 1] + sorted[mid]) / 2;
  },

  mode(arr) {
    if (!arr.length) return { values: [], count: 0 };
    const freq = {};
    let maxFreq = 0;
    arr.forEach(v => {
      freq[v] = (freq[v] || 0) + 1;
      if (freq[v] > maxFreq) maxFreq = freq[v];
    });
    if (maxFreq === 1) return { values: [], count: 1, text: 'No mode (all values unique)' };
    const modes = Object.keys(freq).filter(k => freq[k] === maxFreq).map(Number);
    return { values: modes, count: maxFreq, text: modes.join(', ') };
  },

  variance(arr, population = false) {
    if (arr.length < 2) return NaN;
    const m = this.mean(arr);
    const sumSq = arr.reduce((s, v) => s + (v - m) ** 2, 0);
    return sumSq / (population ? arr.length : arr.length - 1);
  },

  stddev(arr, population = false) {
    return Math.sqrt(this.variance(arr, population));
  },

  min(arr) {
    return arr.length ? Math.min(...arr) : NaN;
  },

  max(arr) {
    return arr.length ? Math.max(...arr) : NaN;
  },

  range(arr) {
    return arr.length ? this.max(arr) - this.min(arr) : NaN;
  },

  quartiles(arr) {
    if (arr.length < 4) return { q1: NaN, q2: NaN, q3: NaN, iqr: NaN };
    const sorted = [...arr].sort((a, b) => a - b);
    const q2 = this.median(sorted);
    const mid = Math.floor(sorted.length / 2);
    const lower = sorted.length % 2 !== 0 ? sorted.slice(0, mid) : sorted.slice(0, mid);
    const upper = sorted.length % 2 !== 0 ? sorted.slice(mid + 1) : sorted.slice(mid);
    const q1 = this.median(lower);
    const q3 = this.median(upper);
    return { q1, q2, q3, iqr: q3 - q1 };
  },

  compute(arr) {
    const n = arr.length;
    const m = this.mean(arr);
    const med = this.median(arr);
    const mod = this.mode(arr);
    const sVar = this.variance(arr, false);
    const pVar = this.variance(arr, true);
    const sStd = this.stddev(arr, false);
    const pStd = this.stddev(arr, true);
    const mn = this.min(arr);
    const mx = this.max(arr);
    const rng = this.range(arr);
    const q = this.quartiles(arr);
    const sm = this.sum(arr);

    const steps = [
      `n = ${n}`,
      `Sum = ${Utils.fmt(sm)}`,
      `Mean = Sum / n = ${Utils.fmt(sm)} / ${n} = ${Utils.fmt(m)}`,
      `Sorted: [${[...arr].sort((a, b) => a - b).slice(0, 20).map(v => Utils.fmt(v, 2)).join(', ')}${n > 20 ? ', ...' : ''}]`,
      `Median = ${Utils.fmt(med)}`,
      `Mode = ${mod.text || mod.values.join(', ')} (frequency: ${mod.count})`,
      `Sample Variance = \u03A3(x\u1D62 - x\u0304)\u00B2 / (n-1) = ${Utils.fmt(sVar)}`,
      `Population Variance = \u03A3(x\u1D62 - x\u0304)\u00B2 / n = ${Utils.fmt(pVar)}`,
      `Sample Std Dev = \u221A(Sample Variance) = ${Utils.fmt(sStd)}`,
      `Population Std Dev = \u221A(Pop Variance) = ${Utils.fmt(pStd)}`,
      `Min = ${Utils.fmt(mn)}, Max = ${Utils.fmt(mx)}, Range = ${Utils.fmt(rng)}`,
      `Q1 = ${Utils.fmt(q.q1)}, Q2 = ${Utils.fmt(q.q2)}, Q3 = ${Utils.fmt(q.q3)}, IQR = ${Utils.fmt(q.iqr)}`
    ];

    return {
      n, sum: sm, mean: m, median: med, mode: mod,
      sampleVariance: sVar, populationVariance: pVar,
      sampleStdDev: sStd, populationStdDev: pStd,
      min: mn, max: mx, range: rng,
      q1: q.q1, q2: q.q2, q3: q.q3, iqr: q.iqr,
      steps
    };
  }
};
