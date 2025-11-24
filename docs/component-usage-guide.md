# 🛠️ Component Usage Guide

## Quick Start - Using Individual Components

All components are exported from a barrel file for easy imports:

```tsx
import {
  StudentHeader,
  TabNavigation,
  GpaTrendChart,
  DetailedScoresTable,
  PassRateChart,
  ComparisonChart,
  TrainingScoreChart,
  PredictionPanel,
} from "@/components/student_dashboard";
```

## Component Reference

### 1. StudentHeader
Displays student profile information card.

```tsx
<StudentHeader
  studentName="Nguyễn Văn A"
  studentInfo={{
    id: "20210001",
    name: "Nguyễn Văn A",
    class: "K64CC",
    area: "Hà Nội"
  }}
  isLoading={false}
/>
```

**Props:**
- `studentName: string` - Display name
- `studentInfo: StudentInfo` - Student details
- `isLoading: boolean` - Loading state

---

### 2. TabNavigation
Tab switcher between overview and prediction modes.

```tsx
const [tab, setTab] = useState<"overview" | "prediction">("overview");

<TabNavigation 
  selectedTab={tab}
  onTabChange={setTab}
/>
```

**Props:**
- `selectedTab: "overview" | "prediction"` - Current tab
- `onTabChange: (tab) => void` - Tab change handler

---

### 3. GpaTrendChart
Combined GPA trend line chart + overall GPA donut.

```tsx
<GpaTrendChart
  gpaData={[
    { semester: "HK1 23-24", year: "2023-2024", gpa: 3.2, rank: "Khá" },
    { semester: "HK2 23-24", year: "2023-2024", gpa: 3.4, rank: "Khá" },
  ]}
  overallGPA={3.5}
  overallRank="Khá"
  getGradeRank={(gpa) => gpa >= 3.6 ? "Giỏi" : "Khá"}
/>
```

**Props:**
- `gpaData: SemesterGPA[]` - GPA by semester
- `overallGPA: number` - Overall GPA
- `overallRank: string | null` - Overall rank classification
- `getGradeRank: (gpa: number) => string` - Rank calculator

---

### 4. DetailedScoresTable
Course scores table with grades and status.

```tsx
<DetailedScoresTable
  courses={[
    {
      course: "Lập trình C",
      score: 8.5,
      credits: 3,
      status: "Đậu",
      midScore: 8.0,
      finalScore: 9.0
    },
  ]}
  semesterName="HK1 2024-2025"
/>
```

**Props:**
- `courses: Course[]` - Array of courses
- `semesterName: string` - Display semester name

---

### 5. PassRateChart
Stacked bar chart showing pass/fail rates.

```tsx
<PassRateChart
  semesters={[
    { id: 1, name: "HK1 23-24", year: "2023-2024" },
    { id: 2, name: "HK2 23-24", year: "2023-2024" },
  ]}
  coursesPerSemester={{
    1: [
      { course: "Math", score: 8, credits: 3, status: "Đậu" },
      { course: "English", score: 6, credits: 3, status: "Đậu" },
    ],
  }}
  overallPassRate="95.5"
/>
```

**Props:**
- `semesters: Array` - Semester list
- `coursesPerSemester: Record<number, Course[]>` - Courses by semester
- `overallPassRate: string` - Overall pass percentage

---

### 6. ComparisonChart
Class average comparison - student vs class.

```tsx
<ComparisonChart
  comparisonData={[
    {
      course: "Lập trình C",
      average: 7.2,
      student: 8.5,
      grade: "Giỏi"
    },
    {
      course: "Toán cao cấp",
      average: 6.8,
      student: 7.5,
      grade: "Khá"
    },
  ]}
/>
```

**Props:**
- `comparisonData: ComparisonItem[]` - Comparison records with `course`, `average`, `student`, `grade`

---

### 7. TrainingScoreChart
Training/conduct scores (DRL) by semester.

```tsx
<TrainingScoreChart
  trainingScoreData={[
    { semester: "HK1 23-24", score: 85 },
    { semester: "HK2 23-24", score: 90 },
  ]}
/>
```

**Props:**
- `trainingScoreData: TrainingScore[]` - Training scores by semester

Shows placeholder if no data available.

---

### 8. PredictionPanel
Predicts next semester GPA and subject grades.

```tsx
const [highlighted, setHighlighted] = useState<string | null>(null);

<PredictionPanel
  currentStudent={studentData}
  highlightedSubject={highlighted}
  onHighlightSubject={setHighlighted}
/>
```

**Props:**
- `currentStudent: Student` - Student data
- `highlightedSubject: string | null` - Currently highlighted subject
- `onHighlightSubject: (subject) => void` - Highlight handler

---

## Utility Functions

### Data Calculators

```tsx
import {
  getDynamicAxisMax,
  getGradeRank,
  classifyScore,
  getNumericField,
  getStringField,
  normalizeKeyForMatching,
} from "@/utils/dataCalculators";

// Calculate axis max for chart
const maxY = getDynamicAxisMax([8.5, 7.2, 9.1], 6);

// Get grade classification
const grade = getGradeRank(3.5); // "Khá"
const scoreGrade = classifyScore(8.5); // "Giỏi"

// Extract data from objects with fuzzy matching
const score = getNumericField(apiRecord, ["Diem", "Score", "DiemTB"]);
const courseName = getStringField(apiRecord, ["TenMon", "CourseName"]);

// Normalize strings for matching
const normalized = normalizeKeyForMatching("Điểm Trung Bình");
```

