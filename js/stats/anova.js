/* ===== ONE-WAY ANOVA ===== */

window.StatsAnova = {

  oneWayAnova(groups) {
    // groups: array of arrays, each being one group's data
    const k = groups.length;
    if (k < 2) return null;

    const ns = groups.map(g => g.length);
    const N = ns.reduce((a, b) => a + b, 0);
    if (N <= k) return null;

    const means = groups.map(g => StatsDescriptive.mean(g));
    const grandMean = StatsDescriptive.mean(groups.flat());

    // Sum of Squares Between
    let ssBetween = 0;
    for (let i = 0; i < k; i++) {
      ssBetween += ns[i] * (means[i] - grandMean) ** 2;
    }

    // Sum of Squares Within
    let ssWithin = 0;
    for (let i = 0; i < k; i++) {
      for (let j = 0; j < groups[i].length; j++) {
        ssWithin += (groups[i][j] - means[i]) ** 2;
      }
    }

    const ssTotal = ssBetween + ssWithin;
    const dfBetween = k - 1;
    const dfWithin = N - k;
    const dfTotal = N - 1;
    const msBetween = ssBetween / dfBetween;
    const msWithin = ssWithin / dfWithin;
    const fStat = msWithin === 0 ? Infinity : msBetween / msWithin;
    const pValue = Distributions.pFromF(fStat, dfBetween, dfWithin);
    const fCrit = Distributions.criticalF(CONFIG.DEFAULT_ALPHA, dfBetween, dfWithin);
    const decision = Utils.interpretPValue(pValue, CONFIG.DEFAULT_ALPHA);

    // Eta-squared (effect size)
    const etaSquared = ssTotal === 0 ? 0 : ssBetween / ssTotal;

    const steps = [
      `Number of groups (k) = ${k}`,
      `Total observations (N) = ${N}`,
      `Group sizes: [${ns.join(', ')}]`,
      `Group means: [${means.map(m => Utils.fmt(m)).join(', ')}]`,
      `Grand mean = ${Utils.fmt(grandMean)}`,
      ``,
      `SS_between = \u03A3 n\u1D62(\u0078\u0304\u1D62 - \u0078\u0304)\u00B2 = ${Utils.fmt(ssBetween)}`,
      `SS_within = \u03A3\u03A3 (x\u1D62\u2C7C - \u0078\u0304\u1D62)\u00B2 = ${Utils.fmt(ssWithin)}`,
      `SS_total = ${Utils.fmt(ssTotal)}`,
      ``,
      `df_between = k - 1 = ${dfBetween}`,
      `df_within = N - k = ${dfWithin}`,
      ``,
      `MS_between = SS_between / df_between = ${Utils.fmt(msBetween)}`,
      `MS_within = SS_within / df_within = ${Utils.fmt(msWithin)}`,
      ``,
      `F = MS_between / MS_within = ${Utils.fmt(fStat)}`,
      `Critical F (\u03B1=0.05) = ${Utils.fmt(fCrit)}`,
      `p-value = ${Utils.pFmt(pValue)}`,
      `\u03B7\u00B2 (eta-squared) = ${Utils.fmt(etaSquared)}`,
      ``,
      decision.text
    ];

    return {
      testType: 'One-Way ANOVA',
      k, N, ns, means, grandMean,
      ssBetween, ssWithin, ssTotal,
      dfBetween, dfWithin, dfTotal,
      msBetween, msWithin,
      fStat, fCrit, pValue, etaSquared,
      reject: decision.reject, decision: decision.text, steps
    };
  }
};
