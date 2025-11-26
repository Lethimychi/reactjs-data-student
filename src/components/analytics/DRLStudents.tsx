import React, { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { fetchStudentDRL } from "../../utils/StudentsLectures";

interface DRLStudentsProps {
  masv?: string | null;
}

export const DRLStudents: React.FC<DRLStudentsProps> = ({ masv }) => {
  const [drlData, setDrlData] = useState<
    Array<{ semester: string; score: number }>
  >([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!masv) {
      setDrlData([]);
      return;
    }

    const loadDRL = async () => {
      setLoading(true);
      try {
        const data = await fetchStudentDRL(masv);
        if (data && Array.isArray(data)) {
          const formatted = (data as Array<Record<string, unknown>>).map(
            (item) => ({
              semester: `${item["Ten Hoc Ky"]} - ${item["Ten Nam Hoc"]}`,
              score: Number(item["DRL"] ?? 0),
            })
          );
          setDrlData(formatted);
        } else {
          setDrlData([]);
        }
      } catch (error) {
        console.error("Error loading DRL data:", error);
        setDrlData([]);
      } finally {
        setLoading(false);
      }
    };

    loadDRL();
  }, [masv]);

  if (!masv) {
    return (
      <div className="bg-white rounded-lg p-4 border mt-6">
        <div className="text-lg font-semibold text-slate-700 mb-4">
          Điểm rèn luyện qua các kỳ
        </div>
        <div className="h-80 flex items-center justify-center text-slate-500">
          Chọn sinh viên để xem điểm rèn luyện
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-4 border mt-6">
      <div className="text-lg font-semibold text-slate-700 mb-4">
        Điểm rèn luyện qua các kỳ
      </div>
      {loading ? (
        <div className="h-80 flex items-center justify-center text-slate-500">
          Đang tải...
        </div>
      ) : drlData.length === 0 ? (
        <div className="h-80 flex items-center justify-center text-slate-500">
          Không có dữ liệu điểm rèn luyện
        </div>
      ) : (
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={drlData}
              margin={{ top: 8, right: 16, left: 8, bottom: 8 }}
              barCategoryGap="30%"
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" />
              <YAxis
                type="category"
                dataKey="semester"
                width={150}
                stroke="#64748b"
              />
              <Tooltip formatter={(v: number) => `${v.toFixed(2)} điểm`} />
              <Bar
                dataKey="score"
                name="Điểm rèn luyện"
                fill="#2563eb"
                barSize={30}
                radius={[0, 8, 8, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
};

export default DRLStudents;
