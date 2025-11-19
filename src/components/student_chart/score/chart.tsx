import { Award } from "lucide-react";
import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { loadHighestLowestData } from "../../../utils/score/handler_highes_lowest";

export function StudentScoreChartHighestLowest() {
  const [allData, setAllData] = useState<any[]>([]);
  const [semester, setSemester] = useState("");

  useEffect(() => {
    loadHighestLowestData().then(setAllData);
  }, []);

  const displayData =
    semester === "" ? allData : allData.filter((x) => x.semester === semester);

  return (
    <div className="w-full">
      {/* Semester filter */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200 w-full">
        <div className="flex items-center gap-2 mb-6">
          <Award className="w-6 h-6 text-indigo-600" />
          <h2 className="text-xl font-bold text-gray-800">
            Hiệu suất theo học kỳ (Cao nhất vs Thấp nhất)
          </h2>
        </div>
        <div className="mb-4">
          <select
            value={semester}
            onChange={(e) => setSemester(e.target.value)}
            className="border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Tất cả học kỳ</option>
            {allData.map((item) => (
              <option key={item.semester} value={item.semester}>
                {item.semester}
              </option>
            ))}
          </select>
        </div>
        <div className="w-full h-96">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={displayData}
              margin={{ top: 10, right: 24, left: 0, bottom: 20 }}
              barCategoryGap="40%"
              barGap={12}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="semester" stroke="#64748b" />
              <YAxis domain={[0, 10]} stroke="#64748b" />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-white p-3 rounded shadow-md border border-gray-200">
                      <div className="font-semibold mb-2">{label}</div>
                      {payload.map((p) => (
                        <div
                          key={p.dataKey}
                          className="text-sm text-gray-700 mb-1"
                        >
                          <span className="font-semibold">{p.name}:</span>{" "}
                          {p.value} điểm —{" "}
                          <span className="font-medium">
                            {
                              p.payload[
                                p.dataKey === "highestScore"
                                  ? "highestSubject"
                                  : "lowestSubject"
                              ]
                            }
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              <Legend
                verticalAlign="top"
                align="right"
                wrapperStyle={{ paddingBottom: "10px" }}
              />

              <Bar
                dataKey="highestScore"
                name="Cao nhất"
                barSize={18}
                fill="#10b981"
              >
                {displayData.map((_, idx) => (
                  <Cell key={`h-${idx}`} fill="#10b981" />
                ))}
              </Bar>

              <Bar
                dataKey="lowestScore"
                name="Thấp nhất"
                barSize={18}
                fill="#ef4444"
              >
                {displayData.map((_, idx) => (
                  <Cell key={`l-${idx}`} fill="#ef4444" />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
