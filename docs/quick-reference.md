# Quick Reference: Dynamic Y-Axis Implementation

## 🎯 All Charts Updated

| Chart                  | Location                     | Y-Axis Logic                      | Status |
| ---------------------- | ---------------------------- | --------------------------------- | ------ |
| **GPA Trend**          | `studentDashboard.tsx` L1295 | `max < 6 ? 6 : ceil(max)`         | ✅     |
| **Class Comparison**   | `studentDashboard.tsx` L1978 | `getDynamicAxisMax(scores, 6, 1)` | ✅     |
| **DRL Trend**          | `studentDashboard.tsx` L2142 | `max < 60 ? 60 : ceil(max/10)*10` | ✅     |
| **GPA vs DRL Scatter** | `rate/chart.tsx` L65         | X: `(6, 1)` Y: `(60, 10)`         | ✅     |

---

## 📦 Helper Function

**File:** `src/utils/chartHelpers.ts`

```typescript
getDynamicAxisMax(values: number[], minClamp: number, step: number = 1): number
```

**Parameters:**

- `values`: Data array (e.g., `[6.5, 7.2, 8.0]`)
- `minClamp`: Minimum Y-axis value (e.g., `6` for GPA, `60` for DRL)
- `step`: Rounding interval (e.g., `1` for GPA, `10` for DRL)

---

## 💡 Common Patterns

### GPA Charts (0-10 scale)

```typescript
const yMax = getDynamicAxisMax(gpaData, 6, 1);
<YAxis domain={[0, yMax]} />;
```

### DRL Charts (0-100 scale)

```typescript
const yMax = getDynamicAxisMax(drlData, 60, 10);
<YAxis domain={[0, yMax]} />;
```

### Multi-Series Charts

```typescript
const allScores = [...studentScores, ...classAverages];
const yMax = getDynamicAxisMax(allScores, 6, 1);
<YAxis domain={[0, yMax]} />;
```

---

## ✨ Key Features

- ✅ **Type-safe:** Full TypeScript, no `any`
- ✅ **Responsive:** Scales per student data
- ✅ **Minimal UI:** Tailwind classes only
- ✅ **Reusable:** Centralized helper function
- ✅ **Smart clamping:** Prevents too-small ranges

---

## 🔧 Testing Scenarios

| Scenario      | Input       | Output       | Pass |
| ------------- | ----------- | ------------ | ---- |
| Low GPA       | `max = 5.5` | `Y-max = 6`  | ✅   |
| High GPA      | `max = 8.3` | `Y-max = 9`  | ✅   |
| Exact integer | `max = 7.0` | `Y-max = 7`  | ✅   |
| Low DRL       | `max = 45`  | `Y-max = 60` | ✅   |
| High DRL      | `max = 78`  | `Y-max = 80` | ✅   |

---

## 📚 Documentation

Full docs: `/docs/chart-improvements.md`

**Last Updated:** Nov 20, 2025
