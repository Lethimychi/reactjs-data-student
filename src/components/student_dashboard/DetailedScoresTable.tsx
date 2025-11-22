import React from "react";
import { Course } from "../../utils/studentNormalizers";

interface DetailedScoresTableProps {
  courses: Course[];
  semesterName: string;
}

export const DetailedScoresTable: React.FC<DetailedScoresTableProps> = ({
  courses,
  semesterName,
}) => {
  return (
    <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-[0_2px_6px_rgba(0,0,0,0.08)]">
      <h2 className="text-xl font-bold text-slate-800 mb-4">
        Bảng điểm chi tiết - {semesterName}
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-4 text-left rounded-tl-xl">Môn học</th>
              <th className="px-6 py-4 text-center">Tín chỉ</th>
              <th className="px-6 py-4 text-center">GK</th>
              <th className="px-6 py-4 text-center">CK</th>
              <th className="px-6 py-4 text-center">TB</th>
              <th className="px-6 py-4 text-center rounded-tr-xl">
                Trạng thái
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {courses.map((score, idx) => (
              <tr key={idx} className="hover:bg-blue-50 transition-colors">
                <td className="px-6 py-4 font-medium text-slate-800">
                  {score.course}
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  {score.credits}
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  {typeof score.midScore === "number"
                    ? score.midScore.toFixed(2)
                    : "-"}
                </td>
                <td className="px-6 py-4 text-center text-slate-600">
                  {typeof score.finalScore === "number"
                    ? score.finalScore.toFixed(2)
                    : "-"}
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`font-bold ${
                      score.score >= 8
                        ? "text-green-600"
                        : score.score >= 5
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {typeof score.score === "number"
                      ? score.score.toFixed(2)
                      : score.score}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span
                    className={`px-4 py-1 rounded-full text-sm font-semibold ${
                      score.status === "Đậu"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {score.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DetailedScoresTable;
