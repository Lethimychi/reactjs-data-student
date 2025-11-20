/**
 * Chart Helper Utilities
 * Reusable functions for dynamic chart scaling and axis calculations
 */

/**
 * Calculate dynamic Y-axis maximum value for responsive charts
 *
 * @param values - Array of numeric values to analyze
 * @param minClamp - Minimum value to clamp the result to (ensures minimum visible range)
 * @param step - Step size for rounding (default: 1). Use 10 for DRL charts, 1 for GPA charts
 * @returns Dynamic maximum value for Y-axis
 *
 * @example
 * // For GPA chart with max value 5.5
 * getDynamicAxisMax([3.2, 4.5, 5.5], 6, 1) // Returns 6 (clamped to minimum)
 *
 * @example
 * // For GPA chart with max value 8.3
 * getDynamicAxisMax([6.5, 7.2, 8.3], 6, 1) // Returns 9 (rounded up)
 *
 * @example
 * // For DRL chart with max value 45
 * getDynamicAxisMax([30, 40, 45], 60, 10) // Returns 60 (clamped to minimum)
 *
 * @example
 * // For DRL chart with max value 78
 * getDynamicAxisMax([65, 72, 78], 60, 10) // Returns 80 (rounded to nearest 10)
 */
export const getDynamicAxisMax = (
  values: number[],
  minClamp: number,
  step: number = 1
): number => {
  // Handle edge cases
  if (!values || values.length === 0) return minClamp;

  // Filter out invalid values and find maximum
  const validValues = values.filter(
    (v) => Number.isFinite(v) && !Number.isNaN(v)
  );
  if (validValues.length === 0) return minClamp;

  const maxValue = Math.max(...validValues);

  // Apply minimum clamp
  if (maxValue < minClamp) return minClamp;

  // Round up to nearest step
  return Math.ceil(maxValue / step) * step;
};

/**
 * Calculate dynamic Y-axis maximum for multiple data series
 * Useful for combo charts (bar + line) where you need to compare across multiple datasets
 *
 * @param dataSets - Array of arrays containing numeric values from different series
 * @param minClamp - Minimum value to clamp the result to
 * @param step - Step size for rounding (default: 1)
 * @returns Dynamic maximum value for Y-axis
 *
 * @example
 * // For comparison chart with student scores and class averages
 * const studentScores = [6.5, 7.2, 8.0];
 * const classAverages = [7.0, 7.5, 6.8];
 * getDynamicAxisMaxMulti([studentScores, classAverages], 6, 1) // Returns 8
 */
export const getDynamicAxisMaxMulti = (
  dataSets: number[][],
  minClamp: number,
  step: number = 1
): number => {
  const allValues = dataSets.flat();
  return getDynamicAxisMax(allValues, minClamp, step);
};

/**
 * Generate nice tick values for Y-axis based on max value
 * Creates evenly spaced tick marks for better readability
 *
 * @param maxValue - Maximum value for the axis
 * @param tickCount - Desired number of ticks (default: 5)
 * @returns Array of tick values
 *
 * @example
 * generateAxisTicks(80, 5) // Returns [0, 20, 40, 60, 80]
 */
export const generateAxisTicks = (
  maxValue: number,
  tickCount: number = 5
): number[] => {
  const step = maxValue / (tickCount - 1);
  return Array.from({ length: tickCount }, (_, i) => Math.round(i * step));
};
