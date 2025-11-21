import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { fetchClassAverageGPA } from "../../utils/ClassLecturerApi";

interface GPAAverageClassProps {
  selectedClassName?: string | null;
  selectedSemesterDisplayName?: string | null; // Format: HK_x - yyyy-yyyy
}

export default function GPAAverageClass({
  selectedClassName,
  selectedSemesterDisplayName,
}: GPAAverageClassProps) {
  const [gpa, setGpa] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ignore = false;
    const load = async () => {
      if (!selectedClassName) {
        setGpa(null);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const value = await fetchClassAverageGPA(
          selectedClassName,
          selectedSemesterDisplayName || undefined
        );
        if (!ignore) setGpa(value);
      } catch (e) {
        if (!ignore) setError("Không thể tải GPA");
      } finally {
        if (!ignore) setLoading(false);
      }
    };
    load();
    return () => {
      ignore = true;
    };
  }, [selectedClassName, selectedSemesterDisplayName]);

  const normalizedPercent = gpa ? (gpa / 10) * 100 : 0;
  const displayValue = gpa !== null ? gpa.toFixed(2) : "--";

  const options: ApexOptions = {
    colors: ["#3B82F6"],
    chart: {
      fontFamily: "Inter, sans-serif",
      type: "radialBar",
      height: 330,
      sparkline: { enabled: true },
      animations: { enabled: false },
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
    fill: { type: "solid", colors: ["#3B82F6"] },
    stroke: { lineCap: "round" },
    labels: ["GPA"],
  };

  return (
    <div className="rounded-2xl bg-white shadow-md shadow-slate-200 p-5">
      <h4 className="text-lg font-semibold text-slate-800 mb-1">
        GPA Trung bình lớp
      </h4>
      {selectedClassName ? (
        <p className="text-xs text-slate-500 mb-2">
          Lớp: <span className="font-medium">{selectedClassName}</span>
          {selectedSemesterDisplayName && (
            <span>{" • " + selectedSemesterDisplayName}</span>
          )}
        </p>
      ) : (
        <p className="text-xs text-slate-500 mb-2">Chọn lớp để xem GPA</p>
      )}
      {loading ? (
        <div className="h-[280px] flex items-center justify-center">
          <span className="text-sm text-slate-500">Đang tải...</span>
        </div>
      ) : error ? (
        <div className="h-[280px] flex items-center justify-center">
          <span className="text-sm text-red-600">{error}</span>
        </div>
      ) : (
        <div className="max-h-[330px]">
          <Chart
            options={options}
            series={[normalizedPercent]}
            type="radialBar"
            height={280}
          />
          <p className="text-center text-xs text-slate-500 mt-2">
            {gpa !== null
              ? `GPA hiện tại: ${gpa.toFixed(2)} / 10`
              : "Không có dữ liệu"}
          </p>
        </div>
      )}
    </div>
  );
}
