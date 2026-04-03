/* ===== STATISTICAL DISTRIBUTION FUNCTIONS ===== */
/* Numerical approximations for CDF of Normal, t, Chi-Square, F distributions */

window.Distributions = {
  /* ===== GAMMA & BETA HELPER FUNCTIONS ===== */

  // Log-gamma function (Lanczos approximation)
  lnGamma(x) {
    const g = 7;
    const c = [
      0.99999999999980993, 676.5203681218851, -1259.1392167224028,
      771.32342877765313, -176.61502916214059, 12.507343278686905,
      -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7
    ];
    if (x < 0.5) {
      return Math.log(Math.PI / Math.sin(Math.PI * x)) - this.lnGamma(1 - x);
    }
    x -= 1;
    let a = c[0];
    const t = x + g + 0.5;
    for (let i = 1; i < g + 2; i++) {
      a += c[i] / (x + i);
    }
    return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
  },

  gamma(x) {
    return Math.exp(this.lnGamma(x));
  },

  // Regularized lower incomplete gamma function P(a, x)
  // Uses series expansion for small x, continued fraction for large x
  gammainc(a, x) {
    if (x < 0) return 0;
    if (x === 0) return 0;
    if (!isFinite(x)) return 1;

    const lnGammaA = this.lnGamma(a);

    if (x < a + 1) {
      // Series expansion: P(a,x) = e^(-x) * x^a * sum_{n=0}^inf x^n / (a*(a+1)*...*(a+n))
      let ap = a;
      let sum = 1.0 / a;
      let del = 1.0 / a;
      for (let n = 1; n < 300; n++) {
        ap += 1;
        del *= x / ap;
        sum += del;
        if (Math.abs(del) < Math.abs(sum) * 1e-14) break;
      }
      return sum * Math.exp(-x + a * Math.log(x) - lnGammaA);
    } else {
      // Continued fraction representation for Q(a,x) = 1 - P(a,x)
      // Using modified Lentz's method
      let b = x + 1 - a;
      let c = 1e30;
      let d = 1 / b;
      let h = d;
      for (let i = 1; i < 300; i++) {
        const an = -i * (i - a);
        b += 2;
        d = an * d + b;
        if (Math.abs(d) < 1e-30) d = 1e-30;
        c = b + an / c;
        if (Math.abs(c) < 1e-30) c = 1e-30;
        d = 1.0 / d;
        const del = d * c;
        h *= del;
        if (Math.abs(del - 1.0) < 1e-14) break;
      }
      // Q(a,x) = e^(-x) * x^a * h / Gamma(a)
      const Q = Math.exp(-x + a * Math.log(x) - lnGammaA) * h;
      return 1 - Q;
    }
  },

  // Regularized incomplete beta function I_x(a, b)
  betainc(x, a, b) {
    if (x <= 0) return 0;
    if (x >= 1) return 1;

    const lnBeta = this.lnGamma(a) + this.lnGamma(b) - this.lnGamma(a + b);
    const front = Math.exp(Math.log(x) * a + Math.log(1 - x) * b - lnBeta);

    if (x < (a + 1) / (a + b + 2)) {
      return front * this.betacf(x, a, b) / a;
    } else {
      return 1 - front * this.betacf(1 - x, b, a) / b;
    }
  },

  // Continued fraction for incomplete beta (Lentz's method)
  betacf(x, a, b) {
    const maxIter = 200;
    const eps = 1e-14;
    let qab = a + b;
    let qap = a + 1;
    let qam = a - 1;
    let c = 1;
    let d = 1 - qab * x / qap;
    if (Math.abs(d) < 1e-30) d = 1e-30;
    d = 1 / d;
    let h = d;

    for (let m = 1; m <= maxIter; m++) {
      let m2 = 2 * m;
      // Even step
      let aa = m * (b - m) * x / ((qam + m2) * (a + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      h *= d * c;

      // Odd step
      aa = -(a + m) * (qab + m) * x / ((a + m2) * (qap + m2));
      d = 1 + aa * d;
      if (Math.abs(d) < 1e-30) d = 1e-30;
      c = 1 + aa / c;
      if (Math.abs(c) < 1e-30) c = 1e-30;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < eps) break;
    }
    return h;
  },

  /* ===== NORMAL DISTRIBUTION ===== */

  // Standard normal CDF using rational approximation (Abramowitz & Stegun 26.2.17)
  normalCDF(z) {
    if (z < -8) return 0;
    if (z > 8) return 1;

    let sum = 0, term = z;
    for (let i = 3; sum + term !== sum; i += 2) {
      sum += term;
      term = term * z * z / i;
    }
    return 0.5 + sum * Math.exp(-z * z / 2 - 0.91893853320467274178);
  },

  // Inverse normal CDF (rational approximation by Peter Acklam)
  normalInv(p) {
    if (p <= 0) return -Infinity;
    if (p >= 1) return Infinity;

    const a = [
      -3.969683028665376e+01, 2.209460984245205e+02,
      -2.759285104469687e+02, 1.383577518672690e+02,
      -3.066479806614716e+01, 2.506628277459239e+00
    ];
    const b = [
      -5.447609879822406e+01, 1.615858368580409e+02,
      -1.556989798598866e+02, 6.680131188771972e+01,
      -1.328068155288572e+01
    ];
    const c = [
      -7.784894002430293e-03, -3.223964580411365e-01,
      -2.400758277161838e+00, -2.549732539343734e+00,
      4.374664141464968e+00, 2.938163982698783e+00
    ];
    const d = [
      7.784695709041462e-03, 3.224671290700398e-01,
      2.445134137142996e+00, 3.754408661907416e+00
    ];

    const pLow = 0.02425;
    const pHigh = 1 - pLow;
    let q, r;

    if (p < pLow) {
      q = Math.sqrt(-2 * Math.log(p));
      return (((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
             ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    } else if (p <= pHigh) {
      q = p - 0.5;
      r = q * q;
      return (((((a[0]*r+a[1])*r+a[2])*r+a[3])*r+a[4])*r+a[5])*q /
             (((((b[0]*r+b[1])*r+b[2])*r+b[3])*r+b[4])*r+1);
    } else {
      q = Math.sqrt(-2 * Math.log(1 - p));
      return -(((((c[0]*q+c[1])*q+c[2])*q+c[3])*q+c[4])*q+c[5]) /
              ((((d[0]*q+d[1])*q+d[2])*q+d[3])*q+1);
    }
  },

  // p-value from z-score
  pFromZ(z, tails = 2) {
    const p = 1 - this.normalCDF(Math.abs(z));
    return tails === 2 ? 2 * p : p;
  },

  // Critical z-value
  criticalZ(alpha, tails = 2) {
    const p = tails === 2 ? 1 - alpha / 2 : 1 - alpha;
    return this.normalInv(p);
  },

  /* ===== T-DISTRIBUTION ===== */

  tCDF(t, df) {
    const x = df / (df + t * t);
    return 1 - 0.5 * this.betainc(x, df / 2, 0.5);
  },

  pFromT(t, df, tails = 2) {
    const p = 1 - this.tCDF(Math.abs(t), df);
    return tails === 2 ? 2 * p : p;
  },

  // Inverse t-distribution (Newton's method using normal approximation as seed)
  tInv(p, df) {
    // Use normal approx as starting guess, then refine
    let x = this.normalInv(p);
    // For small df, adjust
    if (df < 5) {
      // Simple Newton iteration
      for (let i = 0; i < 20; i++) {
        const cdf = this.tCDF(x, df);
        const halfP = (1 + cdf - (1 - this.tCDF(-x, df))) / 2;
        // Approximate using the relationship
        const err = halfP - p;
        if (Math.abs(err) < 1e-10) break;
        // Numerical derivative
        const dx = 0.0001;
        const deriv = (this.tCDF(x + dx, df) - this.tCDF(x - dx, df)) / (2 * dx);
        if (deriv === 0) break;
        x -= err / deriv;
      }
    }
    return x;
  },

  criticalT(alpha, df, tails = 2) {
    const p = tails === 2 ? 1 - alpha / 2 : 1 - alpha;
    // Bisection method for reliability
    let lo = 0, hi = 1000;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const cdf = this.tCDF(mid, df);
      if (cdf < p) lo = mid;
      else hi = mid;
      if (hi - lo < 1e-8) break;
    }
    return (lo + hi) / 2;
  },

  /* ===== CHI-SQUARE DISTRIBUTION ===== */

  chiSquareCDF(x, df) {
    if (x <= 0) return 0;
    return this.gammainc(df / 2, x / 2);
  },

  pFromChiSquare(chi2, df) {
    return 1 - this.chiSquareCDF(chi2, df);
  },

  criticalChiSquare(alpha, df) {
    // Bisection
    let lo = 0, hi = df + 10 * Math.sqrt(2 * df);
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const p = this.pFromChiSquare(mid, df);
      if (p > alpha) lo = mid;
      else hi = mid;
      if (hi - lo < 1e-8) break;
    }
    return (lo + hi) / 2;
  },

  /* ===== F-DISTRIBUTION ===== */

  fCDF(f, df1, df2) {
    if (f <= 0) return 0;
    const x = df1 * f / (df1 * f + df2);
    return this.betainc(x, df1 / 2, df2 / 2);
  },

  pFromF(f, df1, df2) {
    return 1 - this.fCDF(f, df1, df2);
  },

  criticalF(alpha, df1, df2) {
    // Bisection
    let lo = 0, hi = 100;
    // Widen if needed
    while (this.pFromF(hi, df1, df2) > alpha) hi *= 2;
    for (let i = 0; i < 100; i++) {
      const mid = (lo + hi) / 2;
      const p = this.pFromF(mid, df1, df2);
      if (p > alpha) lo = mid;
      else hi = mid;
      if (hi - lo < 1e-8) break;
    }
    return (lo + hi) / 2;
  }
};
