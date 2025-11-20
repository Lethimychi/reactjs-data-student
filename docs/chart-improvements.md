# Chart Improvements - Dynamic Y-Axis Scaling

## Overview

This document outlines the dynamic Y-axis scaling implementation for student performance analytics charts. All charts now feature responsive, data-driven axis ranges that improve visualization clarity.

---

## ✅ Implemented Charts

### 1️⃣ **GPA Trend Over Semesters**

**Location:** `studentDashboard.tsx` - Line ~1295

**Implementation:**

```typescript
const chartGpaData = computedGpaData ?? currentStudent.gpaData;

// Calculate dynamic Y-axis max
const maxGpa =
  chartGpaData.length > 0 ? Math.max(...chartGpaData.map((d) => d.gpa)) : 0;

const dynamicYMax = maxGpa < 6 ? 6 : Math.ceil(maxGpa);

// Apply to YAxis
<YAxis domain={[0, dynamicYMax]} stroke="#64748b" />;
```

**Behavior:**

- Student max GPA = **5.5** → Y-axis: `[0, 6]` (clamped to minimum)
- Student max GPA = **7.3** → Y-axis: `[0, 8]` (rounded up)
- Student max GPA = **8.0** → Y-axis: `[0, 8]` (exact integer)
- Student max GPA = **9.2** → Y-axis: `[0, 10]` (rounded up)

---

### 2️⃣ **Class Average Comparison (Bar + Line Combo)**

**Location:** `studentDashboard.tsx` - Line ~1978

**Implementation:**

```typescript
// Calculate dynamic Y-axis max for comparison chart
const allScores = filteredComparison.flatMap((d) => [
  d.student || 0,
  d.average || 0,
]);
const dynamicComparisonMax = getDynamicAxisMax(allScores, 6, 1);

<YAxis stroke="#64748b" domain={[0, dynamicComparisonMax]} />;
```

**Behavior:**

- Analyzes **both** student scores and class averages
- Min clamp: `6` (ensures reasonable range for low scores)
- Step: `1` (rounds to nearest integer)

**Example:**

- Student scores: `[6.5, 7.2, 8.0]`
- Class averages: `[7.0, 7.5, 6.8]`
- → Max = `8.0` → Y-axis: `[0, 8]`

---

### 3️⃣ **DRL Trend Over Semesters**

**Location:** `studentDashboard.tsx` - Line ~2142

**Implementation:**

```typescript
// Calculate dynamic Y-axis max for DRL chart
const drlScores = (currentStudent.trainingScoreData || []).map(
  (d) => d.score || 0
);
const maxDrl = Math.max(...drlScores.filter((v) => Number.isFinite(v)));
const dynamicDrlMax = maxDrl < 60 ? 60 : Math.ceil(maxDrl / 10) * 10;

<YAxis domain={[0, dynamicDrlMax]} stroke="#64748b" />;
```

**Behavior:**

- DRL range: `0 → 100`
- Min clamp: `60` (ensures minimum visible range)
- Rounds to nearest **multiple of 10**

**Example:**

- Max DRL = **45** → Y-axis: `[0, 60]` (clamped)
- Max DRL = **78** → Y-axis: `[0, 80]` (rounded to 10)
- Max DRL = **92** → Y-axis: `[0, 100]` (rounded to 10)

---

### 4️⃣ **GPA vs DRL Correlation (Scatter Plot)**

**Location:** `src/components/student_chart/rate/chart.tsx` - Line ~42

**Implementation:**

```typescript
// Calculate dynamic axis maximums for scatter plot
const gpaValues = correlationData.map(d => d.GPA || 0);
const drlValues = correlationData.map(d => d.DRL || 0);

const dynamicGpaMax = getDynamicAxisMax(gpaValues, 6, 1);
const dynamicDrlMax = getDynamicAxisMax(drlValues, 60, 10);

<XAxis domain={[0, dynamicGpaMax]} />
<YAxis domain={[0, dynamicDrlMax]} />
```

