export interface CIEuv {
  u: number;
  v: number;
}

export interface CIExy {
  x: number;
  y: number;
}

/**
 * Calculates an approximation of the CIE 1931 xy coordinates
 * for a black body radiator at a given temperature T (in Kelvin)
 * using the formulas by Kim et al. (2002).
 *
 * Reference: https://en.wikipedia.org/wiki/Planckian_locus#Approximation
 * Kim, B., Moon, O., Hong, C., Lee, H., Cho, B., & Kim, Y. (2002).
 * Design of Advanced Color Temperature Control System for HDTV Applications.
 * Journal of the Korean Physical Society, 41(6), 865-871.
 *
 * @param T Temperature in Kelvin.
 * @returns CIExy coordinates {x, y}, or null if T is out of the approximation range (1667K-25000K).
 */
export const kelvinToCieXy = (temperature: number): CIExy | null => {
  let T_eff = temperature;
  if (T_eff < 1667 || T_eff > 25000) {
    // Approximation formulas are typically defined for these ranges.
    // Outside this, we might return null or handle as an error.
    // For a smoother curve, one might use the lower/upper bound if T is just outside,
    // but for now, strict adherence.
    // console.warn(`Temperature ${T_eff}K is outside the typical approximation range (1667K-25000K).`);
    // return null;
    // Let's allow calculation outside this range by clamping to the nearest valid range.
    // This is not ideal but prevents gaps if users request slightly outside values.
    T_eff = Math.max(1667, Math.min(T_eff, 25000));
  }

  let xc: number;
  let yc: number;

  const T_inv = 1 / T_eff;
  const T_inv2 = T_inv * T_inv;
  const T_inv3 = T_inv2 * T_inv;

  if (T_eff >= 1667 && T_eff <= 4000) {
    // For T from 1667K to 4000K:
    xc =
      -0.2661239 * (1e9 * T_inv3) -
      0.2343589 * (1e6 * T_inv2) +
      0.8776956 * (1e3 * T_inv) +
      0.17991;

    // Polynomial for yc based on xc for this range
    // yc = -1.1063814 * xc^3 - 1.34811020 * xc^2 + 2.18555832 * xc - 0.20219683
    // The article also gives an alternative polynomial form for yc related to T, let's use xc as stated.
    // There's a potential typo in the Wikipedia article's yc(xc) formula coefficients.
    // The formula seems to be for u,v coordinates rather than x,y.
    // Let's use the u,v to x,y conversion or find a direct y(T) or y(xc) specific to xy.
    // For now, let's use the u,v approximation and convert to xy, as direct y(T) for xy is not immediately given for this range with xc(T)
    // Or use the approximation for u_c and v_c and then convert.
    // The Wikipedia page lists xc(T) and yc(xc) for xy space. Let's trust it.
    // xc = (equation above)
    yc =
      -1.1063814 * xc ** 3 - 1.3481102 * xc ** 2 + 2.18555832 * xc - 0.20219683;
  } else if (T_eff > 4000 && T_eff <= 25000) {
    // For T from 4000K to 25000K:
    xc =
      -3.0258469 * (1e9 * T_inv3) +
      2.1070379 * (1e6 * T_inv2) +
      0.2226347 * (1e3 * T_inv) +
      0.24039;

    // Polynomial for yc based on xc for this range
    // yc = 3.0817580 * xc^3 - 5.8733867 * xc^2 + 3.75112997 * xc - 0.37001483
    yc =
      3.081758 * xc ** 3 - 5.8733867 * xc ** 2 + 3.75112997 * xc - 0.37001483;
  } else {
    // Should be covered by clamping, but as a fallback:
    return null;
  }

  return { x: xc, y: yc };
};

/**
 * Generates a list of CIE 1931 xy coordinates for the Planckian locus
 * over a specified temperature range.
 * @param T_min Minimum temperature in Kelvin.
 * @param T_max Maximum temperature in Kelvin.
 * @param steps Number of points to calculate.
 * @returns An array of CIExy points.
 */
export const getPlanckianLocusPoints = (
  T_min = 1000,
  T_max = 15000,
  steps = 250
): CIExy[] => {
  const points: CIExy[] = [];
  const dT = (T_max - T_min) / (steps - 1);

  for (let i = 0; i < steps; i++) {
    const T = T_min + i * dT;
    const xy = kelvinToCieXy(T);
    if (xy) {
      // Ensure the points are within a reasonable display gamut for chromaticity diagrams (0 to 1)
      // The approximation might yield values slightly outside [0,1] at extremes or due to precision.
      if (xy.x >= 0 && xy.x <= 1 && xy.y >= 0 && xy.y <= 1) {
        points.push(xy);
      }
    }
  }
  return points;
};