### Student Normalizers

```tsx
import {
  normalizeStudent,
  getUserNameFromLocal,
  createEmptyStudent,
  makeSemesterKey,
} from "@/utils/studentNormalizers";

// Normalize raw API data
const student = normalizeStudent(apiData);

// Get user name from localStorage
const userName = getUserNameFromLocal() ?? "Student";

// Create empty fallback
const empty = createEmptyStudent();

// Format semester display
const sem = makeSemesterKey("HK1", "2023-2024"); // "HK1 23-24"
```

---

## Type Definitions

```tsx
import {
  Student,
  Course,
  SemesterGPA,
  PassRate,
  TrainingScore,
  StudentInfo,
} from "@/utils/studentNormalizers";

// Student structure
interface Student {
  id: number;
  info: StudentInfo;
  overallGPA: number;
  gpaData: SemesterGPA[];
  passRateData: PassRate[];
  detailedScores: Record<number, Course[]>;
  trainingScoreData: TrainingScore[];
}

// Course structure
interface Course {
  course: string;
  score: number;
  credits: number;
  status: string;
  midScore?: number;
  finalScore?: number;
}

// Semester GPA structure
interface SemesterGPA {
  semester: string;
  year: string;
  gpa: number;
  rank: string;
}
```

---

## Complete Example - Custom Dashboard

```tsx
import React, { useState } from "react";
import { Student, Course } from "@/utils/studentNormalizers";
import {
  StudentHeader,
  GpaTrendChart,
  PassRateChart,
  DetailedScoresTable,
} from "@/components/student_dashboard";

export const CustomDashboard: React.FC<{ student: Student }> = ({ 
  student 
}) => {
  const [semester, setSemester] = useState(1);

  const courses = student.detailedScores[semester] ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <StudentHeader
        studentName={student.info.name}
        studentInfo={student.info}
        isLoading={false}
      />

      {/* GPA Trends */}
      <GpaTrendChart
        gpaData={student.gpaData}
        overallGPA={student.overallGPA}
        overallRank={null}
        getGradeRank={(gpa) => gpa >= 3.6 ? "Giỏi" : "Khá"}
      />

      {/* Scores Table */}
      <DetailedScoresTable
        courses={courses}
        semesterName={`HK${semester}`}
      />

      {/* Pass Rates */}
      <PassRateChart
        semesters={student.gpaData.map((d, i) => ({
          id: i + 1,
          name: d.semester,
          year: d.year,
        }))}
        coursesPerSemester={student.detailedScores}
        overallPassRate="95.0"
      />
    </div>
  );
};
```

---

## Integration with Main Dashboard

The refactored `studentDashboard.tsx` shows best practices for composing all components:

```tsx
// See src/pages/Students/studentDashboard.tsx for complete example

return (
  <div className="space-y-6">
    <TabNavigation selectedTab={selectedTab} onTabChange={setSelectedTab} />

    {selectedTab === "overview" && (
      <>
        <StudentHeader {...} />
        <GpaTrendChart {...} />
        <DetailedScoresTable {...} />
        <PassRateChart {...} />
        <ComparisonChart {...} />
        <TrainingScoreChart {...} />
      </>
    )}

    {selectedTab === "prediction" && (
      <PredictionPanel {...} />
    )}
  </div>
);
```

---

## Tips & Best Practices

### ✅ DO

- Use the barrel export (`import from "@/components/student_dashboard"`)
- Memoize components if data rarely changes: `React.memo(YourComponent)`
- Spread props for cleaner JSX: `<Component {...props} />`
- Extract calculations before rendering
- Keep components focused on one job

### ❌ DON'T

- Don't import directly from individual files
- Don't inline large calculations in JSX
- Don't pass unnecessary props
- Don't mutate passed data objects
- Don't mix data fetching with presentation

---

## Common Patterns

### Filtering Comparison Results

```tsx
const [gradeFilter, setGradeFilter] = useState("all");

const filtered = gradeFilter === "all"
  ? comparisonData
  : comparisonData.filter(item => item.grade === gradeFilter);

<ComparisonChart comparisonData={filtered} />
```

### Dynamic Chart Scaling

```tsx
import { getDynamicAxisMax } from "@/utils/dataCalculators";

const allScores = data.flatMap(d => [d.student, d.average]);
const maxY = getDynamicAxisMax(allScores, 6); // Min 6, rounded up
```

### Data Normalization

```tsx
import { normalizeStudent, getUserNameFromLocal } from "@/utils/studentNormalizers";

const normalized = normalizeStudent(apiResponse);
const displayName = getUserNameFromLocal() ?? normalized.info.name;
```

---

## Need More Help?

- See `docs/refactoring-complete.md` for architecture overview
- See `docs/refactoring-statistics.md` for detailed metrics
- Check `src/pages/Students/studentDashboard.tsx` for complete working example
