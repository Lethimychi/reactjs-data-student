# Quick Start: Using the New Chart Design System

## 🚀 Getting Started

### Step 1: Import Helper Function

```typescript
import { getDynamicAxisMax } from "@/utils/chartHelpers";
```

### Step 2: Basic Chart Template

```tsx
import { TrendingUp } from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function MyChart({ data }: { data: { x: string; y: number }[] }) {
  // Calculate dynamic Y-axis
  const maxValue = Math.max(...data.map((d) => d.y));
  const yMax = maxValue < 6 ? 6 : Math.ceil(maxValue);

  return (
    <div className="bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-blue-50 rounded-xl">
          <TrendingUp className="w-6 h-6 text-blue-600" />
        </div>
        <h2 className="text-xl font-bold text-slate-800">Chart Title</h2>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={320}>
        <LineChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
          <XAxis
            dataKey="x"
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />
          <YAxis
            domain={[0, yMax]}
            stroke="#64748b"
            tick={{ fontSize: 12 }}
            tickLine={false}
          />

          <Tooltip
            contentStyle={{
              backgroundColor: "#fff",
              border: "none",
              borderRadius: "12px",
              boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
              padding: "12px 16px",
            }}
            labelStyle={{ fontWeight: "600", fontSize: "13px" }}
          />

          <Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />

          <Line
            type="monotone"
            dataKey="y"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: "#3B82F6", r: 5, strokeWidth: 2, stroke: "#fff" }}
            activeDot={{ r: 7, fill: "#2563EB" }}
            name="Value"
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 🎨 Color Palette Reference

```tsx
// Primary
const BLUE = "#3B82F6"; // GPA, main metrics
const GREEN = "#22C55E"; // Success, pass
const RED = "#EF4444"; // Danger, fail
const INDIGO = "#6366F1"; // DRL, training
const PURPLE = "#8B5CF6"; // Correlation

// Background colors for icon containers
const BG_BLUE = "bg-blue-50";
const BG_GREEN = "bg-green-50";
const BG_INDIGO = "bg-indigo-50";
const BG_PURPLE = "bg-purple-50";
```

---

## 📏 Spacing Standards

```tsx
// Card
className="p-8"                    // Padding
className="gap-6"                  // Between cards

// Header
className="mb-6"                   // Bottom margin
className="gap-3"                  // Icon to text gap

// Chart
height={320}                       // Standard charts
height={380}                       // Larger charts
margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
```

---

## 🔧 Common Patterns

### Bar Chart

```tsx
<Bar dataKey="value" fill="#22C55E" barSize={16} radius={[4, 4, 0, 0]}>
  {data.map((_, idx) => (
    <Cell key={idx} fill="#22C55E" />
  ))}
</Bar>
```

### Line Chart

```tsx
<Line
  type="monotone"
  dataKey="value"
  stroke="#3B82F6"
  strokeWidth={3}
  dot={{ fill: "#3B82F6", r: 5, strokeWidth: 2, stroke: "#fff" }}
  activeDot={{ r: 7, fill: "#2563EB" }}
/>
```

### Scatter Chart

```tsx
<Scatter data={data} fill="#8B5CF6">
  {data.map((_, idx) => (
    <Cell key={`cell-${idx}`} fill="#8B5CF6" opacity={0.8} />
  ))}
</Scatter>
```

---

## 💡 Dynamic Y-Axis Examples

### GPA (0-10 scale, min 6)

```typescript
const scores = data.map((d) => d.gpa);
const yMax = getDynamicAxisMax(scores, 6, 1);
```

### DRL (0-100 scale, min 60, step 10)

```typescript
const scores = data.map((d) => d.drl);
const yMax = getDynamicAxisMax(scores, 60, 10);
```

### Comparison (multiple series)

```typescript
const allScores = [...studentScores, ...classAverages];
const yMax = getDynamicAxisMax(allScores, 6, 1);
```

---

## 🎯 Insight Box

```tsx
<div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-4 rounded-xl border border-green-100">
  <div className="text-sm font-medium text-green-700 mb-1">Label</div>
  <div className="text-3xl font-bold text-green-600">100%</div>
</div>
```

---

## 📋 Checklist for New Charts

```markdown
- [ ] Use rounded-2xl card
- [ ] Add p-8 padding
- [ ] Add shadow-lg shadow-slate-200/50
- [ ] Icon in colored bg circle (p-2 rounded-xl)
- [ ] Header with gap-3 mb-6
- [ ] ResponsiveContainer height={320}
- [ ] Chart margins with left: -20
- [ ] GridLines opacity={0.6}
- [ ] tickLine={false} on axes
- [ ] tick={{ fontSize: 12 }}
- [ ] Modern tooltip (no border, shadow)
- [ ] Legend with iconType="circle"
- [ ] Dynamic Y-axis with getDynamicAxisMax
- [ ] Use design system colors
- [ ] Line dots with white stroke
- [ ] Bar tops rounded [4, 4, 0, 0]
```

---

## 🛠️ Common Modifications

### Change Icon Color

```tsx
// From blue to green
<div className="p-2 bg-green-50 rounded-xl">
  <Icon className="w-6 h-6 text-green-600" />
</div>
```

### Adjust Chart Height

```tsx
// Larger chart
<ResponsiveContainer width="100%" height={380}>
```

### Change Line Color

```tsx
// From blue to indigo
stroke="#6366F1"
dot={{ fill: "#6366F1", ... }}
activeDot={{ fill: "#4F46E5" }}
```

---

## 🔍 Troubleshooting

### Chart Not Aligning with Card Edge

```tsx
// Ensure negative left margin
margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
```

### Gridlines Too Bold

```tsx
// Add opacity
<CartesianGrid ... opacity={0.6} />
```

### Tooltip Has Border

```tsx
// Remove border
contentStyle={{
  ...
  border: "none",  // ← Must be "none" not "0"
  ...
}}
```

### Y-Axis Not Dynamic

```tsx
// Calculate before JSX
const yMax = getDynamicAxisMax(scores, minValue, step);

// Apply to YAxis
<YAxis domain={[0, yMax]} ... />
```

---

## 📚 Full Documentation

- **Design System:** `/docs/design-system.md`
- **Implementation:** `/docs/refactoring-summary.md`
- **Before/After:** `/docs/before-after-comparison.md`
- **Helper Functions:** `/src/utils/chartHelpers.ts`

---

## ⚡ Pro Tips

1. **Always use Tailwind classes** - No inline CSS
2. **Negative margins** - Use `left: -20` for alignment
3. **Opacity for gridlines** - Makes charts less busy
4. **White stroke on dots** - Adds depth to line charts
5. **Circle icons** - Better than squares for legends
6. **Dynamic axes** - Prevents wasted space
7. **Consistent colors** - One color theme per chart type

---

**Need Help?** Check the design system documentation or reference existing charts.

**Last Updated:** November 20, 2025
