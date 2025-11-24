import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Student } from "../../utils/studentNormalizers";

interface PredictionPanelProps {
  currentStudent: Student;
  highlightedSubject: string | null;
  onHighlightSubject: (s: string | null) => void;
}

export const PredictionPanel: React.FC<PredictionPanelProps> = ({
  currentStudent,
  highlightedSubject,
  onHighlightSubject,
}) => {
  // Predict only the next semester's GPA (simple heuristic) and subject grades
  const lastActualGpa =
    currentStudent.gpaData && currentStudent.gpaData.length
      ? currentStudent.gpaData[currentStudent.gpaData.length - 1].gpa
      : 0;

  // Simple heuristic: small improvement over last GPA, capped at 4.0
  const predictedGpaNext = Math.min(
    4,
    Number((lastActualGpa + 0.05).toFixed(2))
  );

  // Mock predicted subject grades for the next semester (scale 0-10)
  const predictedSubjects = [
    { subject: "Toán cao cấp", predicted: 8.6 },
    { subject: "Lập trình C", predicted: 9.1 },
    { subject: "Anh văn 1", predicted: 6.3 },
    { subject: "CSDL", predicted: 8.8 },
  ];

  const improvementRate = lastActualGpa
    ? (((predictedGpaNext - lastActualGpa) / lastActualGpa) * 100).toFixed(1)
    : "0.0";

  // Prepare pie data for predicted GPA (achieved vs remaining)
  const predictedGpaPie = [
    { name: "Predicted", value: Number(predictedGpaNext.toFixed(2)) },
    { name: "Remaining", value: Number((4 - predictedGpaNext).toFixed(2)) },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
        {/* Left: predicted subject scores as horizontal bars (span 2 on large) */}
        <div className="lg:col-span-2 bg-white rounded-lg p-4 border">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Dự đoán điểm môn học (kỳ tới)
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                layout="vertical"
                data={predictedSubjects}
                margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
                barCategoryGap="30%"
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis type="number" domain={[0, 10]} stroke="#64748b" />
                <YAxis
                  type="category"
                  dataKey="subject"
                  width={160}
                  stroke="#64748b"
                />
                <Tooltip formatter={(v: number) => `${v.toFixed(1)} điểm`} />
                <Bar
                  dataKey="predicted"
                  name="Dự đoán"
                  fill="#2563eb"
                  barSize={12}
                >
                  {predictedSubjects.map((entry, index) => (
                    <Cell
                      key={`cell-pred-${index}`}
                      fill={
                        highlightedSubject &&
                        highlightedSubject !== entry.subject
                          ? "#c7c7c7"
                          : "#2563eb"
                      }
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        onHighlightSubject(
                          highlightedSubject === entry.subject
                            ? null
                            : entry.subject
                        )
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: predicted GPA pie chart */}
        <div className="bg-white rounded-lg p-4 border flex flex-col items-center justify-center">
          <div className="text-sm font-semibold text-slate-700 mb-2">
            Dự đoán GPA (kỳ tới)
          </div>
          <div className="w-full h-56 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={predictedGpaPie}
                  cx="50%"
                  cy="50%"
                  innerRadius={48}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  <Cell key="cell-0" fill="#7c3aed" />
                  <Cell key="cell-1" fill="#e2e8f0" />
                </Pie>
                <Tooltip
                  formatter={(value: number, name: string) => [
                    `${Number(value).toFixed(2)} / 4.0`,
                    name,
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 text-center">
            <div className="text-3xl font-bold text-indigo-700">
              {predictedGpaNext.toFixed(2)}
            </div>
            <div className="text-sm text-slate-600">
              Trên thang 4.0 · Cải thiện {improvementRate}%
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PredictionPanel;
