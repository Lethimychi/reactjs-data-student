import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import {
  fetchClassAverageGPA,
  fetchStudentGPAs,
  StudentGPARecord,
} from "../../utils/ClassLecturerApi";
import { COLORS } from "../../utils/colors";

interface GPAAverageClassProps {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null; // Format: HK_x - yyyy-yyyy
}

export default function GPAAverageClass({
  selectedClassName,
  selectedSemesterDisplayName,
}: GPAAverageClassProps) {
  const [gpa, setGpa] = useState<number | null>(null);
  const cls = selectedClassName ?? undefined;
  const sem = selectedSemesterDisplayName ?? undefined;

  const q = useQuery({
    queryKey: ["classAverageGPA", cls, sem],
    queryFn: async () => {
      const [value, studentRecords] = await Promise.all([
        fetchClassAverageGPA(cls, sem),
        fetchStudentGPAs(cls, sem),
      ]);
      return { value, studentRecords } as {
        value: number | null;
        studentRecords: StudentGPARecord[];
      };
    },
    enabled: !!cls && !!sem,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!cls || !sem) {
      setGpa(null);
      return;
    }

    if (q.isLoading) return;
    if (q.isError) {
      console.error(q.error);
      setGpa(null);
      return;
    }

    const payload = q.data as {
      value: number | null;
      studentRecords: StudentGPARecord[] | null;
    } | null;
    if (!payload) {
      setGpa(null);
      return;
    }
    const { value, studentRecords } = payload;
    const hasStudentGpa = Array.isArray(studentRecords)
      ? studentRecords.length > 0
      : false;
    setGpa(hasStudentGpa ? value : null);
  }, [cls, sem, q.isLoading, q.isError, q.data, q.error]);

  const normalizedPercent = gpa ? (gpa / 10) * 100 : 0;
  const displayValue = gpa !== null ? gpa.toFixed(2) : "--";

  const options: ApexOptions = {
    colors: [COLORS[1]],
    chart: {
      fontFamily: "Inter, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
    },
    plotOptions: {
      radialBar: {
        startAngle: -85,
        endAngle: 85,
        hollow: { size: "80%" },
        track: {
          background: "#E2E8F0",
          strokeWidth: "100%",
          margin: 5,
        },
        dataLabels: {
          name: { show: false },
          value: {
            fontSize: "34px",
            fontWeight: 600,
            offsetY: -40,
            color: "#1E293B",
            formatter: () => displayValue,
          },
        },
      },
    },
    fill: { type: "solid", colors: [COLORS[1]] },
    stroke: { lineCap: "round" },
    labels: ["GPA"],
  };

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-4 h-full flex flex-col">
      <div className="flex flex-wrap items-center gap-3 mb-1">
        <h4 className="text-lg font-semibold text-slate-800 m-0">
          GPA Trung bình lớp
        </h4>
        {selectedClassName && (
          <span className="text-xs text-slate-500">
            Lớp: <span className="font-medium">{selectedClassName}</span>
            {selectedSemesterDisplayName && (
              <span>{" • " + selectedSemesterDisplayName}</span>
            )}
          </span>
        )}
      </div>

      {q.isError ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-red-600">
            {String(q.error ?? "Không thể tải GPA")}
          </span>
        </div>
      ) : gpa === null ? (
        <div className="flex-1 flex items-center justify-center">
          <span className="text-sm text-slate-500">Không có dữ liệu</span>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center">
          <Chart
            options={options}
            series={[normalizedPercent]}
            type="radialBar"
            height={240}
          />
          <p className="text-center text-xs text-slate-500 mt-2">
            {`GPA hiện tại: ${gpa.toFixed(2)} / 10`}
          </p>
        </div>
      )}
    </div>
  );
}
