/* ===== HYPOTHESIS TESTING (Z-TESTS & T-TESTS) ===== */

window.StatsHypothesis = {

  /* ===== Z-TESTS ===== */

  zTestOneSample(data, mu0, sigma, alpha, tails) {
    const n = data.length;
    const xbar = StatsDescriptive.mean(data);
    const se = sigma / Math.sqrt(n);
    const z = (xbar - mu0) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC = ${mu0}`,
      tails === 2 ? `H\u2081: \u03BC \u2260 ${mu0}` : (tails === 1 ? `H\u2081: \u03BC > ${mu0}` : `H\u2081: \u03BC < ${mu0}`),
      `n = ${n}`,
      `\u0078\u0304 = ${Utils.fmt(xbar)}`,
      `\u03C3 (known) = ${Utils.fmt(sigma)}`,
      `SE = \u03C3 / \u221An = ${Utils.fmt(sigma)} / \u221A${n} = ${Utils.fmt(se)}`,
      `z = (\u0078\u0304 - \u03BC\u2080) / SE = (${Utils.fmt(xbar)} - ${mu0}) / ${Utils.fmt(se)} = ${Utils.fmt(z)}`,
      `\u03B1 = ${alpha}, Tails = ${tails}`,
      `Critical z = \u00B1${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'One-Sample Z-Test',
      n, xbar, mu0, sigma, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  zTestTwoSample(data1, data2, sigma1, sigma2, alpha, tails) {
    const n1 = data1.length, n2 = data2.length;
    const xbar1 = StatsDescriptive.mean(data1);
    const xbar2 = StatsDescriptive.mean(data2);
    const se = Math.sqrt((sigma1 ** 2) / n1 + (sigma2 ** 2) / n2);
    const z = (xbar1 - xbar2) / se;
    const pValue = Distributions.pFromZ(z, tails);
    const zCrit = Distributions.criticalZ(alpha, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC\u2081 = \u03BC\u2082`,
      tails === 2 ? `H\u2081: \u03BC\u2081 \u2260 \u03BC\u2082` : `H\u2081: \u03BC\u2081 ${tails === 1 ? '>' : '<'} \u03BC\u2082`,
      `n\u2081 = ${n1}, n\u2082 = ${n2}`,
      `\u0078\u0304\u2081 = ${Utils.fmt(xbar1)}, \u0078\u0304\u2082 = ${Utils.fmt(xbar2)}`,
      `\u03C3\u2081 = ${Utils.fmt(sigma1)}, \u03C3\u2082 = ${Utils.fmt(sigma2)}`,
      `SE = \u221A(\u03C3\u2081\u00B2/n\u2081 + \u03C3\u2082\u00B2/n\u2082) = ${Utils.fmt(se)}`,
      `z = (\u0078\u0304\u2081 - \u0078\u0304\u2082) / SE = ${Utils.fmt(z)}`,
      `Critical z = \u00B1${Utils.fmt(zCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Two-Sample Z-Test',
      n1, n2, xbar1, xbar2, sigma1, sigma2, se, z, pValue, zCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  /* ===== T-TESTS ===== */

  tTestOneSample(data, mu0, alpha, tails) {
    const n = data.length;
    const xbar = StatsDescriptive.mean(data);
    const s = StatsDescriptive.stddev(data, false);
    const se = s / Math.sqrt(n);
    const df = n - 1;
    const t = (xbar - mu0) / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC = ${mu0}`,
      tails === 2 ? `H\u2081: \u03BC \u2260 ${mu0}` : `H\u2081: \u03BC ${tails === 1 ? '>' : '<'} ${mu0}`,
      `n = ${n}, df = ${df}`,
      `\u0078\u0304 = ${Utils.fmt(xbar)}`,
      `s = ${Utils.fmt(s)}`,
      `SE = s / \u221An = ${Utils.fmt(s)} / \u221A${n} = ${Utils.fmt(se)}`,
      `t = (\u0078\u0304 - \u03BC\u2080) / SE = (${Utils.fmt(xbar)} - ${mu0}) / ${Utils.fmt(se)} = ${Utils.fmt(t)}`,
      `\u03B1 = ${alpha}, df = ${df}, Tails = ${tails}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'One-Sample T-Test',
      n, df, xbar, mu0, s, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  tTestTwoSample(data1, data2, alpha, tails, equalVar = false) {
    const n1 = data1.length, n2 = data2.length;
    const xbar1 = StatsDescriptive.mean(data1);
    const xbar2 = StatsDescriptive.mean(data2);
    const s1 = StatsDescriptive.stddev(data1, false);
    const s2 = StatsDescriptive.stddev(data2, false);
    const v1 = s1 ** 2, v2 = s2 ** 2;

    let se, df;

    if (equalVar) {
      // Pooled variance
      const sp2 = ((n1 - 1) * v1 + (n2 - 1) * v2) / (n1 + n2 - 2);
      se = Math.sqrt(sp2 * (1 / n1 + 1 / n2));
      df = n1 + n2 - 2;
    } else {
      // Welch's t-test
      se = Math.sqrt(v1 / n1 + v2 / n2);
      const num = (v1 / n1 + v2 / n2) ** 2;
      const denom = (v1 / n1) ** 2 / (n1 - 1) + (v2 / n2) ** 2 / (n2 - 1);
      df = Math.floor(num / denom);
    }

    const t = (xbar1 - xbar2) / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC\u2081 = \u03BC\u2082`,
      tails === 2 ? `H\u2081: \u03BC\u2081 \u2260 \u03BC\u2082` : `H\u2081: \u03BC\u2081 ${tails === 1 ? '>' : '<'} \u03BC\u2082`,
      `n\u2081 = ${n1}, n\u2082 = ${n2}`,
      `\u0078\u0304\u2081 = ${Utils.fmt(xbar1)}, \u0078\u0304\u2082 = ${Utils.fmt(xbar2)}`,
      `s\u2081 = ${Utils.fmt(s1)}, s\u2082 = ${Utils.fmt(s2)}`,
      equalVar ? `Pooled variance (equal var assumed)` : `Welch\u2019s t-test (unequal var)`,
      `SE = ${Utils.fmt(se)}`,
      `df = ${df}`,
      `t = (\u0078\u0304\u2081 - \u0078\u0304\u2082) / SE = ${Utils.fmt(t)}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: equalVar ? 'Independent Two-Sample T-Test (Equal Variance)' : 'Independent Two-Sample T-Test (Welch)',
      n1, n2, df, xbar1, xbar2, s1, s2, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  },

  tTestPaired(data1, data2, alpha, tails) {
    const n = Math.min(data1.length, data2.length);
    const diffs = [];
    for (let i = 0; i < n; i++) {
      diffs.push(data1[i] - data2[i]);
    }

    const dbar = StatsDescriptive.mean(diffs);
    const sd = StatsDescriptive.stddev(diffs, false);
    const se = sd / Math.sqrt(n);
    const df = n - 1;
    const t = dbar / se;
    const pValue = Distributions.pFromT(t, df, tails);
    const tCrit = Distributions.criticalT(alpha, df, tails);
    const decision = Utils.interpretPValue(pValue, alpha);

    const steps = [
      `H\u2080: \u03BC_d = 0 (mean difference is zero)`,
      tails === 2 ? `H\u2081: \u03BC_d \u2260 0` : `H\u2081: \u03BC_d ${tails === 1 ? '>' : '<'} 0`,
      `n = ${n} pairs`,
      `Differences: [${diffs.slice(0, 10).map(d => Utils.fmt(d, 2)).join(', ')}${n > 10 ? ', ...' : ''}]`,
      `Mean difference (\u0064\u0304) = ${Utils.fmt(dbar)}`,
      `SD of differences (s_d) = ${Utils.fmt(sd)}`,
      `SE = s_d / \u221An = ${Utils.fmt(sd)} / \u221A${n} = ${Utils.fmt(se)}`,
      `df = n - 1 = ${df}`,
      `t = \u0064\u0304 / SE = ${Utils.fmt(dbar)} / ${Utils.fmt(se)} = ${Utils.fmt(t)}`,
      `Critical t = \u00B1${Utils.fmt(tCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      decision.text
    ];

    return {
      testType: 'Paired T-Test',
      n, df, dbar, sd, se, t, pValue, tCrit, alpha, tails,
      reject: decision.reject, decision: decision.text, steps
    };
  }
};