**Behavior:**

- **X-axis (GPA):** Min = `6`, step = `1`
- **Y-axis (DRL):** Min = `60`, step = `10`
- Both axes scale independently based on actual data

---

## 🛠️ Reusable Helper Function

**Location:** `src/utils/chartHelpers.ts`

```typescript
/**
 * Calculate dynamic Y-axis maximum value for responsive charts
 *
 * @param values - Array of numeric values to analyze
 * @param minClamp - Minimum value to clamp the result to
 * @param step - Step size for rounding (default: 1)
 * @returns Dynamic maximum value for Y-axis
 */
export const getDynamicAxisMax = (
  values: number[],
  minClamp: number,
  step: number = 1
): number => {
  if (!values || values.length === 0) return minClamp;

  const validValues = values.filter(
    (v) => Number.isFinite(v) && !Number.isNaN(v)
  );
  if (validValues.length === 0) return minClamp;

  const maxValue = Math.max(...validValues);

  if (maxValue < minClamp) return minClamp;

  return Math.ceil(maxValue / step) * step;
};
```

---

## 📊 Usage Examples

### Example 1: GPA Chart

```typescript
import { getDynamicAxisMax } from "@/utils/chartHelpers";

const gpaData = [3.2, 4.5, 5.5, 6.2];
const yMax = getDynamicAxisMax(gpaData, 6, 1);
// Result: 7 (rounds 6.2 up to 7)

<YAxis domain={[0, yMax]} />;
```

### Example 2: DRL Chart

```typescript
const drlData = [45, 52, 68, 73];
const yMax = getDynamicAxisMax(drlData, 60, 10);
// Result: 80 (rounds 73 to nearest 10)

<YAxis domain={[0, yMax]} />;
```

### Example 3: Multi-Series Comparison

```typescript
import { getDynamicAxisMaxMulti } from "@/utils/chartHelpers";

const studentScores = [6.5, 7.2, 8.0];
const classAverages = [7.0, 7.5, 6.8];
const yMax = getDynamicAxisMaxMulti([studentScores, classAverages], 6, 1);
// Result: 8

<YAxis domain={[0, yMax]} />;
```

---

## 🎯 Key Benefits

1. **Adaptive Visualization:** Charts automatically adjust to student-specific data ranges
2. **No Wasted Space:** Y-axis scales appropriately - no excessive whitespace for low scorers
3. **Consistency:** Minimum clamps ensure reasonable ranges even with sparse data
4. **Type Safety:** Fully typed with TypeScript - no `any` usage
5. **Reusable:** Helper function can be imported across all chart components
6. **Tailwind Styling:** All styling uses Tailwind classes, no inline CSS

---

## 🔄 Migration Guide

To apply dynamic scaling to a new chart:

1. **Import the helper:**

   ```typescript
   import { getDynamicAxisMax } from "@/utils/chartHelpers";
   ```

2. **Extract data values:**

   ```typescript
   const scores = data.map((d) => d.score || 0);
   ```

3. **Calculate dynamic max:**

   ```typescript
   const yMax = getDynamicAxisMax(scores, minClamp, step);
   ```

4. **Apply to YAxis:**
   ```typescript
   <YAxis domain={[0, yMax]} />
   ```

---

## 📝 Notes

- **GPA Charts:** Use `minClamp = 6`, `step = 1`
- **DRL Charts:** Use `minClamp = 60`, `step = 10`
- **Score Charts (0-10):** Use `minClamp = 6`, `step = 1`
- Always filter out `NaN` and `Infinity` values before calculation

---

## 🚀 Future Enhancements

- [ ] Add smart tick generation for cleaner axis labels
- [ ] Implement dynamic min values (non-zero baselines)
- [ ] Add animation when axis range changes
- [ ] Support for dual Y-axes with independent scaling

---

**Last Updated:** November 20, 2025  
**Author:** Senior Frontend Engineer  
**Tech Stack:** React, Vite, Tailwind, Recharts, TypeScript
