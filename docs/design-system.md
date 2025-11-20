# Design System - Modern Chart Dashboard

## 🎨 Visual Design Principles

### Color Palette

**Primary Colors:**

- Blue: `#3B82F6` (blue-500) - Main GPA charts
- Green: `#22C55E` (green-500) - Success/Pass indicators
- Red: `#EF4444` (red-500) - Danger/Fail indicators
- Indigo: `#6366F1` (indigo-500) - DRL/Training scores
- Purple: `#8B5CF6` (purple-500) - Correlation/scatter plots

**Neutral Colors:**

- Background: `#F8FAFC` (slate-50)
- Card: `#FFFFFF` (white)
- Text Primary: `#1E293B` (slate-800)
- Text Secondary: `#64748B` (slate-500)
- Borders: `#E2E8F0` (slate-200)
- Gridlines: `#E2E8F0` @ 60% opacity

---

## 📦 Component Structure

### Card Design

```tsx
className = "bg-white rounded-2xl p-8 shadow-lg shadow-slate-200/50";
```

**Features:**

- `rounded-2xl` - Large corner radius for modern feel
- `p-8` - Generous padding for breathing room
- `shadow-lg shadow-slate-200/50` - Soft, elevated shadow

---

### Header Pattern

```tsx
<div className="flex items-center gap-3 mb-6">
  <div className="p-2 bg-blue-50 rounded-xl">
    <Icon className="w-6 h-6 text-blue-600" />
  </div>
  <h2 className="text-xl font-bold text-slate-800">Chart Title</h2>
</div>
```

**Icon Container Colors:**

- GPA: `bg-blue-50` / `text-blue-600`
- Pass/Fail: `bg-green-50` / `text-green-600`
- DRL: `bg-indigo-50` / `text-indigo-600`
- Correlation: `bg-purple-50` / `text-purple-600`
- Performance: `bg-indigo-50` / `text-indigo-600`

---

## 📊 Chart Styling Standards

### ResponsiveContainer

```tsx
<ResponsiveContainer width="100%" height={320}>
```

- Standard height: `320px`
- Some larger charts: `380px`
- Always `width="100%"` for responsiveness

### Margins

```tsx
margin={{ top: 10, right: 10, left: -20, bottom: 10 }}
```

- Negative left margin: `-20` to align with card edge
- Consistent `10px` top/right/bottom

### CartesianGrid

```tsx
<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" opacity={0.6} />
```

- Dashed pattern: `3 3`
- Subtle opacity: `0.6`
- Color matches borders: `#e2e8f0`

### Axis Styling

```tsx
<XAxis stroke="#64748b" tick={{ fontSize: 12 }} tickLine={false} />
```

- No tick lines for cleaner look
- Smaller font size: `12px`
- Subtle stroke color

---

## 🎯 Tooltip Design

```tsx
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
```

**Key Features:**

- No border (clean look)
- Rounded corners: `12px`
- Soft box-shadow
- Semi-bold labels
- Comfortable padding

---

## 📈 Chart-Specific Patterns

### Line Charts (GPA, DRL)

```tsx
<Line
  type="monotone"
  dataKey="gpa"
  stroke="#3B82F6"
  strokeWidth={3}
  dot={{ fill: "#3B82F6", r: 5, strokeWidth: 2, stroke: "#fff" }}
  activeDot={{ r: 7, fill: "#2563EB" }}
/>
```

**Features:**

- Stroke width: `3px` for visibility
- White stroke on dots for definition
- Active state with darker shade

### Bar Charts

```tsx
<Bar
  dataKey="value"
  fill="#22C55E"
  barSize={16}
  radius={[4, 4, 0, 0]}
>
```

**Features:**

- Rounded top corners: `[4, 4, 0, 0]`
- Consistent bar size: `16-20px`
- Explicit fill colors (no style prop)

### Scatter Plots

```tsx
<Scatter data={data} fill="#8B5CF6">
  {data.map((_, idx) => (
    <Cell key={`cell-${idx}`} fill="#8B5CF6" opacity={0.8} />
  ))}
</Scatter>
```

**Features:**

- 80% opacity for depth
- Individual cell styling
- Consistent purple theme

---

## 🔧 Legend Standards

```tsx
<Legend wrapperStyle={{ paddingTop: "16px" }} iconType="circle" />
```

- Circle icons (not square)
- `16px` top padding
- Auto positioning

---

## 💡 Insight Boxes

```tsx
<div className="bg-gradient-to-br from-green-50 to-emerald-50 px-6 py-4 rounded-xl border border-green-100">
  <div className="text-sm font-medium text-green-700 mb-1">Label</div>
  <div className="text-3xl font-bold text-green-600">100%</div>
</div>
```

**Pass Rate Badge:**

- Gradient background
- Large bold number
- Border matching color scheme

**Insight Card:**

```tsx
<div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-100">
  <p className="text-sm text-slate-700">
    <span className="font-semibold text-slate-800">Nhận xét:</span>{" "}
    <span className="text-purple-700 font-semibold">Insight</span>
  </p>
</div>
```

---

## 📱 Responsive Behavior

### Grid Layout

```tsx
<div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
  <div className="lg:col-span-2"><!-- Main chart --></div>
  <div><!-- Sidebar chart --></div>
</div>
```

### Flex Layout

```tsx
<div className="flex gap-6">
  <div className="w-full"><!-- Chart 1 --></div>
  <div className="w-full"><!-- Chart 2 --></div>
</div>
```

**Gap Standards:**

- Between cards: `gap-6` (24px)
- Within headers: `gap-3` (12px)

---

## 🎨 Typography

**Headers:**

- H2 Chart Titles: `text-xl font-bold text-slate-800`
- Labels: `text-sm font-medium text-[color]-700`
- Insights: `text-sm text-slate-700`

**Font Weights:**

- Regular: `400` (default)
- Medium: `500` (font-medium)
- Semibold: `600` (font-semibold)
- Bold: `700` (font-bold)

---

## ✨ Interactive States

### Hover States

- Line dots: Larger radius on `activeDot`
- Bars: Implicit via Recharts
- Scatter: Cursor changes via tooltip

### Click States

- Currently disabled for cleaner UX
- Can add via onClick handlers if needed

---

## 🔢 Dynamic Axis Rules

### GPA Charts (0-10 scale)

```typescript
const maxGpa = Math.max(...data.map((d) => d.gpa));
const yMax = maxGpa < 6 ? 6 : Math.ceil(maxGpa);
```

### DRL Charts (0-100 scale)

```typescript
const maxDrl = Math.max(...data.map((d) => d.drl));
const yMax = maxDrl < 60 ? 60 : Math.ceil(maxDrl / 10) * 10;
```

### Comparison Charts

```typescript
const allScores = [...student, ...average];
const yMax = getDynamicAxisMax(allScores, 6, 1);
```

---

## 📋 Checklist for New Charts

- [ ] Use `rounded-2xl` cards
- [ ] Add icon in colored background circle
- [ ] Apply `shadow-lg shadow-slate-200/50`
- [ ] Set consistent margins
- [ ] Use gridlines with `opacity={0.6}`
- [ ] Remove tick lines
- [ ] Apply modern tooltip styling
- [ ] Set circle legend icons
- [ ] Use design system colors
- [ ] Implement dynamic Y-axis
- [ ] Add responsive container
- [ ] Test on mobile viewport

---

**Last Updated:** November 20, 2025  
**Version:** 2.0  
**Maintained by:** Senior Frontend Team
