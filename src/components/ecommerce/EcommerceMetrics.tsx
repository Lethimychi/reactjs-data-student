import { useState } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  BoxIconLine,
  GroupIcon,
} from "../../icons";
import Badge from "../ui/badge/Badge";
import {
  ResponsiveContainer,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  ScatterChart,
  Scatter,
} from "recharts";

export default function EcommerceMetrics() {
  const classList = [
    {
      id: 1,
      name: "CNTT K59",
      instructor: "Nguyễn A",
      students: 28,
      avgGPA: 3.42,
    },
    {
      id: 2,
      name: "CNTT K60",
      instructor: "Trần B",
      students: 32,
      avgGPA: 3.21,
    },
    { id: 3, name: "Mạng K59", instructor: "Lê C", students: 25, avgGPA: 3.1 },
    {
      id: 4,
      name: "An toàn K59",
      instructor: "Phạm D",
      students: 22,
      avgGPA: 3.05,
    },
  ];

  const highestLowestData = [
    { semester: "HK1 22-23", highestScore: 9.2, lowestScore: 4.8 },
    { semester: "HK2 22-23", highestScore: 9.0, lowestScore: 4.5 },
    { semester: "HK1 23-24", highestScore: 9.5, lowestScore: 5.0 },
    { semester: "HK2 23-24", highestScore: 9.6, lowestScore: 5.2 },
  ];

  const passRateData = [
    { semester: "HK1 22-23", passed: 22, failed: 6, total: 28 },
    { semester: "HK2 22-23", passed: 24, failed: 8, total: 32 },
    { semester: "HK1 23-24", passed: 27, failed: 1, total: 28 },
    { semester: "HK2 23-24", passed: 30, failed: 2, total: 32 },
  ];

  const comparisonWithClass = [
    { course: "Toán cao cấp", student: 6.8, average: 8.5 },
    { course: "Lập trình C", student: 7.2, average: 8.8 },
    { course: "Anh văn 1", student: 6.1, average: 6.4 },
    { course: "CSDL", student: 8.2, average: 7.1 },
  ];

  const gradeDistribution = [
    { name: "Giỏi", value: 12 },
    { name: "Khá", value: 36 },
    { name: "Trung bình", value: 18 },
    { name: "Yếu", value: 6 },
  ];

  const topFailing = [
    { subject: "Anh văn 1", failRate: 0.12 },
    { subject: "Toán cao cấp", failRate: 0.08 },
    { subject: "CSDL", failRate: 0.06 },
  ];

  const correlationData = [
    { semester: "HK1 22-23", gpa: 3.1, conduct: 75 },
    { semester: "HK2 22-23", gpa: 3.25, conduct: 78 },
    { semester: "HK1 23-24", gpa: 3.4, conduct: 82 },
    { semester: "HK2 23-24", gpa: 3.45, conduct: 85 },
  ];

  const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#ef4444"];

  const shorten = (s: string, max = 12) =>
    s && s.length > max ? s.slice(0, max) + "…" : s;
  const [selectedClassId, setSelectedClassId] = useState<number>(
    classList[0]?.id ?? 0
  );

  return (
    <div className="space-y-6">
      {/* Filters row: placed first and horizontal */}
      <div className="flex flex-wrap items-center gap-4 grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        <div className="flex items-center space-x-2">
          <label htmlFor="filter-class" className="text-sm text-gray-600">
            Lớp
          </label>
          <select
            id="filter-class"
            className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm"
            onChange={(e) => setSelectedClassId(Number(e.target.value))}
            value={selectedClassId}
          >
            {classList.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* placeholder for additional horizontal filters if needed */}
        <div className="flex items-center space-x-2">
          <label className="text-sm text-gray-600">Semester</label>
          <select className="rounded-md border border-gray-200 bg-white px-3 py-2 text-sm">
            <option>HK1 22-23</option>
            <option>HK2 22-23</option>
            <option>HK1 23-24</option>
            <option>HK2 23-24</option>
          </select>
        </div>
      </div>
      {/* Top ecommerce metrics (kept intact) */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6">
        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <GroupIcon className="text-gray-800 size-6 dark:text-white/90" />
          </div>

          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Customers
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                3,782
              </h4>
            </div>
            <Badge color="success">
              <ArrowUpIcon />
              11.01%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}

        {/* <!-- Metric Item Start --> */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orders
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                5,359
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon />
              9.05%
            </Badge>
          </div>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-white/[0.03] md:p-6">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-xl dark:bg-gray-800">
            <BoxIconLine className="text-gray-800 size-6 dark:text-white/90" />
          </div>
          <div className="flex items-end justify-between mt-5">
            <div>
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Orders
              </span>
              <h4 className="mt-2 font-bold text-gray-800 text-title-sm dark:text-white/90">
                5,359
              </h4>
            </div>

            <Badge color="error">
              <ArrowDownIcon />
              9.05%
            </Badge>
          </div>
        </div>
        {/* <!-- Metric Item End --> */}
      </div>

      {/* Academic Advisor Dashboard */}
      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold">Academic Advisor Dashboard</h3>
        </div>

        {/* KPI tiles */}

        {/* Charts grid: Highest vs Lowest, Pass/Fail stacked, Comparison Combo */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">
              Highest vs Lowest Subject Score
            </h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={highestLowestData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="semester"
                    tickFormatter={(t) => shorten(String(t), 8)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="highestScore" fill="#10b981" />
                  <Bar dataKey="lowestScore" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">Pass / Fail Rate (Stacked)</h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <BarChart data={passRateData} margin={{ left: -20 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="semester"
                    tickFormatter={(t) => shorten(String(t), 8)}
                  />
                  <YAxis />
                  <Tooltip formatter={(value: number) => `${value}`} />
                  <Legend />
                  <Bar dataKey="passed" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="failed" stackId="a" fill="#ef4444" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">
              Class vs Student Average (Combo)
            </h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <ComposedChart
                  data={comparisonWithClass}
                  margin={{ left: -20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="course"
                    tickFormatter={(t) => shorten(String(t), 10)}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="student" barSize={16} fill="#3b82f6" />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#10b981"
                    strokeWidth={2}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Donut / Pie and Scatter and Horizontal Bar */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">Grade Distribution (Donut)</h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={gradeDistribution}
                    dataKey="value"
                    nameKey="name"
                    innerRadius={50}
                    outerRadius={80}
                    fill="#8884d8"
                  >
                    {gradeDistribution.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">GPA vs Conduct (Scatter)</h4>
            <div style={{ width: "100%", height: 220 }}>
              <ResponsiveContainer>
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="gpa"
                    name="GPA"
                    domain={[2.5, 4]}
                  />
                  <YAxis type="number" dataKey="conduct" name="Conduct" />
                  <Tooltip cursor={{ strokeDasharray: "3 3" }} />
                  <Scatter
                    name="Students"
                    data={correlationData}
                    fill="#3b82f6"
                  />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-4 md:p-6">
            <h4 className="font-semibold mb-3">
              Top Failing Subjects (Horizontal)
            </h4>
            <div className="text-sm text-gray-500 mb-3">
              Fail rate by subject
            </div>
            <div className="space-y-2">
              {topFailing.map((t) => (
                <div key={t.subject} className="w-full">
                  <div className="flex justify-between mb-1 text-sm">
                    <div>{shorten(t.subject, 18)}</div>
                    <div>{Math.round(t.failRate * 100)}%</div>
                  </div>
                  <div className="h-2 bg-gray-100 rounded-full">
                    <div
                      className="h-2 bg-rose-500 rounded-full"
                      style={{ width: `${Math.round(t.failRate * 100)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
